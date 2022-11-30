import {useSelector} from "react-redux";
import {useTask} from "./useTask";
import {useEffect, useState} from "react";
import {useGroup} from "./useGroup";
import {useCategory} from "./useCategory";

export function useRenderTasks(usesTime = false) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(false);

    const tasks = useSelector((state) => state?.tasks.tasks);
    const groups = useSelector((state) => state?.groups.groups);
    const categories = useSelector((state) => state?.categories.categories);
    const {isLoading: tasksLoading} = useTask();
    const {isLoading: groupsLoading} = useGroup();
    const {isLoading: categoriesLoading} = useCategory();

    const tasksNextUpdate = {}; // has _id and nextUpdateTime pairs (used to cut down future calculations)

    let timeOut;

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
            if (taskNextUpdate === null || nextUpdate < taskNextUpdate) {
                taskNextUpdate = nextUpdate;
            }

            nextUpdate.setUTCHours(0, 0, 0, 0);

            isCorrectTime = nextUpdate.getTime() === currentDate.getTime();
            if (isCorrectTime) break;
        }

        tasksNextUpdate[task._id] = taskNextUpdate.getTime();

        return isCorrectTime;
    }

    const addGroupsToArray = (groupedTasks, usesTime) => {
        groups.forEach(group => {

            // Check if the group should be rendered at the current time
            if (usesTime) {
                if (!checkTime(group)) {
                    return;
                }
            }

            const groupTasks = tasks.filter(task => task.timeGroup === group.id);

            if (!groupTasks.length) {
                return;
            }

            groupedTasks.push({
                priority: group.priority,
                tasks: groupTasks.sort((a, b) => b.priority - a.priority)
            });
        });
    }

    const addTasksToArray = (groupedTasks, usesTime) => {
        tasks.forEach(task => {
            // Check if the task should be rendered at the current time
            // First checks if the component it will be rendered in even cares about time
            // Then it checks if the task repeats
            // And then it check if the task is in a time group
            if (task.repeats) {
                if (!task.timeGroup) {
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

    useEffect(() => {
        if (tasksLoading || groupsLoading || categoriesLoading) {
            setIsLoading(true);
            return;
        }

        if (tasks === false || groups === false || categories === false) {
            setData(false);
            setIsLoading(false);
            return;
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

        const addTasksToData = () => {
            const groupedTasks = [];

            addGroupsToArray(groupedTasks, usesTime);
            addTasksToArray(groupedTasks, usesTime);

            // Sort the tasks to be rendered in increasing priority
            groupedTasks.sort((a, b) => b.priority - a.priority);

            setData(groupedTasks);
            setIsLoading(false);
        }

        addTasksToData();

        timeOut = setTimeout(addTasksToData, findLeastUpdateTime() - (new Date).getTime());

        return () => {
            clearTimeout(timeOut);
        }

    }, [tasksLoading, groupsLoading, categoriesLoading]);

    return {isLoading, data};
}