const VisualStreak = ({streak}) => {
    const chars = streak.split('');
    let date = new Date();
    date.setDate(date.getDate() - 7);
    
    console.log(date.toLocaleDateString());

    const renderDate = () => {
        date.setDate(date.getDate() + 1);
        const options = {day: 'numeric', month: 'numeric'}
        return <div className="streak-value-date">{date.toLocaleDateString(undefined, options)}</div>
    }

    return (
        <div className="visual-streak">
            {chars.map((char, index) => {
                console.log(char);
                return (
                    <div className="streak-value" key={index}>
                        {index > 0 && char === '1' && chars[index - 1] === '1' && <div className="streak-value-bar streak-value-left-bar"></div>}
                        <div className={`streak-value-circle ${char === '1' ? 'streak-value-completed' : ''}`}></div>
                        {index < 7 && char === '1' && chars[index + 1] === '1' && <div className="streak-value-bar streak-value-left-bar"></div>}
                        {renderDate()}
                    </div>
                )
            })}
        </div>
    );
}
 
export default VisualStreak;