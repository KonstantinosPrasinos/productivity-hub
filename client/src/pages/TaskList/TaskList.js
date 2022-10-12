import React from 'react';
import Task from "../../components/indicators/Task/Task";
import {AnimatePresence} from "framer-motion";
import {useRenderTasks} from "../../hooks/useRenderTasks";
import styles from './TaskList.module.scss';

const TaskList = () => {
    const groupedTasks = useRenderTasks(false);

    return (
        <div className={`Stack-Container ${styles.container}`}>
            <AnimatePresence>
                {groupedTasks.map((task) => task.hasOwnProperty('timeGroup') ?
                    (<Task key={task.id} tasks={[task]}></Task>) :
                    (<Task key={task.tasks[0].id} tasks={task.tasks}></Task>)
                )}
            </AnimatePresence>
        </div>
    );
};

export default TaskList;
