import React, {useContext} from 'react';
import {UndoContext} from "../../../context/UndoContext";
import {AnimatePresence} from "framer-motion";
import IconButton from "../../buttons/IconButton/IconButton";
import {TbX} from "react-icons/tb";
import styles from "./UndoHandler.module.scss"
import {useUndoDeleteTask} from "../../../hooks/delete-hooks/useUndoDeleteTask";
import {motion} from "framer-motion";

const UndoPrompt = ({type, deleteFunction, undoFunction}) => (
    <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        transition={{duration: 0.2}}
        className={styles.container}
    >
        <button
            onClick={undoFunction}
        >
            Undo {type} deletion
        </button>
        <IconButton onClick={deleteFunction}>
            <TbX />
        </IconButton>
    </motion.div>
)

const UndoHandler = () => {
    const undoContext = useContext(UndoContext);
    const {type, id} = undoContext.state;

    const {mutate: undoDeleteTask} = useUndoDeleteTask();

    const handleUndo = () => {
        switch (type) {
            case 'task':
                undoDeleteTask(id);
                break;
            default:
                break;
        }
        undoContext.dispatch({type: 'REMOVE_UNDO'});
    }

    const handleDelete = () => {
        undoContext.dispatch({type: 'REMOVE_UNDO'});
    }

    return (
        <AnimatePresence>
            {
                undoContext.state.type &&
                <UndoPrompt
                    type={type}
                    id={id}
                    deleteFunction={handleDelete}
                    undoFunction={handleUndo}
                />
            }
        </AnimatePresence>
    );
};

export default UndoHandler;
