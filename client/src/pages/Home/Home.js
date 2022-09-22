import {useContext} from "react";

import {ScreenSizeContext} from "../../context/ScreenSizeContext";
import styles from './Home.module.scss'
import Task from "../../components/indicators/Task/Task";

const Home = () => {
    // const groups = useSelector((state) => state.content.groups);
    const tasks = [{title: 'Workout', streak: '100111'}, {title: 'Workout', streak: '100110'}]; //place holder
    const screenSizeContext = useContext(ScreenSizeContext);

    return (
        <div className={`${styles.container} ${screenSizeContext.state === 'small' ? styles.small : ''}`}>
            <div className={`Stack-Container ${styles.leftSide}`}>
                {tasks.map((task, index) => (<Task key={index} tasks={tasks} category={'Workouts'} group={'Monday'} color={'green'}></Task>))}
            </div>
            {screenSizeContext.state !== 'small' &&
                <div className={`Stack-Container ${styles.rightSide}`}>

                </div>}
        </div>
    );
};

export default Home;
