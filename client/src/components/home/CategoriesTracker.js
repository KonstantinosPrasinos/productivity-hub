import { Paper } from '@mui/material';

const CategoriesTracker = () => {
    const temp = [
        {name: 'Workout', percentage: 50, color: 'red'},
        {name: 'French', percentage: 25, color: 'blue'},
        {name: 'Japanese', percentage: 34, color: 'green'}
    ]
    return (
        <Paper className="categories-tracker">
            {temp.map((element, index) => {
                return <div key={index} style={{borderRadius: index === 0 ? '0.75em 0.75em 0.75em 0' : (index === temp.length - 1 ? '0 0.75em 0.75em 0.75em' : '0 0.75em 0.75em 0'), backgroundColor: element.color, width: `${element.percentage}%`}} className="category-tracker"></div>
            })}
        </Paper>
    );
}
 
export default CategoriesTracker;