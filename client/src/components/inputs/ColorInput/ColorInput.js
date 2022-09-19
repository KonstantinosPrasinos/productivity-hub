import React from 'react';

import styles from './ColorInput.module.scss';

const ColorInput = ({selected, setSelected}) => {
    return (
        <div className={styles.container}>
            <div className={`${styles.colorContainer} ${styles.red} ${selected === 'red' ? styles.selected : ''}`} onClick={() => setSelected('red')}></div>
            <div className={`${styles.colorContainer} ${styles.orange} ${selected === 'orange' ? styles.selected : ''}`} onClick={() => setSelected('orange')}></div>
            <div className={`${styles.colorContainer} ${styles.yellow} ${selected === 'yellow' ? styles.selected : ''}`} onClick={() => setSelected('yellow')}></div>
            <div className={`${styles.colorContainer} ${styles.green} ${selected === 'green' ? styles.selected : ''}`} onClick={() => setSelected('green')}></div>
            <div className={`${styles.colorContainer} ${styles.lightBlue} ${selected === 'lightBlue' ? styles.selected : ''}`} onClick={() => setSelected('lightBlue')}></div>
            <div className={`${styles.colorContainer} ${styles.blue} ${selected === 'blue' ? styles.selected : ''}`} onClick={() => setSelected('blue')}></div>
            <div className={`${styles.colorContainer} ${styles.purple} ${selected === 'purple' ? styles.selected : ''}`} onClick={() => setSelected('purple')}></div>
        </div>
    );
};

export default ColorInput;
