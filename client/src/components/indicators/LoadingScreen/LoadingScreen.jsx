import React from 'react';
import styles from './LoadingScreen.module.scss';
const LoadingScreen = () => {
    return (
        <div className={styles.container}>
            <svg viewBox="0 0 10 10" className={styles.svg}>
                <circle r="2" cx={5} cy={5} className={styles.firstCircle} />
            </svg>
            <svg viewBox="0 0 10 10" className={styles.svg}>
                <circle r="2" cx={5} cy={5} className={styles.secondCircle} />
            </svg>
            <svg viewBox="0 0 10 10" className={styles.svg}>
                <circle r="2" cx={5} cy={5} className={styles.thirdCircle} />
            </svg>
        </div>
    );
};

export default LoadingScreen;
