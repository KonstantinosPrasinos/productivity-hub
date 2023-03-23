import React from 'react';
import WeekDayInput from "../WeekDayInput/WeekDayInput";
import {DayPicker} from "react-day-picker";
import styles from "react-day-picker/dist/style.module.css";
import customStyles from './TimePeriodInput.module.scss';

const TimePeriodInput = ({timePeriod, timePeriod2, setTimePeriod2}) => {

    const formatCaption = (month) => {
        return (<div>{month.toLocaleDateString('default', {month: 'long'})}</div>)
    }

    const classNames = {
        ...styles,
        root: customStyles.calendarRoot,
        day_selected: customStyles.calendarSelected,
        day: customStyles.calendarDay
    }

    const renderPicker = () => {
        switch (timePeriod) {
            case 'Days':
                return;
            case 'Weeks':
                return (<WeekDayInput selected={timePeriod2} setSelected={setTimePeriod2}></WeekDayInput>)
            case 'Months':
                return (<DayPicker
                    mode="multiple"
                    styles={{caption: {display: 'none'}}}
                    selected={timePeriod2}
                    onSelect={setTimePeriod2}
                    defaultMonth={new Date(2022, 4)}
                    classNames={classNames}
                />)
            case 'Years':
                return (<DayPicker
                    mode="multiple"
                    styles={{caption_label: {zIndex: 'auto'}}}
                    selected={timePeriod2}
                    onSelect={setTimePeriod2}
                    fromDate={new Date(2022, 0)}
                    toDate={new Date(2022, 11, 31)}
                    formatters={{ formatCaption }}
                    defaultMonth={new Date(2022, 0)}
                    classNames={classNames}
                />)
        }
    }

    return (
        <>
            {renderPicker()}
        </>
    );
};

export default TimePeriodInput;
