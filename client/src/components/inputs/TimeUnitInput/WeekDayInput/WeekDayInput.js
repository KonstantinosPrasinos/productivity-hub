import React from 'react';
import Chip from "../../../buttons/Chip/Chip";

const WeekDayInput = ({selected, setSelected}) => {

    const toggleSelected = (day) => {
        if (selected.find(selectedDay => day === selectedDay)) {
            setSelected(selected.filter(selectedDay => selectedDay !== day));
        } else {
            setSelected([...selected, day]);
        }
    }

    return (
        <div className={`Horizontal-Flex-Container`}>
            <Chip selected={selected.find(value => value === 'Monday') ? 'Monday' : ''} setSelected={toggleSelected} value={'Monday'}>M</Chip>
            <Chip selected={selected.find(value => value === 'Tuesday') ? 'Tuesday' : ''} setSelected={toggleSelected} value={'Tuesday'}>T</Chip>
            <Chip selected={selected.find(value => value === 'Wednesday') ? 'Wednesday' : ''} setSelected={toggleSelected} value={'Wednesday'}>W</Chip>
            <Chip selected={selected.find(value => value === 'Thursday') ? 'Thursday' : ''} setSelected={toggleSelected} value={'Thursday'}>T</Chip>
            <Chip selected={selected.find(value => value === 'Friday') ? 'Friday' : ''} setSelected={toggleSelected} value={'Friday'}>F</Chip>
            <Chip selected={selected.find(value => value === 'Saturday') ? 'Saturday' : ''} setSelected={toggleSelected} value={'Saturday'}>S</Chip>
            <Chip selected={selected.find(value => value === 'Sunday') ? 'Sunday' : ''} setSelected={toggleSelected} value={'Sunday'}>S</Chip>
        </div>
    );
};

export default WeekDayInput;
