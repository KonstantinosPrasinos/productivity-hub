import {useEffect, useMemo, useState} from "react";
import {useGetTasks} from "./get-hooks/useGetTasks";
import {useGetGroups} from "./get-hooks/useGetGroups";
import {getDateAddDetails} from "@/functions/getDateAddDetails";

let tasksNextUpdate = null
let timeout = null;

const findNextUpdateDate = (task) => {
    // In case something breaks in the back end
    if (!task.mostRecentProperDate && task?.repeatRate?.startingDate?.length === 0) {
        return false;
    }

    const date = new Date(task.mostRecentProperDate ?? task.repeatRate.startingDate[0]);
    date.setHours(0, 0, 0, 0);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Get the time that should be added to each date for a repetition
    const {functionName, timeToAdd} = getDateAddDetails(task.repeatRate.bigTimePeriod, task.repeatRate.number);

    // Find next local date it should render
    while(currentDate.getTime() > date.getTime()) {
        let wentOver = false;

        if (task.repeatRate.startingDate.length > 1 && currentDate.getTime() > date.getTime()) {
            for (let index in task.repeatRate.startingDate) {
                if (index !== "0") {
                    const currentStartingDate = new Date(task.repeatRate.startingDate[index]);
                    const previousStartingDate = new Date(task.repeatRate.startingDate[index - 1]);

                    date.setTime(date.getTime() + (currentStartingDate.getTime() - previousStartingDate.getTime()));

                    if (date.getTime() >= currentDate.getTime()) {
                        wentOver = true;
                        break;
                    }
                }
            }
        }
        if (wentOver) break;
        date[`set${functionName}`](date[`get${functionName}`]() + timeToAdd);
    }

    return date;
}

const checkTime = (task) => {
    const currentDate = new Date();
    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    currentDate.setHours(0, 0, 0, 0);

    const nextUpdate = findNextUpdateDate(task);

    if (nextUpdate === false) {
        return false;
    }

    const isCorrectDate = nextUpdate.getTime() === currentDate.getTime();
    let isCorrectTime = true;

    // Check if it uses time
    if (task.repeatRate.time?.start) {
        // If it has time, check if it should render at the current time
        const fromHours = parseInt(task.repeatRate.time.start.substring(0, 2));
        const toHours = parseInt(task.repeatRate.time.end.substring(0, 2));
        const fromMinutes = parseInt(task.repeatRate.time.start.substring(2));
        const toMinutes = parseInt(task.repeatRate.time.end.substring(2));

        if (
            fromHours > currentHours ||
            currentHours > toHours ||
            (
                fromHours === currentHours &&
                currentMinutes < fromMinutes
            ) ||
            (
                toHours === currentHours &&
                currentMinutes >= toMinutes
            )
        ) {
            // It shouldn't render now so set next update time
            nextUpdate.setHours(fromHours, fromMinutes);
            isCorrectTime = false;
        } else {
            // It should render now so return true and set next update to, to-time
            nextUpdate.setHours(toHours, toMinutes);
            isCorrectTime = true;
        }
    } else {
        if (isCorrectDate) {
            // Set update time to tomorrow at 00:00
            nextUpdate.setHours(24, 0);
        }
    }

    if (!tasksNextUpdate || (nextUpdate.getTime() < tasksNextUpdate.getTime())) {
        tasksNextUpdate = nextUpdate;
    }

    return isCorrectDate && isCorrectTime;
}

const addGroupsToArray = (groupedTasks, usesTime, tasks, groups) => {
    groups.forEach(group => {
        const groupTasks = tasks.filter(task => task.group === group._id && !task.hidden);

        if (!groupTasks.length) {
            return;
        }

        // Check if the group should be rendered at the current time
        if (usesTime) {
            if (!checkTime({...group, mostRecentProperDate: tasks[0].mostRecentProperDate})) {
                return;
            }
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
        if (!task.hidden) {
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
        }
    })
}

const getCurrentTasks = (usesTime, tasks, groups) => {
    const groupedTasks = [];

    addGroupsToArray(groupedTasks, usesTime, tasks, groups);
    addTasksToArray(groupedTasks, usesTime, tasks);

    // Sort the tasks to be rendered in increasing priority
    groupedTasks.sort((a, b) => b.priority - a.priority);

    return groupedTasks
}

export function useRenderTasks(usesTime = false) {
    const [shouldReRender, setShouldReRender] = useState(false); // Flip this when we want tasks to re-render
    const {isLoading: tasksLoading, isError: tasksError, data: tasks} = useGetTasks();
    const {isLoading: groupsLoading, isError: groupsError, data: groups} = useGetGroups();

    const data = useMemo(() => {
        if (tasksError || groupsError) return false;
        if (!tasksLoading && !groupsLoading) {
            const now = new Date();
            now.setSeconds(0, 0);

            const currentTasks = getCurrentTasks(usesTime, tasks, groups)

            // Clear previous timeout if it exists
            if (timeout) clearTimeout(timeout);

            // Set when the tasks should re-render
            if (tasksNextUpdate) {
                timeout = setTimeout(() => {
                    setShouldReRender(current => !current);
                }, tasksNextUpdate - (new Date).getTime())
            }
            tasksNextUpdate = null;

            return currentTasks;
        }
    }, [tasksLoading, groupsLoading, groups, tasks, shouldReRender]);

    useEffect(() => {
        return () => {
            if (timeout) clearTimeout(timeout);
        }
    }, [])

    return {isLoading: tasksLoading || groupsLoading, isError: groupsError || tasksError, data};
}