import InputWrapper from '../../components/utilities/InputWrapper/InputWrapper';
import TextBoxInput from '../../components/inputs/TextBoxInput/TextBoxInput';
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import ColorInput from "../../components/inputs/ColorInput/ColorInput";
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import {AlertsContext} from "../../context/AlertsContext";
import {MiniPagesContext} from "../../context/MiniPagesContext";

import {TbPlus} from "react-icons/tb";

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
import PriorityIndicator from "@/components/indicators/PriorityIndicator/PriorityIndicator";
import {translateVerticalScroll} from "@/functions/translateVerticalScroll.js";

const NewCategory = ({index, length, id}) => {
    const {isLoading: categoriesLoading, data: categories} = useGetCategories();
    const {isLoading: groupsLoading, data: groups} = useGetGroups();
    const {data: settings} = useGetSettings();
    const alertsContext = useContext(AlertsContext);
    const miniPagesContext = useContext(MiniPagesContext);
    const timePeriods = ['Days', 'Weeks', 'Months', 'Years']
    const goalTypes = ['Streak', 'Total'];
    const goalLimits = ['At most', 'Exactly', 'At least'];

    const [creatingTimeGroup, setCreatingTimeGroup] = useState(false);
    const currentEditedGroup = useRef();

    // Inputs for both category types
    const [title, setTitle] = useState('');
    const [color, setColor] = useState('Red');
    const [repeats, setRepeats] = useState(false);

    // Inputs for repeatable category
    const [timePeriodNumber, setTimePeriodNumber] = useState(settings.defaults.priority);
    const [timePeriod, setTimePeriod] = useState('Days');
    const [timePeriod2, setTimePeriod2] = useState([]);
    const [priority, setPriority] = useState(0);
    const [hasLongGoal, setHasLongGoal] = useState(false);
    const [longGoalLimit, setLongGoalLimit] = useState('At least');
    const [longGoalNumber, setLongGoalNumber] = useState(settings.defaults.goal);
    const [longGoalType, setLongGoalType] = useState("Streak");
    const [timeGroups, setTimeGroups] = useState([]);

    // Inputs for current group
    const [timeGroupTitle, setTimeGroupTitle] = useState('');
    const [hasTime, setHasTime] = useState(false);
    const [startHour, setStartHour] = useState('00');
    const [startMinute, setStartMinute] = useState('00');
    const [endHour, setEndHour] = useState('23');
    const [endMinute, setEndMinute] = useState('59');

    const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);

    const {mutate: addCategoryToServer} = useAddCategory();
    const {mutateAsync: changeCategory} = useChangeCategory();

    const continueAfterModalFunctionRef = useRef();
    const initialCategoryValues = useRef();
    const titleRef = useRef();
    const groupTitleRef = useRef();

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

    useEffect(() => {
        if (!creatingTimeGroup) return;

        // If the timeout doesn't exist the layout breaks ㄟ( ▔, ▔ )ㄏ
        setTimeout(() => {
            if (groupTitleRef.current) {
                groupTitleRef.current.focus();
            }
        }, 100);

    }, [creatingTimeGroup])

    const handleSave = async () => {
        if (categoriesLoading) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", title: "Categories loading", message: "Please wait until the categories are done loading."}});
            return
        }

        if (creatingTimeGroup) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", title: "Unsaved Subdivision Changes", message: "You have unsaved subdivision changes. Please save or cancel the changes to continue."}})
            return;
        }

        // Check inputs for validity
        if (!title) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", title: "Category Title is Missing", message: "Categories must have a title. Please enter a title to continue."}})
            return;
        }

        if (!id && categories.find(category => category.title === title) !== undefined) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", title: "Duplicate Category", message: "A category with that title already exists. Please change the title to continue."}})
            return;
        }

        let repeatParameters = undefined;

        if (repeats) {
            if (timePeriodNumber.toString().length === 0) return;

            const startingDate = new Date();

            startingDate.setUTCHours(0, 0, 0, 0);

            // For starting date reset to first day of time period (for example for week to monday)
            switch (timePeriod) {
                case "Weeks":
                    startingDate.setDate(startingDate.getDate() - (startingDate.getDay() - 1));
                    break;
                case "Months":
                    startingDate.setDate(1);
                    break;
                case "Years":
                    startingDate.setMonth(0)
                    startingDate.setDate(1);
                    break;
                case "Days":
                default:
                    break;
            }

            repeatParameters = {
                priority,
                repeatRate: {
                    number: timePeriodNumber,
                    bigTimePeriod: timePeriod,
                    startingDate: [startingDate]
                }
            }

            if (hasLongGoal) {
                if (longGoalNumber.toString().length === 0) return;

                repeatParameters.goal = {
                    type: longGoalType,
                    limit: longGoalLimit,
                    number: longGoalNumber
                }
            }
        }

        const category = {
            title,
            color,
            repeats,
            ...repeatParameters
        }

        if (id) {
            // Editing category
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

    const resetTimeGroupInputs = () => {
        setTimeGroupTitle('');

        setTimePeriod2([]);

        setHasTime(false);
        setStartHour("00");
        setStartMinute("00");
        setEndHour("23");
        setEndMinute("59");
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
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", title: "Subdivision Title is Missing", message: "Subdivisions must have a title. Please enter a title to continue."}})
            return;
        }

        // Unique title (in category)
        if (timeGroupTitle !== currentEditedGroup.current?.title && timeGroups.find(group => group.title === timeGroupTitle && !group?.deleted))  {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", title: "Duplicate Subdivision", message: "A subdivision with that title already exists in the category. Change the title to continue."}})
            return;
        }

        // At least one day must be selected
        if (timePeriod !== 'Days' && !timePeriod2) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", title: "No repeat days selected", message: "You must select at least one day to repeat on"}})
            return;
        }

        const newId = currentEditedGroup.current?._id ?? getGroupId();

        const startingDates = findStartingDates(timePeriod, timePeriod2);

        const timeGroup = {
            _id: newId,
            title: timeGroupTitle,
            repeatRate: {
                smallTimePeriod: timePeriod2,
                startingDate: startingDates
            },
            initial: currentEditedGroup.current?.initial
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
                        title: "Subdivision Time is Invalid",
                        message: "A subdivision can't end before it starts."
                    }
                })
                return;
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

            if (category?.repeatRate?.number) {
                setRepeats(true);

                setTimePeriodNumber(category.repeatRate.number);
                setTimePeriod(category.repeatRate.bigTimePeriod);
                setPriority(category.priority);
            }

            if (category?.goal?.number) {
                setHasLongGoal(true);

                setLongGoalLimit(category.goal.limit);
                setLongGoalNumber(category.goal.number);
                setLongGoalType(category.goal.number);
            }

            setTimeGroups(groups?.filter(group => group.parent === category._id)?.map(group => {return {...group, initial: true}}));
            initialCategoryValues.current = category;
        }

        if (titleRef.current) {
            titleRef.current?.focus();
        }
    }, [categoriesLoading, groupsLoading])

    const disabledSaveGroupButton = useMemo(() => {
        if (!timeGroupTitle) return true;
        if (timePeriod !== "Days" && timePeriod2.length === 0) return true;

        return false;
    }, [timePeriod2, timeGroupTitle, priority, timePeriodNumber]);

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
                    ref={titleRef}
                />
                <InputWrapper label="Color">
                    <ColorInput selected={color} setSelected={setColor}/>
                </InputWrapper>
                <HeaderExtendContainer
                    header={<div className={"Horizontal-Flex-Container Space-Between"}>
                        <div className={"Title-Small"}>Turn into repeatable container</div>
                        <ToggleButton isToggled={repeats} setIsToggled={setRepeats}></ToggleButton>
                    </div>}
                    extendOnClick={false}
                    extendedInherited={repeats}
                    hasPointer={false}
                >
                    <InputWrapper label={'Repeat every'}>
                        <TextBoxInput type='number' placeholder="Number" value={timePeriodNumber} setValue={setTimePeriodNumber} minNumber={1} />
                        <DropDownInput placeholder={'Weeks'} selected={timePeriod}>
                            {timePeriods.map(tempTimePeriod =>
                                <button key={tempTimePeriod} onClick={() => handleTimePeriodInput(tempTimePeriod)}>{tempTimePeriod}</button>
                            )}
                        </DropDownInput>
                    </InputWrapper>
                    <InputWrapper label={'Priority'}>
                        <TextBoxInput type='number' placeholder="Number" value={priority} setValue={setPriority} />
                        <PriorityIndicator/>
                    </InputWrapper>
                    <InputWrapper label={"Has goal"}>
                        <ToggleButton isToggled={hasLongGoal} setIsToggled={setHasLongGoal} />
                    </InputWrapper>
                    <InputWrapper label={"Goal"}>
                        <DropDownInput
                            placeholder={'Type'}
                            selected={longGoalType}
                            isDisabled={!hasLongGoal}
                            widthBasedOnChildren={true}
                        >
                            {goalTypes.map(tempGoalType => (
                                <button
                                    className={styles.dropDownOption}
                                    onClick={() => setLongGoalType(tempGoalType)}
                                    key={tempGoalType}
                                >
                                    {tempGoalType}
                                </button>
                            ))}
                        </DropDownInput>
                        <DropDownInput
                            placeholder={'Limit'}
                            selected={longGoalLimit}
                            isDisabled={!hasLongGoal}
                            widthBasedOnChildren={true}
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
                        <TextBoxInput
                            type="number"
                            placeholder="Number"
                            value={longGoalNumber}
                            setValue={setLongGoalNumber}
                            isDisabled={!hasLongGoal}
                            minNumber={1}
                        />
                    </InputWrapper>
                    <HeaderExtendContainer
                        header={<div className={"Stack-Container"}>
                            <InputWrapper label="Subdivisions" hasPadding={false} tooltipMessage={"Required: repeat rate bigger than \"day\""}>
                                <div className={styles.groupTitlesContainer} onWheel={translateVerticalScroll}>
                                    <Button filled={true} symmetrical={true} onClick={handleAddTimeGroup} size={"small"} disabled={timePeriod === "Days"}>
                                        Add new
                                        <TbPlus />
                                    </Button>
                                    <AnimatePresence mode={"popLayout"}>
                                        {timeGroupList[0]._id !== -1 && timeGroupList.map((group) => (
                                            <motion.div
                                                layout
                                                key={group._id}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.8, opacity: 0 }}
                                            >
                                                <Chip type={'icon'} onClick={(e) => {handleGroupClick(e, group)}} hasDeleteButton={true} deleteFunction={() => handleDelete(group)} size={"small"}>
                                                    {group.title}
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
                        hasOutline={false}
                    >
                        <InputWrapper label={'Title'}>
                            <TextBoxInput placeholder="Title" value={timeGroupTitle} setValue={setTimeGroupTitle} ref={groupTitleRef}/>
                        </InputWrapper>
                        <InputWrapper label={'On'}>
                            <Button onClick={toggleTimePeriodModal} disabled={timePeriod === "Days"} size={"small"}>Select dates</Button>
                        </InputWrapper>
                        <HeaderExtendContainer
                            header={
                                <div className={"Horizontal-Flex-Container Space-Between"}>
                                    <div className={"Title-Small"}>Repeat time range</div>
                                    <ToggleButton isToggled={hasTime} setIsToggled={setHasTime} />
                                </div>
                            }
                            extendOnClick={false}
                            extendedInherited={hasTime && repeats}
                            hasPointer={false}
                            hasOutline={false}
                            isDisabled={!repeats}
                        >
                            <InputWrapper>
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
                        </HeaderExtendContainer>
                        <div className={"Horizontal-Flex-Container"}>
                            <Button filled={false} width={"max"} onClick={handleCancel}>Cancel</Button>
                            <Button width={"max"} disabled={disabledSaveGroupButton} onClick={handleTimeGroupSave}>Save Group</Button>
                        </div>
                    </HeaderExtendContainer>
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