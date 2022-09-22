import VisualStreak from "../VisualStreak/VisualStreak";

import styles from './Task.module.scss';
import CategoryIndicator from "../CategoryIndicator/CategoryIndicator";
import {useContext} from "react";
import {ScreenSizeContext} from "../../../context/ScreenSizeContext";

const Task = ({tasks, category, group, color}) => {
    const screenSizeContext = useContext(ScreenSizeContext);

    return (
        <div className={`Rounded-Container Stack-Container ${styles.container} ${screenSizeContext.state === 'small' ? styles.small : ''}`}>
            <div className={styles.categoryContainer}>
                <CategoryIndicator category={category} group={group} color={color} />
            </div>
            {tasks.map((task, index) => (
                <div key={index} className={`Stack-Container`}>
                    <div className={styles.titleContainer}>
                        <div className={`Title`}>{task.title}</div>

                    </div>
                    <VisualStreak streak={task.streak}></VisualStreak>
                </div>
            ))}
        </div>
    );
};

export default Task;
