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
import {translateVerticalScroll} from "@/functions/translateVerticalScroll.js";

const RepeatCategoryContent = ({tasks, selection, category, groups}) => {
    const {data: entriesArray, isLoading: entriesLoading} = useGetTaskEntries(tasks.map(task => task._id));
    const {data: currentEntriesArray, isLoading: currentEntriesLoading} = useGetTaskCurrentEntry(tasks.map(task => task._id), tasks.map(task => task.currentEntryId));
    const {functionName, timeToAdd} = useMemo(() => getDateAddDetails(category.repeatRate.bigTimePeriod, category.repeatRate.number), [category]);

    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    const {entriesWithIsProper, groupLatestEntry} = useMemo(() => {
        const entriesWithIsProper = [];
        let groupLatestEntry = null;

        if (entriesLoading || currentEntriesLoading) return {entriesWithIsProper, groupLatestEntry};

        let checkedDates = {};
        let perDateTotalTasks = {};

        const allEntries = [...currentEntriesArray];

        entriesArray.forEach(taskEntries => {
            allEntries.push(...taskEntries);
        })

        if (selection === "All") {
            // Used to check if it has been included in a date range
            const perGroupNextEntry = {};

            // This means show tasks for all groups of the category.
            // Loop through every date from starting date to today for each group
            groups.forEach(group => {
                const date = new Date(group.repeatRate.startingDate);

                // Maximum time should be next end date from today
                const today = new Date();
                today.setUTCHours(0, 0, 0, 0);

                // Get all the group tasks
                const groupTasks = tasks.filter(task => task.group === group._id);
                const groupTasksIds = groupTasks.map(task => task._id);

                // Add group to perGroupNextEntry
                const groupNextEntry = {
                    taskNumber: groupTasks.length,
                    date: date
                };

                // Loop through all the proper dates for the group
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
                        const task = groupTasks.find(task => task._id === entry.taskId);

                        if (task.type === "Checkbox") {
                            dateCompleted = true;
                        }

                        if (task.type === "Number") {
                            if (task?.goal?.number) {
                                if (task.goal.number < entry.value) {
                                    dateCompleted = true;
                                }
                            } else {
                                dateCompleted = true;
                            }
                        }

                        if (dateCompleted) {
                            if (checkedDates[date.toISOString()]) {
                                checkedDates[date.toISOString()] += 1;
                            } else {
                                checkedDates[date.toISOString()] = 1;
                            }
                        }
                    })

                    if (!checkedDates.hasOwnProperty(date.toISOString())) {
                        checkedDates[date.toISOString()] = 0;
                    }

                    date[`set${functionName}`](date[`get${functionName}`]() + timeToAdd);

                    groupNextEntry.date = date;
                    groupNextEntry.taskNumber = groupTasks.length;
                }

                perGroupNextEntry[group._id] = groupNextEntry;
            });

            // Calculate entries per time period instead of per day
            const date = new Date(category.repeatRate.startingDate[0]);
            const nextDate = new Date(category.repeatRate.startingDate[0]);
            const today = new Date();

            const dateRangeCheckedDates = {};
            const dateRangeTotalTasks = {};

            nextDate[`set${functionName}`](nextDate[`get${functionName}`]() + timeToAdd);

            while (date.getTime() <= today.getTime()) {
                // For each date range get all the entries as one
                let dateRangeEntries;
                let completed = 0;
                let taskTotal = 0;

                dateRangeEntries = Object.keys(checkedDates).filter(tempDate => {
                    const tempDateObj = new Date(tempDate);

                    return tempDateObj.getTime() >= date.getTime() && tempDateObj.getTime() < nextDate.getTime()
                });

                dateRangeEntries.forEach(entryDate => {
                    completed += checkedDates[entryDate];
                    taskTotal += perDateTotalTasks[entryDate];
                });

                // Set task and completed entries total
                dateRangeTotalTasks[`${date.toLocaleDateString()} - ${nextDate.toLocaleDateString()}`] = taskTotal;
                dateRangeCheckedDates[`${date.toLocaleDateString()} - ${nextDate.toLocaleDateString()}`] = completed;

                // Add not completed entries for groups that haven't come up yet
                for (const index in perGroupNextEntry) {
                    const {taskNumber, date: groupNextEntry} = perGroupNextEntry[index];

                    if (groupNextEntry.getTime() >= date.getTime() && groupNextEntry.getTime() < nextDate.getTime()) {
                        dateRangeTotalTasks[`${date.toLocaleDateString()} - ${nextDate.toLocaleDateString()}`] += taskNumber;
                    }
                }

                nextDate[`set${functionName}`](nextDate[`get${functionName}`]() + timeToAdd);
                date[`set${functionName}`](date[`get${functionName}`]() + timeToAdd);
            }
            
            checkedDates = dateRangeCheckedDates;
            perDateTotalTasks = dateRangeTotalTasks;
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
                    const task = tasks.find(task => task._id === entry.taskId);

                    if (task.type === "Checkbox") {
                        dateCompleted = true;
                    }

                    if (task.type === "Number") {
                        if (task?.goal?.number) {
                            if (task.goal.number < entry.value) {
                                dateCompleted = true;
                            }
                        } else {
                            dateCompleted = true;
                        }
                    }

                    if (dateCompleted) {
                        if (checkedDates[date.toISOString()]) {
                            checkedDates[date.toISOString()] += 1;
                        } else {
                            checkedDates[date.toISOString()] = 1;
                        }
                    }
                })

                if (!checkedDates.hasOwnProperty(date.toISOString())) {
                    checkedDates[date.toISOString()] = 0;
                }

                date[`set${functionName}`](date[`get${functionName}`]() + timeToAdd);
            }

            // Get group latest entry
            date[`set${functionName}`](date[`get${functionName}`]() - timeToAdd);
            groupLatestEntry = date;
        }

        // Add percentage and isProperDate to everything
        for (const date in checkedDates) {
            let percentage, isProperDate = false;

            if (selection === "All") {
                percentage = (checkedDates[date] * 100 / (perDateTotalTasks[date] ? perDateTotalTasks[date] : 1)).toFixed(0);

                const startDate = new Date(date.substring(0, date.indexOf(" ")));
                const endDate = new Date(date.substring(date.lastIndexOf(" ") + 1));

                if (currentDate.getTime() >= startDate.getTime() && currentDate.getTime() < endDate.getTime()) {
                    isProperDate = true;
                }
            } else {
                percentage = (checkedDates[date] * 100 / (tasks.length ? tasks.length : 1)).toFixed(0);

                if ((new Date(date).getTime() === currentDate.getTime())) {
                    isProperDate = true;
                }
            }

            entriesWithIsProper.push({
                isProperDate,
                date,
                value: `${percentage} %`
            })
        }

        return {entriesWithIsProper, groupLatestEntry};
    }, [tasks, selection, category, groups, currentEntriesArray, entriesArray, currentEntriesLoading, entriesLoading])

    const {maxStreak, currentStreak, maxStreakEndDate, currentStreakStartDate, startedDates, completedDates} = useMemo(() => {
        // Calculate maximum, current streak by looping through the entries
        let currentStreak = 0;
        let maxStreak = 0;

        let maxStreakEndDate = null;
        let currentStreakStartDate = null;

        for (const entry of entriesWithIsProper) {
            if (entry.value === "100 %") {
                currentStreak++;
                if (!currentStreakStartDate) {
                    currentStreakStartDate = entry.date;
                }

            } else {
                currentStreak = 0;
                currentStreakStartDate = null;
            }
            if (currentStreak > maxStreak) {
                maxStreak = currentStreak;
                if (selection === "All") {
                    maxStreakEndDate = entry.date.substring(entry.date.lastIndexOf(" ") + 1)
                } else {
                    maxStreakEndDate = entry.date;
                }
            }
        }



        maxStreakEndDate = maxStreakEndDate ? new Date(maxStreakEndDate) : maxStreakEndDate;

        if (selection === "All" && currentStreakStartDate) {
            currentStreakStartDate = new Date(currentStreakStartDate.substring(0, currentStreakStartDate.indexOf(" ")));
        }

        // Calculate the amount of completed and started dates
        let completedDates = 0;
        let startedDates = 0;

        for (const entry of entriesWithIsProper) {
            if (entry.value === "100 %") {
                completedDates++;
                startedDates++;
            } else if (entry.value !== "0 %") {
                startedDates++;
            }
        }

        return {maxStreak, currentStreak, maxStreakEndDate, currentStreakStartDate, startedDates, completedDates}
    }, [entriesWithIsProper]);

    let streakIsOngoing = false;

    if (selection !== "All") {
        const latestEntry = entriesWithIsProper.find(entry => (new Date(entry.date)).getTime() === groupLatestEntry.getTime())

        if (latestEntry && latestEntry.value === "100 %") {
            streakIsOngoing = true;
        }
    }


    return (
        <>
            <section className={'Grid-Container Two-By-Two'}>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>Current Streak</div>
                    <div>{currentStreak} {currentStreak === 1 ? "entry" : "entries"}</div>
                    <div className={'Label'}>{currentStreakStartDate ? `Since: ${(new Date(currentStreakStartDate)).toLocaleDateString()}` : ""}</div>
                </div>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>Best Streak</div>
                    <div>{maxStreak} {maxStreak === 1 ? "entry" : "entries"}</div>
                    <div className={'Label'}>{streakIsOngoing ? "Ongoing" : (maxStreakEndDate?.toLocaleDateString() ?? "")}</div>
                </div>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>% Completed</div>
                    <div>{entriesWithIsProper.length > 0 ? (((completedDates / entriesWithIsProper.length) * 100).toFixed(1)) : 0}</div>
                    <div className={'Label'}>Total: {completedDates}</div>
                </div>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>% Started</div>
                    <div>{entriesWithIsProper.length > 0 ? ((startedDates / entriesWithIsProper.length) * 100).toFixed(1) : 0}</div>
                    <div className={'Label'}>Total: {startedDates}</div>
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
            {groups.length > 0 && <section className={styles.groupsContainer} onWheel={translateVerticalScroll}>
                <Chip selected={selectedGroup} value={"All"} setSelected={setSelectedGroup}>All</Chip>
                {groups.map(group => <Chip key={group._id} value={group} selected={selectedGroup}
                                           setSelected={() => setSelectedGroup(group)}>
                    {group.title}
                </Chip>)}
            </section>}
            {category?.repeatRate?.number && <RepeatCategoryContent tasks={selectionTasks} selection={selectedGroup} category={category}
                                    groups={groups}/>}
            <section className={'Horizontal-Flex-Container Space-Between'}>
                {category.createdAt && <div className={'Label'}>
                    Created at: {(new Date(category.createdAt)).toLocaleDateString()}
                </div>}
            </section>
        </MiniPageContainer>
    );
};

export default CategoryView;