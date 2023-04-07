import React from 'react';
import styles from './TimeInput.module.scss';

const TimeInput = ({hour, setHour, minute, setMinute, isDisabled}) => {

    const handleHourChange = (e) => {
        const input = e.target.value;

        if (input.match(/^([0-9]|[01][0-9]?|2[0-3]?)?$/)) {
            setHour(input);
        }
    }

    const handleMinuteChange = (e) => {
        const input = e.target.value;

        if (input.match(/^([0-9]|[0-5][0-9]?)?$/)) {
            setMinute(input);
        }
    }

    const handleHourBlur = () => {
        if (hour.length === 0) {
            setHour('00');
            return;
        }

        if (hour.length === 1) {
            setHour('0'.concat(hour));
        }
    }

    const handleMinuteBlur = () => {
        if (minute.length === 0) {
            setMinute('00');
            return;
        }

        if (minute.length === 1) {
            setMinute('0'.concat(minute));
        }
    }

    const handleHourFocus = () => {
        if (hour !== '00' && hour[0] === '0') {
            setHour(hour.substring(1));
        }
    }

    const handleMinuteFocus = () => {
        if (minute !== '00' && minute[0] === '0') {
            setMinute(minute.substring(1));
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') e.target.blur();
    }

    return (
        <div className={`Stack-Container Centered Rounded-Container ${styles.container} ${isDisabled ? styles.disabled : ''}`}>
            <div className={`${styles.currentContainer}`}>
                <input
                    className={styles.currentNumber}
                    value={hour}
                    onChange={handleHourChange}
                    onBlur={handleHourBlur}
                    onFocus={handleHourFocus}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                />
                :
                <input
                    className={styles.currentNumber}
                    value={minute}
                    onChange={handleMinuteChange}
                    onBlur={handleMinuteBlur}
                    onFocus={handleMinuteFocus}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                />
            </div>
        </div>
    );
};

export default TimeInput;
