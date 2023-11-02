import InputWrapper from '../../components/utilities/InputWrapper/InputWrapper';
import TextBoxInput from '../../components/inputs/TextBoxInput/TextBoxInput';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import ColorInput from "../../components/inputs/ColorInput/ColorInput";
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import {AlertsContext} from "../../context/AlertsContext";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import IconButton from "../../components/buttons/IconButton/IconButton";

import {TbPlus, TbX} from "react-icons/tb";

import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import Button from "../../components/buttons/Button/Button";
import styles from './NewCategory.module.scss';
import Chip from "../../components/buttons/Chip/Chip";
import TimePeriodModal from "@/components/inputs/TimePeriodModal/TimePeriodModal";
import {useGetCategories} from "../../hooks/get-hooks/useGetCategories";
import {useGetGroups} from "../../hooks/get-hooks/useGetGroups";
import {findStartingDates} from "../../functions/findStartingDates";
import {useGetSettings} from "../../hooks/get-hooks/useGetSettings";
import {useAddCategory} from "../../hooks/add-hooks/useAddCategory";
import {AnimatePresence, motion} from "framer-motion";
import ConfirmDeleteGroupModal from "../../components/utilities/ConfirmDeleteGroupModal/ConfirmDeleteGroupModal";
import {useChangeCategory} from "../../hooks/change-hooks/useChangeCategory";
import HeaderExtendContainer from "@/components/containers/HeaderExtendContainer/HeaderExtendContainer";
import ToggleButton from "@/components/buttons/ToggleButton/ToggleButton";
import TimeInput from "@/components/inputs/TimeInput/TimeInput";
import Divider from "@/components/utilities/Divider/Divider";

