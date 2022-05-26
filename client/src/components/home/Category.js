import { Paper } from "@mui/material";
import VisualStreak from "./VisualStreak";

const Category = () => {
    return (
        <Paper className="task-container" sx={{
            borderRadius: '1em',
            marginBottom: '1em',
            width: "100%",
            height: "7em",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "0.5em",
            rowGap: "0.65em"
        }}>
            <div className="category-title-container" style={{width: "100%"}}>
                <div className="category-title" style={{width: "6.45em", height: "1.5em", background: "red", borderRadius: "1.5em", textAlign: "center"}}>Workout</div>
            </div>
            <div className="task-details-container" style={{width: "100%"}}>
                <div className="task-title" style={{fontSize: "1.5em", marginLeft: "1em"}}>Push-Ups:</div>
                <VisualStreak streak={"000111"}></VisualStreak>
            </div>
        </Paper>
    );
}
 
export default Category;