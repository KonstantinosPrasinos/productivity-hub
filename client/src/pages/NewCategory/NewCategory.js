import InputWrapper from '../../components/utilities/InputWrapper/InputWrapper';
import TextBoxInput from '../../components/inputs/TextBoxInput/TextBoxInput';
import {useContext, useRef, useState} from 'react';
import ColorInput from "../../components/inputs/ColorInput/ColorInput";
import MiniPageContainer from "../../components/utilities/MiniPagesContainer/MiniPageContainer";
import {AlertsContext} from "../../context/AlertsContext";
import {addCategory} from "../../state/categoriesSlice";
import {useDispatch, useSelector} from "react-redux";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import IconButton from "../../components/buttons/IconButton/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import {DayPicker} from "react-day-picker";
import styles from 'react-day-picker/dist/style.module.css';
import WeekDayInput from "../../components/inputs/TimeUnitInput/WeekDayInput/WeekDayInput";

import customStyles from './NewCategory.module.scss';
import CollapsibleContainer from "../../components/utilities/CollapsibleContainer/CollapsibleContainer";
import Button from "../../components/buttons/Button/Button";
import {v4 as uuidv4} from "uuid";
import {addGroup, removeGroup} from "../../state/groupsSlice";
import Chip from "../../components/buttons/Chip/Chip";
import CloseIcon from "@mui/icons-material/Close";

