import VisualStreak from "../VisualStreak/VisualStreak";

import styles from './Task.module.scss';
import CategoryIndicator from "../CategoryIndicator/CategoryIndicator";
import {useContext} from "react";
import {ScreenSizeContext} from "../../../context/ScreenSizeContext";
import {useSelector} from "react-redux";
import {motion} from "framer-motion";
import {MiniPagesContext} from "../../../context/MiniPagesContext";

const Task = ({tasks}) => {
    const categories = useSelector((state) => state?.categories.categories);
    const groups = useSelector((state) => state?.groups.groups);

    const category = tasks[0].category !== null ? categories.find(category => category.title === tasks[0].category) : null;
    const group = tasks[0].timeGroup !== null ? groups.find(group => group.id === tasks[0].timeGroup) : null;

    const screenSizeContext = useContext(ScreenSizeContext);
    const miniPagesContext = useContext(MiniPagesContext);

    return (
        <motion.div
            className={`Rounded-Container Stack-Container Has-Shadow ${styles.container} ${screenSizeContext.state === 'small' ? styles.small : ''}`}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}

            onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'task-view', id: tasks[0].id}})}
        >
            {tasks.map((task, index) => (
                <div key={index} className={`Stack-Container`}>
                    <div className={styles.topLine}>
                        <div className={`${styles.infoContainer} ${task.repeats ? styles.repeats : ''}`}>
                            <div className={`${styles.titleContainer}`}>{task.title}</div>
                            {index === 0 && task.category !== null &&
                                <div onClick={(e) => e.stopPropagation()}>
                                    <CategoryIndicator
                                        category={task.category}
                                        group={group?.title}
                                        color={category.color}
                                    />
                                </div>
                            }
                        </div>
                        {!task.repeats && <div onClick={(e) => e.stopPropagation()}><VisualStreak task={task}></VisualStreak></div>}
                    </div>
                    {task.repeats && <div onClick={(e) => e.stopPropagation()}><VisualStreak task={task}></VisualStreak></div>}
                </div>))}
        </motion.div>

    );
};

export default Task;
