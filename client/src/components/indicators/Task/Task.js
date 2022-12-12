import Streak from "../Streak/Streak";

import styles from './Task.module.scss';
import CategoryIndicator from "../CategoryIndicator/CategoryIndicator";
import {useContext, useMemo} from "react";
import {motion} from "framer-motion";
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import CurrentProgress from "../CurrentProgress/CurrentProgress";

const Task = ({tasks}) => {
    const miniPagesContext = useContext(MiniPagesContext);

    const checkIfCompleted = () => {
        let isCompleted = false;

        // tasks.map(task => {
        //     if (task.type === 'Checkbox') {
        //         if (task.previousEntry !== 1) {
        //             isCompleted = true;
        //         }
        //     } else {
        //         if (task.goal.type === 'At least' && task.goal.number >= task.previousEntry) {
        //             isCompleted = true;
        //         }
        //     }
        // });

        return isCompleted || true;
    }

    const tasksIsCompleted = useMemo(() => checkIfCompleted(), [tasks]);

    return (
        <motion.div
            className={`Rounded-Container Stack-Container ${styles.container} ${!tasksIsCompleted ? styles.completed : ''}`}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            layout

            onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'task-view', id: tasks[0]._id}})}
        >
            {tasks.map((task, index) => (
                <div key={index} className={`Stack-Container`}>
                    <div className={'Horizontal-Flex-Container Space-Between'}>
                        <div className={'Horizontal-Flex-Container'}>
                            {task.category &&
                                <CategoryIndicator
                                    categoryId={task.category}
                                    groupId={task?.group}
                                />}
                            {task.title}
                        </div>
                        <CurrentProgress task={task}/>
                    </div>
                    {task.repeats && <Streak streak={task.streak} />}
                </div>))}
        </motion.div>

    );
};

export default Task;
