import React, {useContext, useMemo, useState} from 'react';
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import IconButton from "../../components/buttons/IconButton/IconButton";
import Button from "../../components/buttons/Button/Button";
import Chip from "../../components/buttons/Chip/Chip";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import styles from './CategoryView.module.scss';
import {useGetGroups} from "../../hooks/get-hooks/useGetGroups";
import CollapsibleContainer from "../../components/containers/CollapsibleContainer/CollapsibleContainer";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import {useDeleteCategory} from "../../hooks/delete-hooks/useDeleteCategory";
import {useGetTasks} from "../../hooks/get-hooks/useGetTasks";
import {TbEdit, TbTrash} from "react-icons/tb";
import {useGetTaskEntries} from "@/hooks/get-hooks/useGetTaskEntries.js";
import {useGetTaskCurrentEntry} from "@/hooks/get-hooks/useGetTaskCurrentEntry.js";
import Table from "@/components/utilities/Table/Table.jsx";
import {getDateAddDetails} from "@/functions/getDateAddDetails.js";

const CategoryContent = ({tasks, selection, category, groups}) => {
    const {data: entriesArray, isLoading: entriesLoading} = useGetTaskEntries(tasks.map(task => task._id));
    const {data: currentEntriesArray, isLoading: currentEntriesLoading} = useGetTaskCurrentEntry(tasks.map(task => task._id), tasks.map(task => task.currentEntryId));
    const {functionName, timeToAdd} = useMemo(() => getDateAddDetails(category.repeatRate.bigTimePeriod, category.repeatRate.number), [category]);

    // Todo calculate streak based on startedDates
    const {checkedDates, startedDates, perDateTotalTasks} = useMemo(() => {
        let checkedDates = {};
        let startedDates = [];
        let perDateTotalTasks = {};

        if (entriesLoading || currentEntriesLoading) return {
            checkedDates,
            startedDates,
            perDateTotalTasks
        }

        const allEntries = [...currentEntriesArray];

        entriesArray.forEach(taskEntries => {
            allEntries.push(...taskEntries);
        })

        if (selection === "All") {
            // This means show tasks for all groups of the category.
            // Loop through every date from starting date to today for each group
            groups.forEach(group => {
                const date = new Date(group.repeatRate.startingDate);
                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);

                // Get all the group tasks
                const groupTasks = tasks.filter(task => task.group === group._id);
                const groupTasksIds = groupTasks.map(task => task._id);

                // Loop through all the proper dates for the group
                // Todo include future dates in time period to checked dates and per date total tasks
                while (date.getTime() <= today.getTime()) {
                    // Get all the entries for this group
                    const dateEntries = allEntries.filter(entry => entry.value > 0 && groupTasksIds.includes(entry.taskId) && (new Date(entry.date)).getTime() === date.getTime());

                    // Add per date total tasks
                    if (perDateTotalTasks.hasOwnProperty(date.toISOString())) {
                        perDateTotalTasks[date.toISOString()] += groupTasks.length;
                    } else {
                        perDateTotalTasks[date.toISOString()] = groupTasks.length;
                    }

                    // Now check if entries have value and if they are completed
                    dateEntries.forEach(entry => {
                        let dateCompleted = false;
                        let dateStarted = false;
                        const task = groupTasks.find(task => task._id === entry.taskId);

                        if (task.type === "Checkbox") {
                            dateCompleted = true;
                            dateStarted = true;
                        }

                        if (task.type === "Number") {
                            if (task?.goal?.number) {
                                if (task.goal.number < entry.value) {
                                    dateCompleted = true;
                                    dateStarted = true;
                                }
                            } else {
                                dateCompleted = true;
                                dateStarted = true;
                            }
                        }

                        if (dateCompleted) {
                            if (checkedDates[date.toISOString()]) {
                                checkedDates[date.toISOString()] += 1;
                            } else {
                                checkedDates[date.toISOString()] = 1;
                            }
                        }

                        if (dateStarted && !startedDates.includes(date)) {
                            startedDates.push(date.toISOString());
                        }
                    })

                    if (!checkedDates.hasOwnProperty(date.toISOString())) {
                        checkedDates[date.toISOString()] = 0;
                    }

                    date[`set${functionName}`](date[`get${functionName}`]() + timeToAdd);
                }
            })

            // Calculate percentage for each week
            const date = new Date(category.repeatRate.startingDate[0]);
            const nextDate = new Date(category.repeatRate.startingDate[0]);
            const today = new Date();

            const dateRangeCheckedDates = {};

            nextDate[`set${functionName}`](nextDate[`get${functionName}`]() + timeToAdd);

            let countingStreak = 0;
            let biggestStreak = 0;

            while (date.getTime() <= today.getTime()) {
                // For each date range get all the entries as one
                let dateRangeEntries;
                let completed = 0;
                let taskTotal = 0;

                dateRangeEntries = Object.keys(checkedDates).filter(tempDate => {
                    const tempDateObj = new Date(tempDate);

                    return tempDateObj.getTime() >= date.getTime() && tempDateObj.getTime() < nextDate.getTime()
                })

                dateRangeEntries.forEach(entryDate => {
                    completed += checkedDates[entryDate];
                    taskTotal += perDateTotalTasks[entryDate];
                });

                // Set task and completed entries total
                perDateTotalTasks[`${date.toLocaleDateString()} - ${nextDate.toLocaleDateString()}`] = taskTotal;
                dateRangeCheckedDates[`${date.toLocaleDateString()} - ${nextDate.toLocaleDateString()}`] = completed;

                nextDate[`set${functionName}`](nextDate[`get${functionName}`]() + timeToAdd);
                date[`set${functionName}`](date[`get${functionName}`]() + timeToAdd);
            }
            
            checkedDates = dateRangeCheckedDates;
        } else {
            const date = new Date(selection.repeatRate.startingDate);
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            perDateTotalTasks = tasks?.length ?? 0;

            while (date.getTime() <= today.getTime()) {
                const dateEntries = allEntries.filter(entry => entry.value > 0  && (new Date(entry.date)).getTime() === date.getTime());

                // Almost the same code block as above
                dateEntries.forEach(entry => {
                    let dateCompleted = false;
                    let dateStarted = false;
                    const task = tasks.find(task => task._id === entry.taskId);

                    if (task.type === "Checkbox") {
                        dateCompleted = true;
                        dateStarted = true;
                    }

                    if (task.type === "Number") {
                        if (task?.goal?.number) {
                            if (task.goal.number < entry.value) {
                                dateCompleted = true;
                                dateStarted = true;
                            }
                        } else {
                            dateCompleted = true;
                            dateStarted = true;
                        }
                    }

                    if (dateCompleted) {
                        if (checkedDates[date.toISOString()]) {
                            checkedDates[date.toISOString()] += 1;
                        } else {
                            checkedDates[date.toISOString()] = 1;
                        }
                    }

                    if (dateStarted && !startedDates.includes(date)) {
                        startedDates.push(date.toISOString());
                    }
                })

                if (!checkedDates.hasOwnProperty(date.toISOString())) {
                    checkedDates[date.toISOString()] = 0;
                }

                date[`set${functionName}`](date[`get${functionName}`]() + timeToAdd);
            }
        }

        return {
            checkedDates,
            startedDates,
            perDateTotalTasks
        }
    }, [tasks, selection, category, groups, currentEntriesArray, entriesArray, currentEntriesLoading, entriesLoading])

    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    if (selection !== "All" && !checkedDates.hasOwnProperty(currentDate.toISOString())) {
        checkedDates[currentDate] = 0;
    }

    const entriesWithIsProper = [];

    for (const date in checkedDates) {
        let percentage;

        if (selection === "All") {
            percentage = (checkedDates[date] * 100 / (perDateTotalTasks[date] ? perDateTotalTasks[date] : 1)).toFixed(0);
        } else {
            percentage = (checkedDates[date] * 100 / (tasks.length ? tasks.length : 1)).toFixed(0);
        }

        entriesWithIsProper.push({
            isProperDate: false,
            date,
            value: `${percentage} %`
        })
    }

    return (
        <>
            <section className={'Grid-Container Two-By-Two'}>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>Current Streak</div>
                    <div>2 days</div>
                    <div className={'Label'}>Since: 05/10/2022</div>
                </div>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>Best Streak</div>
                    <div>2 days</div>
                    <div className={'Label'}>Ended at: 05/10/2022</div>
                </div>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>% Completed</div>
                    <div>20.0</div>
                    <div className={'Label'}>Total: 123</div>
                </div>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>% Started</div>
                    <div>2 days</div>
                    <div className={'Label'}>Total Started</div>
                </div>
            </section>
            <Table
                entries={entriesWithIsProper}
                entriesLoading={false}
                setIsVisibleNewEntryModal={() => {}}
                handleEditEntry={() => {}}
                hasEditColumn={false}
                datesAreRange={selection === "All"}
            />
        </>
    )
}

