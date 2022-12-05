import Streak from "../Streak/Streak";

import styles from './Task.module.scss';
import CategoryIndicator from "../CategoryIndicator/CategoryIndicator";
import {useContext, useMemo} from "react";
import {motion} from "framer-motion";
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import CurrentProgress from "../CurrentProgress/CurrentProgress";
import {useGetCategories} from "../../../hooks/get-hooks/useGetCategories";
import {useGetGroups} from "../../../hooks/get-hooks/useGetGroups";

const Task = ({tasks}) => {
    const {isLoading: categoriesLoading, data: categories} = useGetCategories();
    const {isLoading: groupsLoading, data: groups} = useGetGroups();

    const category = tasks[0].category !== null ? categories?.find(category => category.id === tasks[0].category) : null;
    const group = tasks[0].timeGroup !== null ? groups?.find(group => group.id === tasks[0].timeGroup) : null;

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
                            {task.category && !categoriesLoading && !groupsLoading &&
                                <CategoryIndicator
                                    category={category}
                                    group={group}
                                />}
                            {task.title}
                        </div>
                        <CurrentProgress task={task}/>
                    </div>
                    {task.repeats && <Streak streak={task.streak} />}
                    {/*{(task.repeats || task.category) && <div className={styles.topLine}>*/}
                    {/*    <div className={`${styles.infoContainer} ${task.repeats ? styles.repeats : ''}`}>*/}
                    {/*        {task.repeats && <div className={`${styles.titleContainer}`}>{task.title}</div>}*/}
                    {/*        {index === 0 && task.category &&*/}
                    {/*            <div onClick={(e) => e.stopPropagation()}>*/}
                    {/*                <CategoryIndicator*/}
                    {/*                    category={category.title}*/}
                    {/*                    categoryId={category.id}*/}
                    {/*                    group={group?.title}*/}
                    {/*                    color={category.color}*/}
                    {/*                />*/}
                    {/*            </div>*/}
                    {/*        }*/}
                    {/*    </div>*/}
                    {/*</div>}*/}
                    {/*<div className={`Horizontal-Flex-Container ${!task.repeats ? 'Space-Between' : 'Align-Right'}`}>*/}
                    {/*    {!task.repeats && <div className={`${styles.titleContainer}`}>{task.title}</div>}*/}
                    {/*    <div onClick={(e) => e.stopPropagation()} className={styles.streakContainer}>*/}
                    {/*        <Streak task={task}></Streak>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>))}
        </motion.div>

    );
};

export default Task;
