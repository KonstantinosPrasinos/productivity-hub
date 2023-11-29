import {useEffect, useMemo, useState} from "react";
import {useGetTasks} from "../get-hooks/useGetTasks";
import {useGetGroups} from "../get-hooks/useGetGroups";
import {useGetCategories} from "@/hooks/get-hooks/useGetCategories";
import {findNextUpdateDate} from "@/hooks/render-tasks-hook/findNextUpdateDate";

let tasksNextUpdate = null
let timeout = null;

const checkTime = (task) => {
    const currentDate = new Date();
    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    currentDate.setHours(0, 0, 0, 0);

    const nextUpdate = findNextUpdateDate(task);
    nextUpdate.setHours(0, 0, 0, 0); // Change to local time

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

const addCategoriesToArray = (groupedTasks, usesTime, tasks, groups, categories) => {
    const repeatCategories = categories.filter(category => !isNaN(category.repeatRate?.number));

    repeatCategories.forEach(category => {
        const localTasks = tasks.filter(task => task.category === category._id && !task.hidden);

        if (!localTasks.length) return;

        const categoryOnlyTasks = localTasks.filter(task => task.group === undefined);
        const groupTasks = localTasks.filter(task => task.group !== undefined);

        const repeatGroups = groups.filter(group => [...new Set(groupTasks.map(task => task.group))].includes(group._id));

        if (categoryOnlyTasks.length) {
            if (!usesTime || checkTime({repeatRate: category.repeatRate, mostRecentProperDate: tasks[0].mostRecentProperDate})) {
                groupedTasks.push({
                    priority: category.priority,
                    tasks: categoryOnlyTasks
                })
            }
        }

        // Then also check group also tasks
        repeatGroups.forEach(group => {
            const localGroupTasks = groupTasks.filter(task => task.group === group._id)
            if (localGroupTasks.length) {
                if (!usesTime || checkTime({repeatRate: {...category.repeatRate, ...group.repeatRate}, mostRecentProperDate: tasks[0].mostRecentProperDate})){
                    groupedTasks.push({
                        priority: category.priority,
                        tasks: localGroupTasks.sort((a, b) => b.priority - a.priority)
                    })
                }
            }
        })

        // if (usesTime && !checkTime({...})) return;
    });
}

const addTasksToArray = (groupedTasks, usesTime, tasks, categories) => {
    tasks.forEach(task => {
        // Check if the task should be rendered at the current time
        // First checks if the component it will be rendered in even cares about time
        // Then it checks if the task repeats
        // And then it check if the task is in a time group
        if (!task.hidden) {
            if (task.repeats) {
                if (task.category) {
                    const category = categories.find(cat => cat._id === task.category);

                    if (!category?.repeatRate?.number) {
                        if (usesTime) {
                            if (checkTime(task)) {
                                groupedTasks.push(task);
                            }
                        } else {
                            groupedTasks.push(task);
                        }
                    }
                } else {
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

const getCurrentTasks = (usesTime, tasks, groups, categories) => {
    const groupedTasks = [];

    addCategoriesToArray(groupedTasks, usesTime, tasks, groups, categories);
    addTasksToArray(groupedTasks, usesTime, tasks, categories);

    // Sort the tasks to be rendered in increasing priority
    groupedTasks.sort((a, b) => b.priority - a.priority);

    return groupedTasks
}

export function useRenderTasks(usesTime = false) {
    const [shouldReRender, setShouldReRender] = useState(false); // Flip this when we want tasks to re-render
    const {isLoading: tasksLoading, isError: tasksError, data: tasks} = useGetTasks();
    const {isLoading: groupsLoading, isError: groupsError, data: groups} = useGetGroups();
    const {isLoading: categoriesLoading, isError: categoriesError, data: categories} = useGetCategories();

    const data = useMemo(() => {
        if (tasksError || groupsError || categoriesError) return false;
        if (tasksLoading || groupsLoading || categoriesLoading) return;

        const now = new Date();
        now.setSeconds(0, 0);

        const currentTasks = getCurrentTasks(usesTime, tasks, groups, categories)

        // Clear previous timeout if it exists
        if (timeout) clearTimeout(timeout);

        // Set when the tasks should re-render
        if (tasksNextUpdate - (new Date).getTime() > 0) {
            timeout = setTimeout(() => {
                setShouldReRender(current => !current);
            }, tasksNextUpdate - (new Date).getTime())
        }
        tasksNextUpdate = null;

        return currentTasks;
    }, [tasksLoading, groupsLoading, groups, tasks, shouldReRender]);

    useEffect(() => {
        return () => {
            if (timeout) clearTimeout(timeout);
        }
    }, [])

    return {isLoading: tasksLoading || groupsLoading, isError: groupsError || tasksError, data};
}