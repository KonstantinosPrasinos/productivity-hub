import { useNavigate } from "react-router-dom";

const GroupList = () => {
    const navigate = useNavigate()
    return ( 
        <div className="group-list">
            <button onClick={() => navigate('/groups/new')}>Add Group</button>
        </div>
     );
}
 
export default GroupList;