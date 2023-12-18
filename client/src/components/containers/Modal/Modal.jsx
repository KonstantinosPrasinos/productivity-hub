import React from 'react';
import styles from './Modal.module.scss';
import {motion} from "framer-motion";
import {createPortal} from "react-dom";
import LoadingScreen from "@/components/indicators/LoadingScreen/LoadingScreen";

const Modal = ({children, isLoading, isOverlay = false, dismountFunction = () => {}, isPortal = true}) => {
    const handleContainerClick = (e) => {
        if (isOverlay && e.currentTarget === e.target) dismountFunction();
    }

    if (isLoading) return (
        <LoadingScreen />
    )

    if (isPortal) return createPortal((
        <motion.div
            className={`${styles.container} ${isOverlay ? styles.transparent : ''}`}
            onClick={handleContainerClick}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.1}}
        >
            <motion.div className={styles.surface} layout>
                {children}
            </motion.div>
        </motion.div>
    ), document.getElementById("app") ?? document.getElementById("root"));

    return <motion.div
        className={`${styles.container} ${isOverlay ? styles.transparent : ''}`}
        onClick={handleContainerClick}
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{duration: 0.1}}
    >
        <motion.div className={styles.surface} layout>
            {children}
        </motion.div>
    </motion.div>
};

export default Modal;
