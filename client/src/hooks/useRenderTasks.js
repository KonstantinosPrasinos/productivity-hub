import {useSelector} from "react-redux";

export function useRenderTasks(usesTime) {
    const tasks = useSelector((state) => state?.tasks.tasks);
    const groups = useSelector((state) => state?.groups.groups);

    // Create array of tasks to be rendered
    const groupedTasks = [];

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

    // Add tasks to array grouped by timeGroup sorted by task priority. Only if they have children tasks
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

    // Add the tasks that aren't in a timeGroup
    tasks.forEach(task => {

        // Check if the group should be rendered at the current time
        if (usesTime) {
            if (!checkTime(task)) {
                return;
            }
        }

        if (!task.timeGroup) {
            groupedTasks.push(task);
        }
    })


    // Sort the tasks to be rendered in increasing priority
    groupedTasks.sort((a, b) => b.priority - a.priority);

    return groupedTasks;
}