import React from 'react';
import {motion} from 'framer-motion';
import styles from './LoadingIndicator.module.scss'
import PropTypes from "prop-types";

const LoadingIndicator = ({size, type="ring", invertColors=false, indicatorSize=""}) => {
    return (
        <motion.div
            className={`Rounded-Container Has-Shadow ${styles.container} ${styles[size]} ${invertColors ? styles.inverted : ""} ${styles[indicatorSize]}`}
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

LoadingIndicator.propTypes = {
    type: PropTypes.oneOf(["ring", "dots"]),
    size: PropTypes.oneOf(["normal", "fullscreen", "inline"]),
    indicatorSize: PropTypes.oneOf(["medium", "large", "small"])
}

export default LoadingIndicator;
