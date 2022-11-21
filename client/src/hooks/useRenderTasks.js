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

    const checkTime = (task) => {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        let isCorrectTime = false;

        for (const startingTime of task.repeatRate.startingDate) {
            const formattedDate = new Date();
            formattedDate.setTime(startingTime);

            const differenceInDays = (startingDate) => {
                // Calculates the difference in days between two dates
                const days = ((startingDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24))
                return days < 0 ? Math.ceil(days) : Math.floor(days);
            }

            switch (task.repeatRate.bigTimePeriod) {
                case 'Days':
                    if (differenceInDays(formattedDate) % task.repeatRate.number === 0) {
                        isCorrectTime = true;
                    }
                    break;
                case 'Weeks':
                    if (differenceInDays(formattedDate) % (task.repeatRate.number * 7) === 0) {
                        isCorrectTime = true;
                    }
                    break;
                case 'Months':
                    const yearsDifference = currentDate.getFullYear() - formattedDate.getFullYear();
                    const monthsDifference = currentDate.getMonth() * yearsDifference - formattedDate.getMonth();
                    if (monthsDifference % task.repeatRate.number === 0) {
                        isCorrectTime = true;
                    }
                    break;
                case 'Years':
                    if (currentDate.getFullYear() === formattedDate.getFullYear() &&
                        (currentDate.getFullYear() - formattedDate.getFullYear()) % task.repeatRate.number === 0 &&
                        currentDate.getMonth() === formattedDate.getMonth() &&
                        currentDate.getDate() === formattedDate.getDate()
                    ){
                        isCorrectTime = true;
                    }
                    break;
            }

            if (isCorrectTime) {
                return true;
            }
        }

        return false;
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

        setIsLoading(true);

        const groupedTasks = [];

        addGroupsToArray(groupedTasks, usesTime);
        addTasksToArray(groupedTasks, usesTime);

        // Sort the tasks to be rendered in increasing priority
        groupedTasks.sort((a, b) => b.priority - a.priority);

        setData(groupedTasks);
        setIsLoading(false);

    }, [tasksLoading, groupsLoading, categoriesLoading]);

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

    return {isLoading, data};
}