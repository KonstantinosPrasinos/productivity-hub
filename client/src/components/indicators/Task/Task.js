import VisualStreak from "../VisualStreak/VisualStreak";

import styles from './Task.module.scss';
import CategoryIndicator from "../CategoryIndicator/CategoryIndicator";
import {useContext} from "react";
import {ScreenSizeContext} from "../../../context/ScreenSizeContext";
import {useSelector} from "react-redux";

const Task = ({tasks}) => {
    const categories = useSelector((state) => state.categories.categories);
    const groups = useSelector((state) => state.groups.groups);

    const category = tasks[0].category !== null ? categories.find(category => category.id === tasks[0].category) : null;
    const group = tasks[0].timeGroup !== null ? groups.find(group => group.id === tasks[0].timeGroup) : null;

    const screenSizeContext = useContext(ScreenSizeContext);

    return (
        <div className={`Rounded-Container Stack-Container ${styles.container} ${screenSizeContext.state === 'small' ? styles.small : ''}`}>
            {category !== null && group !== null && <div className={styles.categoryContainer}>
                <CategoryIndicator
                    category={category.name}
                    group={group.name}
                    color={category.color}
                />
            </div>}
            {tasks.map((task, index) => (
                <div key={index} className={`Stack-Container`}>
                    <div className={styles.titleContainer}>
                        <div className={`Title`}>{task.name}</div>
                    </div>
                    <VisualStreak task={task}></VisualStreak>
                </div>
            ))}
        </div>
    );
};

export default Task;