const CategoryView = ({index, length, category}) => {
    const miniPagesContext = useContext(MiniPagesContext);

    const {data: unfilteredGroups} = useGetGroups();
    const {data: tasks} = useGetTasks();

    const groups = unfilteredGroups?.filter(group => group.parent === category._id);

    const [selectedGroup, setSelectedGroup] = useState("All");
    const [deletePromptVisible, setDeletePromptVisible] = useState(false);
    const {mutate: deleteCategory} = useDeleteCategory();

    // Gets all the tasks depending on the selection
    const selectionTasks = useMemo(() => {
        if (selectedGroup === "All") {
            return tasks.filter(task => task.category === category._id);
        }

        // Selection is a group
        return tasks.filter(task => task.category === category._id && task.group === selectedGroup._id);
    }, [selectedGroup, groups, tasks]);

    // const [selectedGraph, setSelectedGraph] = useState('Average');
    // const graphOptions = ['Average', 'Total'];
    //
    // const [date, setDate] = useState(new Date);

    // const addToMonth = (adder) => {
    //     const newDate = new Date(date.getTime());
    //     newDate.setMonth(newDate.getMonth() + adder);
    //
    //     setDate(newDate);
    // }

    const handleDeleteButton = () => {
        if (groups.length === 0 || tasks.filter(task => task.category === category._id).length === 0) {
            handleDeleteWithoutTasks();
        }
        setDeletePromptVisible(current => !current);
    }

    const handleCancelButton = () => {
        setDeletePromptVisible(false);
    }

    const handleDeleteWithTasks = () => {
        deleteCategory({categoryId: category._id, deleteTasks: true});
        miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''});
    }

    const handleDeleteWithoutTasks = () => {
        deleteCategory({categoryId: category._id, deleteTasks: false});
        miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''});
    }

    return (
        <MiniPageContainer
            index={index}
            length={length}
            showSaveButton={false}
        >
            <section className={`Horizontal-Flex-Container Space-Between`}>
                <div className={'Horizontal-Flex-Container'}>
                    <div className={`${styles.dot} ${category.color}`}></div>
                    <div className={'Title'}>{category.title}</div>
                </div>
                <div>
                    <IconButton onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'new-category', id: category._id}})}><TbEdit /></IconButton>
                    <IconButton onClick={handleDeleteButton}><TbTrash /></IconButton>
                </div>
            </section>
            <CollapsibleContainer hasBorder={false} isVisible={deletePromptVisible}>
                <InputWrapper label={"Are you sure?\n(this will also delete this category's groups)"} type={"vertical"}>
                    <Button filled={false} onClick={handleDeleteWithTasks}>Yes (delete tasks)</Button>
                    <Button filled={false} onClick={handleDeleteWithoutTasks}>Yes (keep tasks)</Button>
                    <Button onClick={handleCancelButton}>Cancel</Button>
                </InputWrapper>
            </CollapsibleContainer>
            {groups.length > 0 && <section className={styles.groupsContainer}>
                <Chip selected={selectedGroup} value={"All"} setSelected={setSelectedGroup}>All</Chip>
                {groups.map(group => <Chip key={group._id} value={group} selected={selectedGroup}
                                           setSelected={() => setSelectedGroup(group)}>
                    {group.title}
                </Chip>)}
            </section>}
            <CategoryContent tasks={selectionTasks} selection={selectedGroup} category={category} groups={groups} />
            <section className={'Horizontal-Flex-Container Space-Between'}>
                <Button filled={false} size={'small'}>
                    See all entries
                </Button>
                <div className={'Label'}>
                    Created at: 02/10/2022
                </div>
            </section>
        </MiniPageContainer>
    );
};

export default CategoryView;
