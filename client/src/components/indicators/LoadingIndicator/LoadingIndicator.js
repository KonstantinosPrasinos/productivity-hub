import React from 'react';
import {motion} from 'framer-motion';
import styles from './LoadingIndicator.module.scss'

const LoadingIndicator = () => {
    return (
        <motion.div
            className={styles.container}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
        >
            <div className={styles.indicator} />
        </motion.div>
    );
};

export default LoadingIndicator;
