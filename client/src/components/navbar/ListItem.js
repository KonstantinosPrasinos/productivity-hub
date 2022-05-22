import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@emotion/react';


const ListItem = ({group, index, isFinal, selectedGroup, setSelectedGroup}) => {
    const groupRef = useRef();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme()
    
    return (
        <div onClick={() => {
            navigate(`/groups/${group.name.replace(/ /g, "_")}`)
            if (groupRef !== selectedGroup){
                setSelectedGroup(groupRef);
            }
        }}>
            <div className='group' ref={groupRef} id={`group-${index}`}>
                {index === 0 && <p className='group-line group-line-double-top' style={{backgroundColor: theme.palette.text.primary}} ></p>}
                <p className='group-line group-line-top' style={{backgroundColor: theme.palette.text.primary}} ></p>
                <div className='group-middle'>
                    <p className='group-circle' style={{backgroundColor: theme.palette.text.primary}} ></p>
                    <span className={`group-title selection ${(selectedGroup && selectedGroup === groupRef) || (location.pathname === `/groups/${group.name.replace(/ /g, "_")}`) ? 'selected' : ''}`}>{group.name}</span>
                </div>
                {isFinal && <p className='group-line group-line-bottom' style={{backgroundColor: theme.palette.text.primary}} ></p>}
            </div>
        </div>
    );
}
 
export default ListItem;