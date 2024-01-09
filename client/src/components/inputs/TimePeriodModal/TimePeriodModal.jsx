import React, {useState} from 'react';
import {DayPicker} from "react-day-picker";
import styles from "react-day-picker/dist/style.module.css";
import customStyles from './TimePeriodModal.module.scss';
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

const TimePeriodModal = ({timePeriod, timePeriod2, setTimePeriod2, dismountFunction}) => {
    const [tempTimePeriod2, setTempTimePeriod2] = useState(timePeriod2);
    
    const formatCaption = (month) => {
        return (<div>{month.toLocaleDateString('default', {month: 'long'})}</div>)
    }

    const classNames = {
        ...styles,
        root: customStyles.calendarRoot,
        day_selected: customStyles.calendarSelected,
        day: customStyles.calendarDay
    }

    const handleSave = () => {
        setTimePeriod2(tempTimePeriod2);
        dismountFunction();
    }

    return (
        <Modal isOverlay={true} dismountFunction={dismountFunction}>
            <div className={"Stack-Container"}>
                <div className={"Display"}>Pick at least one date</div>
            </div>
            <div className={"Horizontal-Flex-Container Align-Center"}>
                {timePeriod === 'Weeks' &&
                    <WeekDayInput selected={tempTimePeriod2} setSelected={setTempTimePeriod2}></WeekDayInput>
                }
                {timePeriod === 'Months' &&
                    <DayPicker
                        mode="multiple"
                        styles={{caption: {display: 'none'}}}
                        selected={tempTimePeriod2}
                        onSelect={setTempTimePeriod2}
                        defaultMonth={new Date(2022, 4)}
                        classNames={classNames}
                    />
                }
                {timePeriod === 'Years' &&
                    <DayPicker
                        mode="multiple"
                        styles={{caption_label: {zIndex: 'auto'}}}
                        selected={tempTimePeriod2}
                        onSelect={setTempTimePeriod2}
                        fromDate={new Date(2022, 0)}
                        toDate={new Date(2022, 11, 31)}
                        formatters={{ formatCaption }}
                        defaultMonth={new Date(2022, 0)}
                        classNames={classNames}
                    />
                }
            </div>
            <div className={"Horizontal-Flex-Container Space-Between"}>
                <Button size={"large"} filled={false} onClick={dismountFunction}>Cancel</Button>
                <Button size={"large"} disabled={tempTimePeriod2.length === 0} onClick={handleSave}>Save</Button>
            </div>
        </Modal>
    );
};

export default TimePeriodModal;
