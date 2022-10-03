import {useContext} from "react";

import {ScreenSizeContext} from "../../context/ScreenSizeContext";
import styles from './Home.module.scss'
import Task from "../../components/indicators/Task/Task";
import {useSelector} from "react-redux";
import {AnimatePresence} from "framer-motion";

const Home = () => {
    const tasks = useSelector((state) => state?.tasks.tasks);
    const groups = useSelector((state) => state?.groups.groups);

    // Create array of tasks to be rendered
    const currentDate = new Date();
    const groupedTasks = [];

    // Add tasks to array grouped by timeGroup sorted by task priority. Only if they have children tasks
    groups.forEach(group => {
        let isCorrectTime = false;

        // Check if the task should be rendered at the current time
        for (const startingTime of group.startingDate) {
            const differenceInDays = (startingDate) => {
                return ((currentDate.getTime() - startingDate.getTime()) / (1000 * 3600 * 24));
            }

            switch (group.bigTimePeriod) {
                case 'Days':
                    if (differenceInDays(startingTime) % group.number !== 0) {
                        isCorrectTime = true;
                    }
                    break;
                case 'Weeks':
                    if (differenceInDays(startingTime) % (group.number * 7) !== 0) {
                        isCorrectTime = true;
                    }
                    break;
                case 'Months':
                    const yearsDifference = currentDate.getFullYear() - startingTime.getFullYear();
                    const monthsDifference = currentDate.getMonth() * yearsDifference - startingTime.getMonth();
                    if (monthsDifference % group.number !== 0) {
                        isCorrectTime = true;
                    }
                    break;
                case 'Years':
                    if (currentDate.getFullYear() !== startingTime.getFullYear() &&
                        (currentDate.getFullYear() - startingTime.getFullYear()) % group.number !== 0 &&
                        currentDate.getMonth() !== startingTime.getMonth() &&
                        currentDate.getDate() !== startingTime.getDate()
                    ){
                        isCorrectTime = true;
                    }
                    break;
            }

            if (isCorrectTime) {
                break;
            }
        }

        if (!isCorrectTime) {
            return;
        }

        const groupTasks = tasks.filter(task => task.timeGroup === group.id)

        if (!groupTasks.length) {
            return;
        }

        groupedTasks.push({
            priority: group.priority,
            tasks: groupTasks.sort((a, b) => b.priority - a.priority)
        })
    })

    // Add the tasks that aren't in a timeGroup
    groupedTasks.push(...tasks.filter(task => task.timeGroup === null));


    // Sort the tasks to be rendered in increasing priority
    groupedTasks.sort((a, b) => b.priority - a.priority);

    const screenSizeContext = useContext(ScreenSizeContext);

    return (
        <div className={`${styles.container} ${screenSizeContext.state === 'small' ? styles.small : ''}`}>
            <div className={`Stack-Container ${styles.leftSide}`}>
                <AnimatePresence>
                    {groupedTasks.map((task) => task.hasOwnProperty('timeGroup') ?
                        (<Task key={task.id} tasks={[task]}></Task>) :
                        (<Task key={task.tasks[0].id} tasks={task.tasks}></Task>)
                    )}
                </AnimatePresence>
            </div>
            {screenSizeContext.state !== 'small' &&
                <div className={`Stack-Container ${styles.rightSide}`}>

                </div>}
        </div>
    );
};

export default Home;
