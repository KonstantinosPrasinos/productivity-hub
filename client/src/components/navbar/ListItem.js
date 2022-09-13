import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


const ListItem = ({group, index, isFinal, selectedGroup, setSelectedGroup}) => {
    const groupRef = useRef();
    const location = useLocation();
    const navigate = useNavigate();
    
    return (
        <div onClick={() => {
            navigate(`/groups/${group.name.replace(/ /g, "_")}`)
            if (groupRef !== selectedGroup){
                setSelectedGroup(groupRef);
            }
        }}>
            <div className='group' ref={groupRef} id={`group-${index}`}>
                {index === 0 && <p className='group-line group-line-double-top'></p>}
                <p className='group-line group-line-top'></p>
                <div className='group-middle'>
                    <p className='group-circle' ></p>
                    <span className={`group-title selection ${(selectedGroup && selectedGroup === groupRef) || (location.pathname === `/groups/${group.name.replace(/ /g, "_")}`) ? 'selected' : ''}`}>{group.name}</span>
                </div>
                {isFinal && <p className='group-line group-line-bottom'></p>}
            </div>
        </div>
    );
}
 
export default ListItem;