import styles from './Task.module.scss';
import CategoryIndicator from "../CategoryIndicator/CategoryIndicator";
import {useContext, useMemo} from "react";
import {motion} from "framer-motion";
import {MiniPagesContext} from "@/context/MiniPagesContext";
import CurrentProgress from "../CurrentProgress/CurrentProgress";
import {TbFlame, TbHash, TbTargetArrow} from "react-icons/all";
import {useGetTaskCurrentEntry} from "@/hooks/get-hooks/useGetTaskCurrentEntry";
import TextSwitchContainer from "@/components/containers/TextSwitchContainer/TextSwitchContainer";
import {TbCheck} from "react-icons/tb";

const RepeatDetails = ({task}) => {
    const {data: entry, isLoading} = useGetTaskCurrentEntry(task._id, task.currentEntryId);

    return (
        <div className={styles.repeatDetails}>
            {task.type === "Number" &&
                <div>
                    <TbHash />
                    <TextSwitchContainer>
                        {isLoading && "..."}
                        {!isLoading && entry.value}
                    </TextSwitchContainer>
                </div>
            }
            {task.type === "Number" && task.goal?.number &&
                <div>
                    <TbTargetArrow />
                    <TextSwitchContainer>
                        {task.goal?.number}
                    </TextSwitchContainer>
                </div>
            }
            {task.type === "Number" && task.longGoal?.type &&
                <div className={styles.repeatSeparator}>
                    |
                </div>
            }
            {task.longGoal?.type &&
                <>
                    <div>
                        {task.longGoal?.type === "Streak" &&
                            <>
                                <TbFlame />
                                <TextSwitchContainer>
                                    {task.streak?.number}
                                </TextSwitchContainer>
                            </>
                        }
                        {task.longGoal?.type === "Total Completed" &&
                            <>
                                <TbCheck />
                                <TextSwitchContainer>
                                    {task.totalCompletedEntries}
                                </TextSwitchContainer>
                            </>
                        }
                    </div>
                    <div>
                        <TbTargetArrow />
                        <TextSwitchContainer>
                            {task.longGoal?.number}
                        </TextSwitchContainer>
                    </div>
                </>
            }
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

    const handleTaskClick = (taskId) => {
        miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'task-view', id: taskId}});
    }

    return (
        <motion.div
            className={`${styles.container} ${!tasksIsCompleted ? styles.completed : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{duration: 1, type: "spring"}}
            layout
        >
            {tasks[0].category && <CategoryIndicator categoryId={tasks[0].category} groupId={tasks[0].group}/>}
            <div className={"Stack-Container"}>
                {tasks.map((task, index) =>
                    <div key={index} className={styles.task} onClick={() => handleTaskClick(task._id)}>
                        <div className={styles.detailsList}>
                            <div className={styles.titleContainer}>{task.title}</div>
                            <RepeatDetails task={task} />
                        </div>
                        <CurrentProgress task={task}/>
                    </div>
                )}
            </div>
        </motion.div>

    );
};

export default Task;
