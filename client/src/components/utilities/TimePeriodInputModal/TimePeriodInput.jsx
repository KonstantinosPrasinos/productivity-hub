import React from 'react';
import {DayPicker} from "react-day-picker";
import styles from "react-day-picker/dist/style.module.css";
import customStyles from './TimePeriodInput.module.scss';
import Modal from "@/components/containers/Modal/Modal";
import Button from "@/components/buttons/Button/Button";

const WeekDayInput = ({selected, setSelected}) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const toggleSelected = (day) => {
        if (Array.isArray(selected)) {
            if (selected?.find(selectedDay => day === selectedDay)) {
                setSelected(selected.filter(selectedDay => selectedDay !== day));
            } else {
                setSelected([...selected, day]);
            }
        } else {
            setSelected([day]);
        }

    }

    return (
        <div className={`Horizontal-Flex-Container Align-Center`}>
            {days.map(day => (<button
                key={day}
                className={`${customStyles.button} ${selected?.includes(day) ? customStyles.selected : ''}`}
                onClick={() => toggleSelected(day)}
            >{day.slice(0, 1)}</button>))}
        </div>
    );
};

const TimePeriodInput = ({timePeriod, timePeriod2, setTimePeriod2, toggleModal}) => {

    const formatCaption = (month) => {
        return (<div>{month.toLocaleDateString('default', {month: 'long'})}</div>)
    }

    const classNames = {
        ...styles,
        root: customStyles.calendarRoot,
        day_selected: customStyles.calendarSelected,
        day: customStyles.calendarDay
    }

    return (
        <Modal isOverlay={true} dismountFunction={toggleModal}>
            <div className={"Stack-Container"}>
                <div className={"Display"}>Pick at least one date</div>
            </div>
            <div>
                {timePeriod === 'Weeks' &&
                    <WeekDayInput selected={timePeriod2} setSelected={setTimePeriod2}></WeekDayInput>
                }
                {timePeriod === 'Months' &&
                    <DayPicker
                        mode="multiple"
                        styles={{caption: {display: 'none'}}}
                        selected={timePeriod2}
                        onSelect={setTimePeriod2}
                        defaultMonth={new Date(2022, 4)}
                        classNames={classNames}
                    />
                }
                {timePeriod === 'Years' &&
                    <DayPicker
                        mode="multiple"
                        styles={{caption_label: {zIndex: 'auto'}}}
                        selected={timePeriod2}
                        onSelect={setTimePeriod2}
                        fromDate={new Date(2022, 0)}
                        toDate={new Date(2022, 11, 31)}
                        formatters={{ formatCaption }}
                        defaultMonth={new Date(2022, 0)}
                        classNames={classNames}
                    />
                }
            </div>
            <div className={"Horizontal-Flex-Container Space-Between"}>
                <Button size={"large"} filled={false}>Cancel</Button>
                <Button size={"large"}>Save</Button>
            </div>
        </Modal>
    );
};

export default TimePeriodInput;
