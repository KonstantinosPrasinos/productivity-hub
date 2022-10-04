import React from 'react';

import styles from './ColorInput.module.scss';

const ColorInput = ({selected, setSelected}) => {
    return (
        <div className={styles.container}>
            <div className={`${styles.colorContainer} Red ${selected === 'Red' ? styles.selected : ''}`} onClick={() => setSelected('Red')}></div>
            <div className={`${styles.colorContainer} Orange ${selected === 'Orange' ? styles.selected : ''}`} onClick={() => setSelected('Orange')}></div>
            <div className={`${styles.colorContainer} Yellow ${selected === 'Yellow' ? styles.selected : ''}`} onClick={() => setSelected('Yellow')}></div>
            <div className={`${styles.colorContainer} Green ${selected === 'Green' ? styles.selected : ''}`} onClick={() => setSelected('Green')}></div>
            <div className={`${styles.colorContainer} LightBlue ${selected === 'LightBlue' ? styles.selected : ''}`} onClick={() => setSelected('LightBlue')}></div>
            <div className={`${styles.colorContainer} Blue ${selected === 'Blue' ? styles.selected : ''}`} onClick={() => setSelected('Blue')}></div>
            <div className={`${styles.colorContainer} Purple ${selected === 'Purple' ? styles.selected : ''}`} onClick={() => setSelected('Purple')}></div>
        </div>
    );
};

export default ColorInput;
