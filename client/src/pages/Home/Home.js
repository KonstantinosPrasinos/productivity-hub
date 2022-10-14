import {useContext} from "react";
import {ScreenSizeContext} from "../../context/ScreenSizeContext";
import styles from './Home.module.scss'
import Task from "../../components/indicators/Task/Task";
import {AnimatePresence} from "framer-motion";
import {useRenderTasks} from "../../hooks/useRenderTasks";
import CollapsibleContainer from "../../components/utilities/CollapsibleContainer/CollapsibleContainer";
import {motion} from "framer-motion";

const Home = () => {
    const {completedTasks, incompleteTasks} = useRenderTasks(true);

    const screenSizeContext = useContext(ScreenSizeContext);

    return (
        <div className={`${styles.container}`}>
            <div className={`Stack-Container ${styles.leftSide}`}>
                {completedTasks.length === 0 && incompleteTasks.length === 0 &&
                    <motion.div positionTransition className={`Rounded-Container ${styles.noTasks}`}>No tasks for now</motion.div>
                }
                <AnimatePresence>
                    {incompleteTasks.map((task) => task.hasOwnProperty('timeGroup') ?
                        (<Task key={task.id} tasks={[task]}></Task>) :
                        (<Task key={task.tasks[0].id} tasks={task.tasks}></Task>)
                    )}
                </AnimatePresence>
                {completedTasks.length > 0 && <CollapsibleContainer label={'Completed'}>
                    <AnimatePresence>
                        {completedTasks.map((task) => task.hasOwnProperty('timeGroup') ?
                            (<Task key={task.id} tasks={[task]}></Task>) :
                            (<Task key={task.tasks[0].id} tasks={task.tasks}></Task>)
                        )}
                    </AnimatePresence>
                </CollapsibleContainer>}
            </div>
            {screenSizeContext.state !== 'small' &&
                <div className={`Stack-Container ${styles.rightSide}`}>

                </div>}
        </div>
    );
};

export default Home;
