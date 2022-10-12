import {useContext} from "react";

import {ScreenSizeContext} from "../../context/ScreenSizeContext";
import styles from './Home.module.scss'
import Task from "../../components/indicators/Task/Task";
import {AnimatePresence} from "framer-motion";
import {useRenderTasks} from "../../hooks/useRenderTasks";

const Home = () => {
    const groupedTasks = useRenderTasks(true);

    const screenSizeContext = useContext(ScreenSizeContext);

    return (
        <div className={`${styles.container} ${screenSizeContext.state === 'small' ? styles.small : ''}`}>
            <div className={`Stack-Container ${styles.leftSide}`}>
                <AnimatePresence>
                    {groupedTasks.map((task) => task.hasOwnProperty('timeGroup') ?
                        (<Task key={task.id} tasks={[task]}></Task>) :
                        (<Task key={task.tasks[0].id} tasks={task.tasks}></Task>)
                    )}
                </AnimatePresence>
            </div>
            {screenSizeContext.state !== 'small' &&
                <div className={`Stack-Container ${styles.rightSide}`}>

                </div>}
        </div>
    );
};

export default Home;
