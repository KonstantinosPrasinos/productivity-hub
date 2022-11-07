import React from 'react';
import styles from './SurfaceContainer.module.scss';
import {AnimatePresence, motion} from "framer-motion";

const SurfaceContainer = ({children, isLoading, isOpaque = false}) => {
    return (
        <div className={`${styles.container} ${isOpaque ? styles.opaque : ''} `}>
            <div className={styles.surface}>
                <AnimatePresence>
                    <motion.div className={isLoading ? styles.loadingContainer : ''} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                        <div className={styles.loadingIndicator}></div>
                    </motion.div>
                </AnimatePresence>
                {children}
            </div>
        </div>
    );
};

export default SurfaceContainer;
