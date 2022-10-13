import React from 'react';
import Task from "../../components/indicators/Task/Task";
import {AnimatePresence} from "framer-motion";
import {useRenderTasks} from "../../hooks/useRenderTasks";
import styles from './TaskList.module.scss';
import CollapsibleContainer from "../../components/utilities/CollapsibleContainer/CollapsibleContainer";

const TaskList = () => {
    const {completedTasks, incompleteTasks} = useRenderTasks(true);

    return (
        <div className={`Stack-Container ${styles.container}`}>
            <AnimatePresence>
                {incompleteTasks.map((task) => task.hasOwnProperty('timeGroup') ?
                    (<Task key={task.id} tasks={[task]}></Task>) :
                    (<Task key={task.tasks[0].id} tasks={task.tasks}></Task>)
                )}
            </AnimatePresence>
            {completedTasks.length > 0 && <CollapsibleContainer label={'Completed'}>
                <AnimatePresence>
                    {completedTasks.map((task) => task.hasOwnProperty('timeGroup') ?
                        (<Task key={task.id} tasks={[task]}></Task>) :
                        (<Task key={task.tasks[0].id} tasks={task.tasks}></Task>)
                    )}
                </AnimatePresence>
            </CollapsibleContainer>}
        </div>
    );
};

export default TaskList;