const NewCategory = ({index, length}) => {
    const groups = useSelector((state) => state.groups.groups);
    const {defaults} = useSelector((state) => state.user.settings);
    const alertsContext = useContext(AlertsContext);
    const dispatch = useDispatch();
    const miniPagesContext = useContext(MiniPagesContext);
    const timePeriods = ['Days', 'Weeks', 'Months', 'Years']
    const [creatingTimeGroup, setCreatingTimeGroup] = useState(false);
    const currentEditedGroup = useRef();

    const [name, setName] = useState('');
    const [color, setColor] = useState('Red');
    const [timeGroups, setTimeGroups] = useState([]);

    const [timeGroupTitle, setTimeGroupTitle] = useState('');
    const [priority, setPriority] = useState(0);
    const [timeGroupNumber, setTimeGroupNumber] = useState(defaults.defaultPriority);
    const [timePeriod, setTimePeriod] = useState('Weeks');
    const [timePeriod2, setTimePeriod2] = useState();

    const handleSave = () => {
        const checkAllInputs = () => {
            if (name) return true
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You must input a title for the category"}})
            return false;
        }

        if (creatingTimeGroup) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You have unsaved time group changes"}})
            return false;
        }

        if (checkAllInputs()) {
            const category = {
                name,
                color,
                timeGroups,
            }

            dispatch(addCategory(category));

            timeGroups.forEach(group => {
                const tempGroup = {
                    ...group,
                    parent: name
                }
                console.log(tempGroup);
                dispatch(addGroup(tempGroup));
            })

            miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''})
        }
    }

    const resetTimeGroupInputs = () => {
        setTimeGroupTitle('');
        setTimeGroupNumber(1);
        setTimePeriod('Weeks');
        setTimePeriod2(null);
        setPriority(defaults.defaultPriority);
    }

    const handleTimeGroupSave = () => {
        if (!timeGroupTitle || !timeGroupNumber || !timePeriod) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "All time group fields must be filled"}})
            return;
        }

        if (timeGroupTitle !== currentEditedGroup.current?.title && timeGroups.find(group => group.title === timeGroupTitle))  {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Time group title must be unique"}})
            return;
        }

        if (timePeriod !== 'Days' && !timePeriod2) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You must select at least one day"}})
            return;
        }

        let id;

        if (!currentEditedGroup.current) {
            let idIsValid = true;

            do {
                id = uuidv4();
                idIsValid = !groups.find(group => group.id === id);
            } while (idIsValid === false);
        } else {
            id = currentEditedGroup.current?.id;
        }

        const timeGroup = {
            id,
            title: timeGroupTitle,
            priority,
            number: timeGroupNumber,
            bigTimePeriod: timePeriod,
            smallTimePeriod: timePeriod2,
            parent: null
        }

        if (currentEditedGroup.current) {
            setTimeGroups(timeGroups.map(group => {
                if (group.id === timeGroup.id) {
                    return timeGroup;
                } else {
                    return group;
                }
            }))
        } else {
            setTimeGroups([...timeGroups, timeGroup]);
        }

        resetTimeGroupInputs();
        currentEditedGroup.current = null;
        setCreatingTimeGroup(false);
    }

    const formatCaption = (month) => {
        return (<div>{month.toLocaleDateString('default', {month: 'long'})}</div>)
    }

    const classNames = {
        ...styles,
        root: customStyles.calendarRoot,
        day_selected: customStyles.calendarSelected,
        day: customStyles.calendarDay
    }

    const renderTimePeriodInput = () => {
        switch (timePeriod) {
            case 'Days':
                return;
            case 'Weeks':
                return (<WeekDayInput selected={timePeriod2} setSelected={setTimePeriod2}></WeekDayInput>)
            case 'Months':
                return (<DayPicker
                    mode="multiple"
                    styles={{caption: {display: 'none'}}}
                    selected={timePeriod2}
                    onSelect={setTimePeriod2}
                    defaultMonth={new Date(2022, 4)}
                    classNames={classNames}
                />)
            case 'Years':
                return (<DayPicker
                    mode="multiple"
                    styles={{caption_label: {zIndex: 'auto'}}}
                    selected={timePeriod2}
                    onSelect={setTimePeriod2}
                    fromDate={new Date(2022, 0)}
                    toDate={new Date(2022, 11, 31)}
                    formatters={{ formatCaption }}
                    defaultMonth={new Date(2022, 0)}
                    classNames={classNames}
                />)
        }
    }

    const handleGroupClick = (e, group) => {
        // If target is icon then stop the event
        if (e.target !== e.currentTarget) {
            e.stopPropagation();
            return;
        }

        // Show time group inputs
        setCreatingTimeGroup(true);

        // Reset time group inputs
        resetTimeGroupInputs();

        // Populate time group inputs
        setTimeGroupTitle(group.title);
        setPriority(group.priority);
        setTimeGroupNumber(group.number);
        setTimePeriod(group.bigTimePeriod);
        setTimePeriod2(group.smallTimePeriod);

        currentEditedGroup.current = group;
    }

    const handleDelete = (group) => {
        if (group.id === currentEditedGroup.current?.id) {
            resetTimeGroupInputs();
            currentEditedGroup.current = null;
            setCreatingTimeGroup(false);
        }

        setTimeGroups(timeGroups.filter(filterGroup => filterGroup.id !== group.id));
        dispatch(removeGroup(group.id));
    }

    const handleCancel = () => {
        resetTimeGroupInputs();
        currentEditedGroup.current = null;
        setCreatingTimeGroup(false);
    }

    return (
        <MiniPageContainer
            onClickSave={handleSave}
            index={index}
            length={length}
        >
            <input type="text" className="Title Title-Input" placeholder="Add category name" value={name} onChange={(e) => setName(e.target.value)}/>
            <InputWrapper label="Color">
                <ColorInput selected={color} setSelected={setColor}/>
            </InputWrapper>
            <InputWrapper label="Time Groups">
                <div className={customStyles.groupsContainer}>
                    <IconButton border={true} onClick={() => setCreatingTimeGroup(state => !state)}>
                        <AddIcon/>
                    </IconButton>
                    {timeGroups.map(group => (<Chip key={group.id} type={'icon'} style={'round'} onClick={(e) => {handleGroupClick(e, group)}}>
                        {group.title}
                        <IconButton onClick={() => handleDelete(group)}><CloseIcon /></IconButton>
                    </Chip>))}
                </div>
            </InputWrapper>

            <CollapsibleContainer isVisible={creatingTimeGroup}>
                <InputWrapper label={'Title'}>
                    <TextBoxInput placeholder="Title" value={timeGroupTitle} setValue={setTimeGroupTitle}/>
                </InputWrapper>
                <InputWrapper label={'Priority'}>
                    <TextBoxInput type='number' placeholder="Number" value={priority} setValue={setPriority}/>
                </InputWrapper>
                <InputWrapper label={'Repeat every'}>
                    <TextBoxInput type="number" placeholder="Number" value={timeGroupNumber} setValue={setTimeGroupNumber}/>
                </InputWrapper>
                <InputWrapper label={'Time period'}>
                    <DropDownInput placeholder={'Weeks'} options={timePeriods} selected={timePeriod} setSelected={setTimePeriod}></DropDownInput>
                </InputWrapper>
                {timePeriod !== 'Days' && <InputWrapper label={'On'}>
                    {renderTimePeriodInput()}
                </InputWrapper>}
                <div className={customStyles.bottomButtonsContainer}>
                    <Button filled={false} onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleTimeGroupSave}>Save</Button>
                </div>
            </CollapsibleContainer>
        </MiniPageContainer>);
}

export default NewCategory;