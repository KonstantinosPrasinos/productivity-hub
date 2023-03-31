import InputWrapper from '../../components/utilities/InputWrapper/InputWrapper';
import TextBoxInput from '../../components/inputs/TextBoxInput/TextBoxInput';
import {useContext, useEffect, useRef, useState} from 'react';
import ColorInput from "../../components/inputs/ColorInput/ColorInput";
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import {AlertsContext} from "../../context/AlertsContext";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import IconButton from "../../components/buttons/IconButton/IconButton";

import {TbPlus, TbX} from "react-icons/tb";

import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import CollapsibleContainer from "../../components/containers/CollapsibleContainer/CollapsibleContainer";
import Button from "../../components/buttons/Button/Button";
import customStyles from './NewCategory.module.scss';
import Chip from "../../components/buttons/Chip/Chip";
import TimePeriodInput from "../../components/inputs/TimeUnitInput/TimePeriodInput/TimePeriodInput";
import {useGetCategories} from "../../hooks/get-hooks/useGetCategories";
import {useGetGroups} from "../../hooks/get-hooks/useGetGroups";
import {findStartingDates} from "../../functions/findStartingDates";
import {useGetSettings} from "../../hooks/get-hooks/useGetSettings";
import {useAddCategory} from "../../hooks/add-hooks/useAddCategory";
import {useAddGroup} from "../../hooks/add-hooks/useAddGroup";
import {AnimatePresence, motion} from "framer-motion";

const NewCategory = ({index, length, id}) => {
    const {isLoading: categoriesLoading, data: categories} = useGetCategories();
    const {isLoading: groupsLoading, data: groups} = useGetGroups();
    const {data: settings} = useGetSettings();
    const alertsContext = useContext(AlertsContext);
    const {mutate: addCategoryToServer} = useAddCategory();
    const {mutate: addGroupToServer} = useAddGroup();
    const miniPagesContext = useContext(MiniPagesContext);
    const timePeriods = ['Days', 'Weeks', 'Months', 'Years']
    const [creatingTimeGroup, setCreatingTimeGroup] = useState(false);
    const currentEditedGroup = useRef();

    const [title, setTitle] = useState('');
    const [color, setColor] = useState('Red');
    const [timeGroups, setTimeGroups] = useState([]);

    const [timeGroupTitle, setTimeGroupTitle] = useState('');
    const [priority, setPriority] = useState(0);
    const [timeGroupNumber, setTimeGroupNumber] = useState(settings.defaults.priority);
    const [timePeriod, setTimePeriod] = useState('Weeks');
    const [timePeriod2, setTimePeriod2] = useState([]);

    const handleSave = async () => {
        const checkAllInputs = () => {
            if (!title) {
                alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You must input a title for the category"}})
                return false;
            } else if (categories.find(category => category.title === title) !== undefined) {
                alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "A category with that title already exists"}})
                return false;
            }

            return true;
        }

        if (categoriesLoading) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "warning", message: "Categories currently loading"}})
        }

        if (creatingTimeGroup) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You have unsaved time group changes"}})
            return false;
        }

        if (checkAllInputs()) {
            const category = {
                title,
                color,
            }

            // if (id) {
            //
            //     for (const group of groups) {
            //         // Do set group things
            //     }
            //
            // } else {
            //     await addCategoryToServer(category, {onSuccess: (data) => {
            //             // if (error) return;
            //             for (index in timeGroups) {
            //                 delete timeGroups[index].initial
            //                 timeGroups[index].parent = data._id;
            //
            //                 addGroupToServer(timeGroups[index]);
            //             }
            //         }});
            //     for (index in timeGroups) {
            //         // delete timeGroups[index].initial
            //
            //         // await addGroupToServer(timeGroups[index]);
            //     }
            //
            //
            // }

            // for (const group of timeGroups) {
            //     if (group.priority < settings.priorityBounds.low) {
            //         dispatch(setLowestPriority(group.priority));
            //     }
            //     if (group.priority > settings.priorityBounds.high) {
            //         dispatch(setHighestPriority(group.priority));
            //     }
            //
            //     if (id && group.initial) {
            //         dispatch(setGroup(tempGroup));
            //     } else {
            //         await addCategoryToServer()
            //     }
            // }

            miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''})
        }
    }

    const resetTimeGroupInputs = () => {
        setTimeGroupTitle('');
        setTimeGroupNumber(1);
        setTimePeriod('Weeks');
        setTimePeriod2(null);
        setPriority(settings.defaults.priority);
    }

    const getGroupId = () => {
        if (timeGroups.length === 0) {
            return 0;
        }

        for (let i = 0; i <= timeGroups.length; i++) {
            if (!timeGroups.find(group => group.id === i)) {
                return i;
            }
        }
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

        const id = currentEditedGroup.current?.id ?? getGroupId();

        const startingDates = findStartingDates(timePeriod, timePeriod2);

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

    const handleKeyDown = (e) => {
        if (e.code === 'Enter') {
            handleSave();
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
            // dispatch(removeGroup(group.id));
        }
    }

    const handleCancel = () => {
        resetTimeGroupInputs();
        currentEditedGroup.current = null;
        setCreatingTimeGroup(false);
    }

    useEffect(() => {
        if (!categoriesLoading && !groupsLoading && id) {
            const category = categories?.find(category => category.id === id);

            setTitle(category.title);
            setColor(category.color);
            setTimeGroups(groups.filter(group => group.parent === category.id).map(group => {return {...group, initial: true}}));
        }
    }, [categoriesLoading, groupsLoading])

    return (
        <MiniPageContainer
            onClickSave={handleSave}
            index={index}
            length={length}
        >
            <input
                type="text"
                className="Title-Large"
                placeholder="Add category title" value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <InputWrapper label="Color">
                <ColorInput selected={color} setSelected={setColor}/>
            </InputWrapper>
            <InputWrapper label="Time Groups">
                <div className={customStyles.groupsContainer}>
                    <div className={customStyles.addGroupButton}>
                        <IconButton border={true} onClick={() => setCreatingTimeGroup(state => !state)}>
                            <TbPlus/>
                        </IconButton>
                    </div>
                    <AnimatePresence mode={"popLayout"}>
                        {timeGroups.map((group) => (
                            <motion.div
                                layout
                                key={group.id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                            >
                                <Chip type={'icon'} style={'round'} onClick={(e) => {handleGroupClick(e, group)}}>
                                    {group.title}
                                    <IconButton onClick={() => handleDelete(group)}><TbX /></IconButton>
                                </Chip>
                            </motion.div>
                        ))}
                    </AnimatePresence>
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
                    <DropDownInput placeholder={'Weeks'} selected={timePeriod} setSelected={setTimePeriod}>
                        {timePeriods.map(tempTimePeriod => (tempTimePeriod))}
                    </DropDownInput>
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