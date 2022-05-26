import { useParams } from "react-router-dom";
import CompleteTask from "../home/CompleteTask";
import { useState } from "react";
import {Slider} from '@mui/material';

const ListDetails = () => {
    const {id} = useParams();

    const [percentage, setPercentage] = useState(0);

    return (
        <div className="list-details">
            <h1>{id}</h1>
            <CompleteTask percentage={percentage}/>
            <div style={{height: "2.5em", width: "10em", background: "black"}}></div>
            <Slider onChange={(event) => setPercentage(event.target.value)}></Slider>
        </div>
    );
}
 
export default ListDetails;