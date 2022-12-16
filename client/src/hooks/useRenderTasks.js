import {useEffect, useMemo} from "react";
import {useGetTasks} from "./get-hooks/useGetTasks";
import {useGetGroups} from "./get-hooks/useGetGroups";

const tasksNextUpdate = {}; // has _id and nextUpdateTime pairs (used to cut down future calculations)

const findNextUpdate = (startingTime, time, unit) => {
    const date = new Date(startingTime);
    const currentDate = new Date();
    let functionName;
    let timeToAdd = time;

    switch(unit) {
        case 'Days':
            functionName = 'Date';
            break;
        case 'Weeks':
            functionName = 'Date';
            timeToAdd *= 7;
            break;
        case 'Months':
            functionName = 'Month';
            break;
        case 'Years':
            functionName = 'FullYear'
            break;
        default:
            functionName = 'Date';
            break;
    }

    while(currentDate.getTime() > date.getTime()) {
        date[`set${functionName}`](date[`get${functionName}`]() + timeToAdd);
    }

    date[`set${functionName}`](date[`get${functionName}`]() - timeToAdd);

    return date;
}

const checkTime = (task) => {
    let isCorrectTime = false;
    let taskNextUpdate = null;
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);


    for (const startingTime of task.repeatRate.startingDate) {
        const nextUpdate = findNextUpdate(startingTime, task.repeatRate.number, task.repeatRate.bigTimePeriod);
        if (!taskNextUpdate || nextUpdate < taskNextUpdate) {
            taskNextUpdate = nextUpdate;
        }

        nextUpdate.setUTCHours(0, 0, 0, 0);

        isCorrectTime = nextUpdate.getTime() === currentDate.getTime();
        if (isCorrectTime) break;
    }

    if (taskNextUpdate) {
        tasksNextUpdate[task._id] = taskNextUpdate.getTime();
    }

    return isCorrectTime;
}

const addGroupsToArray = (groupedTasks, usesTime, tasks, groups) => {

    groups.forEach(group => {

        // Check if the group should be rendered at the current time
        if (usesTime) {
            if (!checkTime(group)) {
                return;
            }
        }

        const groupTasks = tasks.filter(task => task.group === group._id);

        if (!groupTasks.length) {
            return;
        }

        groupedTasks.push({
            priority: group.priority,
            tasks: groupTasks.sort((a, b) => b.priority - a.priority)
        });
    });
}

const addTasksToArray = (groupedTasks, usesTime, tasks) => {
    tasks.forEach(task => {
        // Check if the task should be rendered at the current time
        // First checks if the component it will be rendered in even cares about time
        // Then it checks if the task repeats
        // And then it check if the task is in a time group
        if (task.repeats) {
            if (!task.group) {
                if (usesTime) {
                    if (checkTime(task)) {
                        groupedTasks.push(task);
                    }
                } else {
                    groupedTasks.push(task);
                }
            }
        } else {
            groupedTasks.push(task);
        }
    })
}

const findLeastUpdateTime = () => {
    let min = null;

    Object.values(tasksNextUpdate).forEach(key => {
        if (min === null || min > key) {
            min = key;
        }
    })

    return min;
}

const getCurrentTasks = (usesTime, tasks, groups) => {
    const groupedTasks = [];

    addGroupsToArray(groupedTasks, usesTime, tasks, groups);
    addTasksToArray(groupedTasks, usesTime, tasks);

    // Sort the tasks to be rendered in increasing priority
    groupedTasks.sort((a, b) => b.priority - a.priority);

    return groupedTasks
}

// useEffect(() => {
//     timeOut = setTimeout(addTasksToData, findLeastUpdateTime() - (new Date).getTime());
//
//     return () => {
//         clearTimeout(timeOut);
//     }
// }, [])

// const data = useMemo(addTasksToData, [tasks, groups])

export function useRenderTasks(usesTime = false) {

    const {isLoading: tasksLoading, isError: tasksError, data: tasks} = useGetTasks();
    const {isLoading: groupsLoading, isError: groupsError, data: groups} = useGetGroups();

    const data = useMemo(() => {
        if (tasksError || groupsError) return false;
        if (!tasksLoading && !groupsLoading) {
            return [...getCurrentTasks(usesTime, tasks, groups)]
        }
    }, [tasksLoading, groupsLoading, groups, tasks]);

    return {isLoading: tasksLoading || groupsLoading, isError: groupsError || tasksError, data};
}