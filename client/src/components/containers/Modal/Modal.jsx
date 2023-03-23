import React from 'react';
import styles from './Modal.module.scss';
import {AnimatePresence, motion} from "framer-motion";
import LoadingIndicator from "../../indicators/LoadingIndicator/LoadingIndicator";

const Modal = ({children, isLoading, isOverlay = false, dismountFunction = () => {}}) => {
    const handleContainerClick = (e) => {
        if (isOverlay && e.currentTarget === e.target) dismountFunction();
    }

    return (
        <motion.div
            className={`${styles.container} ${isOverlay ? styles.transparent : ''}`}
            onClick={handleContainerClick}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.1}}
        >
            <motion.div className={styles.surface} layout>
                <AnimatePresence>
                    {isLoading && <motion.div
                        className={styles.loadingContainer}
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.2}}
                    >
                        <LoadingIndicator size={'full'} />
                    </motion.div>}
                </AnimatePresence>
                {children}
            </motion.div>
        </motion.div>
    );
};

export default Modal;
