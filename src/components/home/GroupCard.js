import VisualStreak from "./VisualStreak";

const GroupCard = ({group}) => {
    const groupTemp = {
        name: 'Workout',
        id: 0,
        recentValues: '101010',
        type: 'group',
        repeatRate: '1/day',
        currentValue: '1',
        streak: 0,
        children: [
            {
                name: 'Push Ups',
                id: 0,
                streak: 0,
                repeatRate: '2/day',
                type: 'number',
                prevValue: '20',
                goal: '50',
                currentValue: '1',
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
        ]
    }

    const renderInput = () => {
        return (<div className="card-group-name"></div>);
    }

    return (
        <div className="group-card">
            {groupTemp.type === 'group' && <div className="card-title">{groupTemp.name}</div>}
            {groupTemp.recentValues !== 'no' && groupTemp.recentValues.length === 6 && <VisualStreak streak={groupTemp.recentValues.concat(`${groupTemp.currentValue ? '1' : '0'}`)}/>}
        </div>
    );
}
 
export default GroupCard;