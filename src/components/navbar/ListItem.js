import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


const ListItem = ({list, index, isFinal, selectedGroup, setSelectedGroup}) => {
    const listRef = useRef();
    const location = useLocation();
    const navigate = useNavigate();
    
    return (
        <div onClick={() => {
            navigate(`/groups/${list.replace(/ /g, "_")}`)
            if (listRef !== selectedGroup){
                setSelectedGroup(listRef);
            }
        }}>
            <div className='list' ref={listRef} id={`list-${index}`}>
                {index === 0 && <p className='list-line temp'></p>}
                <p className='list-line list-line-top'></p>
                <div className='list-middle'>
                    <p className='list-circle'></p>
                    <span className={`list-title selection ${(selectedGroup && selectedGroup === listRef) || (location.pathname === `/groups/${list.replace(/ /g, "_")}`) ? 'selected' : ''}`}>{list}</span>
                </div>
                {isFinal && <p className='list-line list-line-bottom'></p>}
            </div>
        </div>
    );
}
 
export default ListItem;