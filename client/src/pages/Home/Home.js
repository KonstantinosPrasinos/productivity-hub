import {useContext} from "react";

import {ScreenSizeContext} from "../../context/ScreenSizeContext";
import styles from './Home.module.scss'
import Task from "../../components/indicators/Task/Task";
import {useSelector} from "react-redux";

const Home = () => {
    const tasks = useSelector((state) => state.tasks.tasks);
    const groups = useSelector((state) => state.groups.groups);

    // Create array of tasks to be rendered
    const groupedTasks = [];

    // Add tasks to array grouped by timeGroup sorted by task priority
    groups.forEach(group => {
        groupedTasks.push({priority: group.priority, tasks: tasks.filter(task => task.timeGroup === group.id).sort((a, b) => b.priority - a.priority)});
    });

    // Add the tasks that aren't in a timeGroup
    groupedTasks.push(...tasks.filter(task => task.timeGroup === null));

    // Sort the tasks to be rendered in increasing priority
    groupedTasks.sort((a, b) => b.priority - a.priority);

    const screenSizeContext = useContext(ScreenSizeContext);

    return (
        <div className={`${styles.container} ${screenSizeContext.state === 'small' ? styles.small : ''}`}>
            <div className={`Stack-Container ${styles.leftSide}`}>
                {groupedTasks.map((task) => task.hasOwnProperty('timeGroup') ?
                    (<Task key={task.id} tasks={[task]}></Task>) :
                    (<Task key={task.tasks[0].id} tasks={task.tasks}></Task>)
                )}
            </div>
            {screenSizeContext.state !== 'small' &&
                <div className={`Stack-Container ${styles.rightSide}`}>

                </div>}
        </div>
    );
};

export default Home;
