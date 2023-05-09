import styles from './Task.module.scss';
import CategoryIndicator from "../CategoryIndicator/CategoryIndicator";
import {useContext, useMemo} from "react";
import {motion} from "framer-motion";
import {MiniPagesContext} from "@/context/MiniPagesContext";
import CurrentProgress from "../CurrentProgress/CurrentProgress";
import {TbFlame, TbHash, TbTargetArrow} from "react-icons/all";

const RepeatDetails = ({longGoal}) => {
    return (
        <div className={styles.repeatDetails}>
            <div>
                {longGoal.type === "Streak" &&
                    <>
                        <TbFlame />
                    </>
                }
                {longGoal.type === "Total completed" &&
                    <>

                    </>
                }
                {longGoal.type === "Total number" &&
                    <>
                        <TbHash />
                    </>
                }
            </div>
            <div>
                <TbTargetArrow />
                {longGoal?.number}
            </div>
        </div>
    );
}

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

    const handleTaskClick = () => {
        miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'task-view', id: tasks[0]._id}});
    }

    return (
        <motion.div
            className={`${styles.container} ${!tasksIsCompleted ? styles.completed : ''}`}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5}}
            transition={{duration: 0.2}}

            onClick={(event) => handleTaskClick(event)}
            layout
        >
            {tasks[0].category && <CategoryIndicator categoryId={tasks[0].category} groupId={tasks[0].group}/>}
            <div className={styles.taskList}>
                {tasks.map((task, index) =>
                    <div key={index} className={styles.task}>
                        <div className={styles.detailsList}>
                            <div className={styles.titleContainer}>{task.title}</div>
                            {task.longGoal?.type && <RepeatDetails longGoal={task?.longGoal}/>}
                        </div>
                        <CurrentProgress task={task}/>
                    </div>
                )}
            </div>
        </motion.div>

    );
};

export default Task;
