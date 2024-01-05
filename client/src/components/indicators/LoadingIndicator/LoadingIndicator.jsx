import React from 'react';
import {motion} from 'framer-motion';
import styles from './LoadingIndicator.module.scss'

const LoadingIndicator = ({size, type="ring"}) => {
    return (
        <motion.div
            className={`Rounded-Container Has-Shadow ${styles.container} ${styles[size]}`}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
        >
            {type === "ring" && <div className={styles.indicator} />}
            {type === "dots" && <div className={styles.dotsIndicator}>
                <div className={styles.dots}></div>
                <div className={styles.dots}></div>
                <div className={styles.dots}></div>
            </div>}
        </motion.div>
    );
};

export default LoadingIndicator;
