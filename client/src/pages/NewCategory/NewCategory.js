import InputWrapper from '../../components/utilities/InputWrapper/InputWrapper';
import TextBoxInput from '../../components/inputs/TextBoxInput/TextBoxInput';
import {useContext, useState} from 'react';
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
import {addGroup} from "../../state/groupsSlice";

const NewCategory = ({index, length}) => {
    const groups = useSelector((state) => state.groups.groups);
    const {defaults} = useSelector((state) => state.user.settings);
    const alertsContext = useContext(AlertsContext);
    const dispatch = useDispatch();
    const miniPagesContext = useContext(MiniPagesContext);
    const timePeriods = ['Days', 'Weeks', 'Months', 'Years']
    const [creatingTimeGroup, setCreatingTimeGroup] = useState(false);

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

        if (checkAllInputs()) {
            const category = {
                name,
                color,
                timeGroups
            }

            dispatch(addCategory(category));
            miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''})
        }
    }

    const resetTimeGroupInputs = () => {
        setTimeGroupTitle('');
        setTimeGroupNumber(1);
        setTimePeriod('Weeks');
        setTimePeriod2(null);
        setPriority(defaults.defaultPriority);

        setCreatingTimeGroup(false);
    }

    const handleTimeGroupSave = () => {
        if (!timeGroupTitle || !timeGroupNumber || !timePeriod) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "All time group fields must be filled"}})
            return;
        }

        if (timeGroups.find(group => group.title === timeGroupTitle))  {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Time group title must be unique"}})
            return;
        }

        if (timePeriod !== 'Days' && !timePeriod2) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You must select at least one day"}})
            return;
        }

        let idIsValid = true;
        let id;

        do {
            id = uuidv4();
            idIsValid = !groups.find(group => group.id === id);
        } while (idIsValid === false);

        const timeGroup = {
            id,
            title: timeGroupTitle,
            priority,
            number: timeGroupNumber,
            bigTimePeriod: timePeriod,
            smallTimePeriod: timePeriod2
        }

        setTimeGroups([...timeGroups, {id, title: timeGroupTitle}]);
        dispatch(addGroup(timeGroup));
        resetTimeGroupInputs();
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
                {timeGroups.map(group => (<div key={group}>{group.title}</div>))}
                <IconButton border={true} onClick={() => setCreatingTimeGroup(state => !state)}>
                    <AddIcon/>
                </IconButton>
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
                    <Button filled={false} onClick={resetTimeGroupInputs}>Cancel</Button>
                    <Button onClick={handleTimeGroupSave}>Save</Button>
                </div>
            </CollapsibleContainer>
        </MiniPageContainer>);
}

export default NewCategory;