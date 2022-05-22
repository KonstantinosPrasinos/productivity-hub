import { useNavigate } from "react-router-dom";
import NewTask from "../popups/NewTask";

const GroupList = () => {
    const navigate = useNavigate()
    return ( 
        <div className="group-list">
            <button onClick={() => navigate('/groups/new')}>Add Group</button>
            <NewTask></NewTask>
        </div>
     );
}
 
export default GroupList;