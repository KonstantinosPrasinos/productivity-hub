import styles from './WeekDayInput.module.scss'

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
        <div className={`Horizontal-Flex-Container`}>
            {days.map(day => (<button
                key={day}
                className={`${styles.button} ${selected?.includes(day) ? styles.selected : ''}`}
                onClick={() => toggleSelected(day)}
            >{day.slice(0, 1)}</button>))}
        </div>
    );
};

export default WeekDayInput;
