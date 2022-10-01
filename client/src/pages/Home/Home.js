import {useContext} from "react";

import {ScreenSizeContext} from "../../context/ScreenSizeContext";
import styles from './Home.module.scss'
import Task from "../../components/indicators/Task/Task";
import {useSelector} from "react-redux";
import {AnimatePresence} from "framer-motion";

const Home = () => {
    const tasks = useSelector((state) => state.tasks.tasks);
    const groups = useSelector((state) => state.groups.groups);

    // Create array of tasks to be rendered
    const groupedTasks = [];

    // Add tasks to array grouped by timeGroup sorted by task priority. Only if they have children tasks
    groups.forEach(group => {
        const groupTasks = tasks.filter(task => task.timeGroup === group.id)

        if (!groupTasks.length) {
            return;
        }

        console.log(groupTasks);

        groupedTasks.push({
            priority: group.priority,
            tasks: groupTasks.sort((a, b) => b.priority - a.priority)
        })
    })

    // Add the tasks that aren't in a timeGroup
    groupedTasks.push(...tasks.filter(task => task.timeGroup === null));

    // Sort the tasks to be rendered in increasing priority
    groupedTasks.sort((a, b) => b.priority - a.priority);

    console.log(groupedTasks);

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