const NewCategory = ({index, length, id}) => {
    const {isLoading: categoriesLoading, data: categories} = useGetCategories();
    const {isLoading: groupsLoading, data: groups} = useGetGroups();
    const {data: settings} = useGetSettings();
    const alertsContext = useContext(AlertsContext);
    const miniPagesContext = useContext(MiniPagesContext);
    const timePeriods = ['Days', 'Weeks', 'Months', 'Years']
    const goalTypes = ['Streak', 'Total completed'];
    const goalLimits = ['At most', 'Exactly', 'At least'];

    const [creatingTimeGroup, setCreatingTimeGroup] = useState(false);
    const currentEditedGroup = useRef();

    const [title, setTitle] = useState('');
    const [color, setColor] = useState('Red');
    const [timeGroups, setTimeGroups] = useState([]);

    const [timeGroupTitle, setTimeGroupTitle] = useState('');
    const [priority, setPriority] = useState(0);
    const [hasTime, setHasTime] = useState(false);
    const [startHour, setStartHour] = useState('00');
    const [startMinute, setStartMinute] = useState('00');
    const [endHour, setEndHour] = useState('23');
    const [endMinute, setEndMinute] = useState('59');
    const [timeGroupNumber, setTimeGroupNumber] = useState(settings.defaults.priority);
    const [timePeriod, setTimePeriod] = useState('Weeks');
    const [timePeriod2, setTimePeriod2] = useState([]);

    const [hasLongGoal, setHasLongGoal] = useState(false);
    const [longGoalLimit, setLongGoalLimit] = useState('At least');
    const [longGoalNumber, setLongGoalNumber] = useState(settings.defaults.goal);
    const [longGoalType, setLongGoalType] = useState("Streak");

    const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);

    const {mutate: addCategoryToServer} = useAddCategory();
    const {mutateAsync: changeCategory, isLoading: changeCategoryLoading} = useChangeCategory();

    const continueAfterModalFunctionRef = useRef();
    const initialCategoryValues = useRef();

    const [visibleTimePeriodModal, setVisibleTimePeriodModal] = useState(false);

    const timeGroupList = useMemo(() => {
        if (timeGroups.filter(group => group?.deleted !== true).length === 0)
            return [{
                _id: -1,
                title: "None"
            }]
        return timeGroups.filter(group => group?.deleted !== true);
    }, [timeGroups]);

    const getGroupTitlesForDeletion = () => {
        const groupsForDeletion = [];

        for (const group of timeGroups) {
            if (group?.deleted) {
                groupsForDeletion.push(group.title);
            }
        }

        return groupsForDeletion;
    }

    const handleAddTimeGroup = () => {
        setCreatingTimeGroup(current => !current);
    }

    const handleSave = async () => {
        const checkAllInputs = () => {
            if (!title) {
                alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You must input a title for the category"}})
                return false;
            } else if (!id && categories.find(category => category.title === title) !== undefined) {
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
                color
            }

            if (id) {
                const groupsForDeletion = [];
                const groupsForEdit = [];
                const newGroups = [];

                // Get edited and deleted groups
                for (const group of timeGroups) {
                    if (group?.deleted) {
                        groupsForDeletion.push(group._id);
                    } else if (group?.edited) {
                        delete group.edited;
                        groupsForEdit.push(group);
                    } else if (group?.isNew) {
                        delete group._id;
                        delete group.isNew;
                        newGroups.push(group);
                    }
                }

                const continueAfterModalFunction = async (action = settings.defaults.deleteGroupAction) => {
                    const requestObject = {action};

                    if (groupsForDeletion.length) {
                        requestObject.groupsForDeletion = groupsForDeletion
                    }

                    if (groupsForEdit.length > 0) {
                        requestObject.groupsForEdit = groupsForEdit;
                    }

                    if (newGroups.length > 0) {
                        requestObject.newGroups = newGroups;
                        requestObject.parentId = id;
                    }

                    if (initialCategoryValues.current?.title !== category.title || initialCategoryValues.current?.color !== category.color) {
                        requestObject.category = {...category, _id: id};
                    }

                    await changeCategory(requestObject);

                    miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''});
                }

                if (groupsForDeletion.length) {
                    if (settings.confirmDelete) {
                        toggleConfirmModal()
                        continueAfterModalFunctionRef.current = continueAfterModalFunction;
                    } else {
                        await continueAfterModalFunction();
                    }
                } else {
                    await continueAfterModalFunction();
                }

            } else {
                await addCategoryToServer(
                    {
                        category,
                        groups: timeGroups.map(timeGroup => {
                            return {...timeGroup, _id: undefined}
                        })
                    });

                miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''});
            }
        }
    }

    const resetTimeGroupInputs = () => {
        setTimeGroupTitle('');
        setPriority(settings.defaults.priority);

        setTimeGroupNumber(1);
        setTimePeriod('Weeks');
        setTimePeriod2(null);

        setHasTime(false);
        setStartHour("00");
        setStartMinute("00");
        setEndHour("23");
        setEndMinute("59");

        setHasLongGoal(false);
        setLongGoalType("At least");
        setLongGoalNumber(settings.defaults.goal);
        setLongGoalLimit("Streak");
    }

    const getGroupId = () => {
        if (timeGroups.length === 0) {
            return 0;
        }

        for (let i = 0; i <= timeGroups.length; i++) {
            if (!timeGroups.find(group => group._id === i)) {
                return i;
            }
        }
    }

    const handleTimeGroupSave = () => {
        // Restrictions based on title
        // Has title
        if (!timeGroupTitle) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Time group title must be filled"}})
            return;
        }

        // Unique title (in category)
        if (timeGroupTitle !== currentEditedGroup.current?.title && timeGroups.find(group => group.title === timeGroupTitle && !group?.deleted))  {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Time group title must be unique for this category"}})
            return;
        }

        // At least one day must be selected
        if (timePeriod !== 'Days' && !timePeriod2) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You must select at least one day"}})
            return;
        }


        const newId = currentEditedGroup.current?._id ?? getGroupId();

        const startingDates = findStartingDates(timePeriod, timePeriod2);

        const timeGroup = {
            _id: newId,
            title: timeGroupTitle,
            priority,
            repeatRate: {
                number: timeGroupNumber,
                bigTimePeriod: timePeriod,
                smallTimePeriod: timePeriod2,
                startingDate: startingDates
            },
            initial: currentEditedGroup.current?.initial,
        }

        if (hasTime) {
            if (
                endHour !== "00" &&
                (
                    (parseInt(startHour) < parseInt(endHour)) ||
                    (
                        parseInt(startHour) === parseInt(endHour) &&
                        parseInt(startMinute) < parseInt(endMinute)
                    )
                )
            ) {
                timeGroup.repeatRate.time = {
                    start: startHour.concat(startMinute),
                    end: endHour.concat(endMinute)
                }
            } else {
                alertsContext.dispatch({
                    type: "ADD_ALERT",
                    payload: {
                        type: "error",
                        message: "The \"from\" time must be before the \"after\" time."
                    }
                })
                return;
            }
        }

        if (hasLongGoal) {
            timeGroup.goal = {
                type: longGoalType,
                limit: longGoalLimit,
                number: longGoalNumber
            }
        }

        if (currentEditedGroup.current?._id !== undefined) {
            // For editing
            setTimeGroups(timeGroups.map(group => {
                if (group._id === timeGroup._id) {
                    return {...timeGroup, edited: true};
                } else {
                    return group;
                }
            }))
        } else {
            if (id) {
                timeGroup.isNew = true;
            }
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

        // Populate time group inputs
        setTimeGroupTitle(group.title);
        setPriority(group.priority);

        setTimeGroupNumber(group.repeatRate.number);
        setTimePeriod(group.repeatRate.bigTimePeriod);
        setTimePeriod2(group.repeatRate.smallTimePeriod);

        if (group.repeatRate?.time) {
            setHasTime(true);
            setStartHour(group.repeatRate.time.start.substring(0, 2));
            setStartMinute(group.repeatRate.time.start.substring(2, 4));
            setEndHour(group.repeatRate.time.end.substring(0, 2));
            setEndMinute(group.repeatRate.time.end.substring(2, 4));
        } else {
            // Default values
            setHasTime(false);
            setStartHour("00");
            setStartMinute("00");
            setEndHour("23");
            setEndMinute("59");
        }

        if (group?.goal) {
            setHasLongGoal(true);
            setLongGoalType(group.goal.type);
            setLongGoalLimit(group.goal.limit);
            setLongGoalNumber(group.goal.number);
        } else {
            // Default values
            setHasLongGoal(false);
            setLongGoalType("At least");
            setLongGoalNumber(settings.defaults.goal);
            setLongGoalLimit("Streak");
        }

        currentEditedGroup.current = group;
    }

    const handleDelete = (group) => {
        if (group._id === currentEditedGroup.current?._id) {
            resetTimeGroupInputs();
            currentEditedGroup.current = null;
            setCreatingTimeGroup(false);
        }

        if (!id) {
            setTimeGroups(current => current.filter(filterGroup => filterGroup._id !== group._id));
        } else {
            setTimeGroups(timeGroups.map(tempGroup => {
                if (tempGroup._id === group._id) {
                    return {...tempGroup, deleted: true};
                }
                return tempGroup;
            }))
        }
    }

    const handleCancel = () => {
        resetTimeGroupInputs();
        currentEditedGroup.current = null;
        setCreatingTimeGroup(false);
    }

    const toggleConfirmModal = () => {
        setConfirmDeleteModalVisible(current => !current);
    }
    
    const toggleTimePeriodModal = () => {
        setVisibleTimePeriodModal(current => !current);
    }

    const handleTimePeriodInput = (tempTimePeriod) => {
        // Time period resets time period 2
        if (tempTimePeriod !== timePeriod) {
            setTimePeriod2([]);
        }

        setTimePeriod(tempTimePeriod);
    }

    useEffect(() => {
        if (!categoriesLoading && !groupsLoading && id) {
            const category = categories?.find(category => category._id === id);

            setTitle(category.title);
            setColor(category.color);
            setTimeGroups(groups?.filter(group => group.parent === category._id)?.map(group => {return {...group, initial: true}}));
            initialCategoryValues.current = category;
        }
    }, [categoriesLoading, groupsLoading])

    const disabledSaveGroupButton = useMemo(() => {
        if (!timeGroupTitle) return true;
        if (timePeriod2.length === 0) return true;
        if (priority.toString().length === 0) return true;
        if (timeGroupNumber.toString().length === 0) return true;
        if (hasLongGoal && longGoalNumber.toString().length === 0) return true;

        return false;
    }, [timePeriod2, timeGroupTitle, priority, timeGroupNumber]);

    return (
        <>
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
                <HeaderExtendContainer
                    header={<div className={"Stack-Container"}>
                        <InputWrapper label="Time Groups">
                            <div className={styles.groupTitlesContainer}>
                                <Button filled={true} symmetrical={true} onClick={handleAddTimeGroup}><TbPlus /></Button>
                                <AnimatePresence mode={"popLayout"}>
                                    {timeGroupList.map((group) => (
                                        <motion.div
                                            layout
                                            key={group._id}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                        >
                                            <Chip type={'icon'} onClick={(e) => {handleGroupClick(e, group)}} size={"small"}>
                                                {group.title}
                                                {group._id !== -1 &&
                                                    <IconButton onClick={() => handleDelete(group)}>
                                                        <TbX />
                                                    </IconButton>
                                                }
                                            </Chip>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </InputWrapper>
                    </div>}
                    extendedInherited={creatingTimeGroup}
                    setExtendedInherited={handleAddTimeGroup}
                    hasPointer={false}
                    extendOnClick={false}
                >
                    <Divider />
                    <InputWrapper label={'Title'}>
                        <TextBoxInput placeholder="Title" value={timeGroupTitle} setValue={setTimeGroupTitle}/>
                    </InputWrapper>
                    <InputWrapper label={'Priority'}>
                        <TextBoxInput type='number' placeholder="Number" value={priority} setValue={setPriority} />
                    </InputWrapper>
                    <Divider />
                    <InputWrapper label={"Repeat between certain times"}>
                        <ToggleButton isToggled={hasTime} setIsToggled={setHasTime} />
                    </InputWrapper>
                    <InputWrapper label={"From - To"}>
                        <TimeInput
                            hour={startHour}
                            setHour={setStartHour}
                            minute={startMinute}
                            setMinute={setStartMinute}
                            isDisabled={!hasTime}
                        />
                        -
                        <TimeInput
                            hour={endHour}
                            setHour={setEndHour}
                            minute={endMinute}
                            setMinute={setEndMinute}
                            isDisabled={!hasTime}
                        />
                    </InputWrapper>
                    <InputWrapper label={'Repeat every'}>
                        <TextBoxInput type='number' placeholder="Number" value={timeGroupNumber} setValue={setTimeGroupNumber} minNumber={1} />
                        <DropDownInput placeholder={'Weeks'} selected={timePeriod}>
                            {timePeriods.map(tempTimePeriod =>
                                <button key={tempTimePeriod} onClick={() => handleTimePeriodInput(tempTimePeriod)}>{tempTimePeriod}</button>
                            )}
                        </DropDownInput>
                    </InputWrapper>
                    <InputWrapper label={'On'}>
                        <Button onClick={toggleTimePeriodModal} disabled={timePeriod === "Days"}>Select dates</Button>
                    </InputWrapper>
                    <Divider />
                    <InputWrapper label={"Has goal"}>
                        <ToggleButton isToggled={hasLongGoal} setIsToggled={setHasLongGoal} />
                    </InputWrapper>
                    <InputWrapper label={"Type"}>
                        <DropDownInput
                            placeholder={'Type'}
                            selected={longGoalType}
                            isDisabled={!hasLongGoal}
                        >
                            {goalTypes.map(tempGoalLimit => (
                                <button
                                    className={styles.dropDownOption}
                                    onClick={() => setLongGoalLimit(tempGoalLimit)}
                                    key={tempGoalLimit}
                                >
                                    {tempGoalLimit}
                                </button>
                            ))}
                        </DropDownInput>
                    </InputWrapper>
                    <InputWrapper label={"Limit"}>
                        <DropDownInput
                            placeholder={'Limit'}
                            selected={longGoalLimit}
                            isDisabled={!hasLongGoal}
                        >
                            {goalLimits.map(tempGoalLimit => (
                                <button
                                    className={styles.dropDownOption}
                                    onClick={() => setLongGoalLimit(tempGoalLimit)}
                                    key={tempGoalLimit}
                                >
                                    {tempGoalLimit}
                                </button>
                            ))}
                        </DropDownInput>
                    </InputWrapper>
                    <InputWrapper label={"Number"}>
                        <TextBoxInput
                            type="number"
                            placeholder="Number"
                            value={longGoalNumber}
                            setValue={setLongGoalNumber}
                            isDisabled={!hasLongGoal}
                            minNumber={1}
                        />
                    </InputWrapper>
                    <div className={"Horizontal-Flex-Container"}>
                        <Button filled={false} width={"max"} onClick={handleCancel}>Cancel</Button>
                        <Button width={"max"} disabled={disabledSaveGroupButton} onClick={handleTimeGroupSave}>Save Group</Button>
                    </div>
                </HeaderExtendContainer>
            </MiniPageContainer>
            {confirmDeleteModalVisible &&
                <ConfirmDeleteGroupModal
                    dismountModal={toggleConfirmModal}
                    continueFunction={continueAfterModalFunctionRef.current}
                    groupTitles={getGroupTitlesForDeletion()}
                />}
            {visibleTimePeriodModal &&
                <TimePeriodModal
                    timePeriod={timePeriod}
                    timePeriod2={timePeriod2}
                    setTimePeriod2={setTimePeriod2}
                    dismountFunction={toggleTimePeriodModal}
                />}
        </>
    );
}

export default NewCategory;