// import VisualStreak from "./VisualStreak";
import { TextField } from '@mui/material';

const HabitBox = ({habit}) => {
    return (
        <div className="habit-box">
            asd
            {/* <div className="habit-input-container">
                <div className="habit-text">{`${habit.name}:`}</div>
                {habit.type === 'toggle' ? <input type="checkbox" /> : <TextField className="outlined-basic" variant="outlined" label={habit.name} size="small" sx={{width: '50%'}} />}
            </div>
            <div className="habit-goal-container">
                <div className="habit-text">{habit.goalType === 'streak' ? 'Steak:' : 'Goal:'}</div>
                <div className="habit-goal-content">
                    {habit.goalType === 'streak' && <span className="habit-streak">{habit.streak}</span>}
                    {habit.goalType === 'number' && <span className={`habit-number ${habit.average > habit.currentValue ? 'habit-number-falling' : (habit.average !== habit.currentValue ? 'habit-number-growing' : '')}`}>{habit.currentValue ? habit.currentValue : ''}</span>}
                    <span className="habit-goal"> / {habit.goal}</span>
                </div>
            </div> */}
            {/* {habit.recentValues !== 'no' && habit.visualizeStreak && habit.recentValues.length === 6 && <VisualStreak streak={habit.recentValues.concat(`${habit.currentValue ? '1' : '0'}`)}/>} */}
        </div>
    );
}
 
export default HabitBox;