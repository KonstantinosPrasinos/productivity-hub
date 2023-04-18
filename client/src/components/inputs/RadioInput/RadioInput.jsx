import React from 'react';
import styles from "./RadioInput.module.scss";

const RadioInput = ({value, checked = false}) => {
    return (
        <label className={styles.container}>
            {value}
            <input type={"radio"} value={value} checked={checked} onChange={() => {}} className={styles.input} />
            <div className={styles.radio}></div>
        </label>
    );
};

export default RadioInput;
