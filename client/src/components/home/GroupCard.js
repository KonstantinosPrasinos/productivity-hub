import HabitBox from "./HabitBox";

import { Paper } from '@mui/material';

const GroupCard = ({group}) => {
    const groupTemp = {
        name: 'Workout',
        id: 0,
        recentValues: '101010',
        type: 'group',
        repeatRate: '1/day',
        currentValue: '1',
        streak: 0,
        goalType: 'streak',
        visualizeStreak: true,
        children: [
            {
                name: 'Push Ups',
                id: 0,
                streak: 0,
                repeatRate: '2/day',
                recentValues: '111000',
                visualizeStreak: true,
                type: 'number',
                prevValue: '20',
                goalType: 'number',
                goal: '50',
                currentValue: '1',
                average: '15',
                values: [
                    {
                        date: '29/3/22',
                        value: '20'
                    },
                    {
                        date: '28/3/22',
                        value: '35'
                    }
                ]
            }
            // ,
            // {
            //     name: 'Crunches',
            //     id: 1,
            //     streak: 0,
            //     repeatRate: '2/day',
            //     recentValues: '001100',
            //     visualizeStreak: false,
            //     type: 'number',
            //     prevValue: '20',
            //     goalType: 'number',
            //     goal: '100',
            //     currentValue: '1',
            //     average: '15',
            //     values: [
            //         {
            //             date: '29/3/22',
            //             value: '20'
            //         },
            //         {
            //             date: '28/3/22',
            //             value: '35'
            //         }
            //     ]
            // }
        ]
    }


    return (
        <Paper className="group-card" sx={{
            width: '100%',
            borderRadius: '10px',
            marginBottom: '20px',
            padding: '70px 40px 10px 40px',
            boxSizing: 'border-box'
        }}>
            {groupTemp.type === 'group' && <h2 className="card-title">{groupTemp.name}</h2>}
            {groupTemp.children.map(habit => {
                return <HabitBox habit={habit} key={habit.id}></HabitBox>
            })}

            {/* This is for the individual goal */}
            {/* {groupTemp.recentValues !== 'no' && groupTemp.visualizeStreak && groupTemp.recentValues.length === 6 && <VisualStreak streak={groupTemp.recentValues.concat(`${groupTemp.currentValue ? '1' : '0'}`)}/>} */}
        </Paper>
    );
}
 
export default GroupCard;