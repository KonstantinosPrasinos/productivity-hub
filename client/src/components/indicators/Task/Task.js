import VisualStreak from "../VisualStreak/VisualStreak";

import styles from './Task.module.scss';

const Task = ({tasks}) => {
    const taskObj = {

    }
    return (
        <div className={`Rounded-Container Stack-Container ${styles.container}`}>
            {tasks.map((task, index) => (
                <div key={index}>
                    <div className={styles.titleContainer}>
                        <div className={`Title`}>{task.title}</div>
                        <div>Category | Group</div>
                    </div>
                    <VisualStreak streak={task.streak}></VisualStreak>
                </div>
            ))}
        </div>
    );
};

export default Task;
