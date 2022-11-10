import {useContext} from "react";
import {ScreenSizeContext} from "../../context/ScreenSizeContext";
import styles from './Home.module.scss'
import Task from "../../components/indicators/Task/Task";
import {AnimatePresence} from "framer-motion";
import {useRenderTasks} from "../../hooks/useRenderTasks";
import {motion} from "framer-motion";

const Home = () => {
    const {tasks} = useRenderTasks(true);

    const screenSizeContext = useContext(ScreenSizeContext);

    return (
        <div className={`${styles.container}`}>
            <div className={`Stack-Container ${styles.leftSide}`}>
                <AnimatePresence exitBeforeEnter initial={false}>
                    {tasks.length === 0 &&
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.3 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            className={`Empty-Indicator-Container`}
                        >
                            No tasks for now
                        </motion.div>
                    }
                    {tasks.length > 0 && <AnimatePresence initial={false}>
                        {tasks.map((task) => !task.hasOwnProperty('tasks') ?
                            (<Task key={task._id} tasks={[task]}></Task>) :
                            (<Task key={task.tasks[0]._id} tasks={task.tasks}></Task>)
                        )}
                    </AnimatePresence>}
                </AnimatePresence>
            </div>
            {screenSizeContext.state !== 'small' &&
                <div className={`Stack-Container ${styles.rightSide}`}>

                </div>}
        </div>
    );
};

export default Home;
