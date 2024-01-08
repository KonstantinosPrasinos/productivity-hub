import React from 'react';
import styles from "./TaskList.module.scss";
import {motion} from "framer-motion";
import Task from "@/components/indicators/Task/Task.jsx";

const variants = {
    hidden: {opacity: 0},
    visible: {
        opacity: 1,
        transition: {staggerChildren: 0.1}
    },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
}

const childVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
}

const TaskList = ({tasks = []}) => {
    return (
        <motion.div
            className={`Stack-Container ${styles.leftSide}`}

            variants={variants}
            initial={"hidden"}
            animate={"visible"}
            exit={"exit"}
        >
            {tasks.length === 0 &&
                <motion.div
                    initial={"hidden"}
                    animate={"visible"}
                    exit={"exit"}
                    variants={childVariants}
                    className={`Empty-Indicator-Container`}
                >
                    No tasks for now
                </motion.div>
            }
            {tasks.length > 0 && tasks.map((task) => !task.hasOwnProperty('tasks') ?
                (<Task key={task._id} tasks={[task]}></Task>) :
                (<Task key={task.tasks[0]._id} tasks={task.tasks}></Task>)
            )}
        </motion.div>
    );
};

export default TaskList;