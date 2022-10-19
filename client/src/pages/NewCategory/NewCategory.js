import InputWrapper from '../../components/utilities/InputWrapper/InputWrapper';
import TextBoxInput from '../../components/inputs/TextBoxInput/TextBoxInput';
import {useContext, useEffect, useRef, useState} from 'react';
import ColorInput from "../../components/inputs/ColorInput/ColorInput";
import MiniPageContainer from "../../components/utilities/MiniPagesContainer/MiniPageContainer";
import {AlertsContext} from "../../context/AlertsContext";
import {addCategory, setCategory} from "../../state/categoriesSlice";
import {useDispatch, useSelector} from "react-redux";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import IconButton from "../../components/buttons/IconButton/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import CollapsibleContainer from "../../components/utilities/CollapsibleContainer/CollapsibleContainer";
import Button from "../../components/buttons/Button/Button";
import {v4 as uuidv4} from "uuid";
import customStyles from './NewCategory.module.scss';
import {addGroup, removeGroup, setGroup} from "../../state/groupsSlice";
import Chip from "../../components/buttons/Chip/Chip";
import CloseIcon from "@mui/icons-material/Close";
import {setHighestPriority, setLowestPriority} from "../../state/userSlice";
import TimePeriodInput from "../../components/inputs/TimeUnitInput/TimePeriodInput/TimePeriodInput";

const NewCategory = ({index, length, id}) => {
    const categories = useSelector(state => state?.categories.categories);
    const groups = useSelector((state) => state?.groups.groups);
    const {defaults} = useSelector((state) => state?.user.settings);
    const {low, high} = useSelector((state) => state?.user.priorityBounds);
    const alertsContext = useContext(AlertsContext);
    const dispatch = useDispatch();
    const miniPagesContext = useContext(MiniPagesContext);
    const timePeriods = ['Days', 'Weeks', 'Months', 'Years']
    const [creatingTimeGroup, setCreatingTimeGroup] = useState(false);
    const currentEditedGroup = useRef();

    const [title, setTitle] = useState('');
    const [color, setColor] = useState('Red');
    const [timeGroups, setTimeGroups] = useState([]);

    const [timeGroupTitle, setTimeGroupTitle] = useState('');
    const [priority, setPriority] = useState(0);
    const [timeGroupNumber, setTimeGroupNumber] = useState(defaults.priority);
    const [timePeriod, setTimePeriod] = useState('Weeks');
    const [timePeriod2, setTimePeriod2] = useState([]);

    const handleSave = () => {
        const checkAllInputs = () => {
            if (title) return true
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You must input a title for the category"}})
            return false;
        }

        if (creatingTimeGroup) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You have unsaved time group changes"}})
            return false;
        }

        if (checkAllInputs()) {
            let localId;

            if (id) {
                localId = id;
            } else {
                let idIsValid = true;

                do {
                    localId = uuidv4();
                    idIsValid = !categories.find(category => category.id === localId);
                } while (idIsValid === false);
            }

            const category = {
                id: localId,
                title,
                color,
                timeGroups,
            }

            if (id) {
                dispatch(setCategory(category));
            } else {
                dispatch(addCategory(category));
            }

            timeGroups.forEach(group => {
                if (group.priority < low) {
                    dispatch(setLowestPriority(group.priority));
                }
                if (group.priority > high) {
                    dispatch(setHighestPriority(group.priority));
                }

                const tempGroup = {
                    ...group,
                    parent: localId
                }

                delete tempGroup.initial;

                if (id && group.initial) {
                    dispatch(setGroup(tempGroup));
                } else {
                    dispatch(addGroup(tempGroup));
                }
            })

            miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''})
        }
    }

    const resetTimeGroupInputs = () => {
        setTimeGroupTitle('');
        setTimeGroupNumber(1);
        setTimePeriod('Weeks');
        setTimePeriod2(null);
        setPriority(defaults.priority);
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

        let startingDates = [];
        
        timePeriod2.forEach(smallTimePeriod => {
            let startingDate = new Date();

            switch (timePeriod) {
                case 'Days':
                    break;
                case 'Weeks':
                    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

                    const weekDaysDifference = days.findIndex(day => day === smallTimePeriod) + 1 - startingDate.getDay();
                    startingDate.setDate(startingDate.getDate() + weekDaysDifference);
                    break;
                case 'Months':
                    startingDate.setDate(smallTimePeriod?.getDate());
                    break;
                case 'Years':
                    startingDate.setTime(smallTimePeriod?.getTime());
                    break;
            }
            startingDate.setHours(0, 0, 0, 0);
            startingDates.push(startingDate.getTime());
        });

        const timeGroup = {
            id,
            title: timeGroupTitle,
            priority,
            repeatRate: {
                number: timeGroupNumber,
                bigTimePeriod: timePeriod,
                smallTimePeriod: timePeriod2,
                startingDate: startingDates
            },
            parent: null,
            initial: currentEditedGroup.current?.initial
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
        setTimeGroupNumber(group.repeatRate.number);
        setTimePeriod(group.repeatRate.bigTimePeriod);
        setTimePeriod2(group.repeatRate.smallTimePeriod);

        currentEditedGroup.current = group;
    }

    const handleDelete = (group) => {
        if (group.id === currentEditedGroup.current?.id) {
            resetTimeGroupInputs();
            currentEditedGroup.current = null;
            setCreatingTimeGroup(false);
        }

        setTimeGroups(timeGroups.filter(filterGroup => filterGroup.id !== group.id));
        if (group.initial) {
            dispatch(removeGroup(group.id));
        }
    }

    const handleCancel = () => {
        resetTimeGroupInputs();
        currentEditedGroup.current = null;
        setCreatingTimeGroup(false);
    }

    useEffect(() => {
        if (id) {
            const category = categories.find(category => category.id === id);

            setTitle(category.title);
            setColor(category.color);
            setTimeGroups(groups.filter(group => group.parent === category.id).map(group => {return {...group, initial: true}}));
        }
    }, [])

    return (
        <MiniPageContainer
            onClickSave={handleSave}
            index={index}
            length={length}
        >
            <input type="text" className="Title Title-Input" placeholder="Add category title" value={title} onChange={(e) => setTitle(e.target.value)}/>
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
                    <TimePeriodInput timePeriod={timePeriod} timePeriod2={timePeriod2} setTimePeriod2={setTimePeriod2} />
                </InputWrapper>}
                <div className={customStyles.bottomButtonsContainer}>
                    <Button filled={false} onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleTimeGroupSave}>Save</Button>
                </div>
            </CollapsibleContainer>
        </MiniPageContainer>);
}

export default NewCategory;