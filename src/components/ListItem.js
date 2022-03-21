import {useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ListItem = ({list, index, isFinal, selectedItem, setSelectedItem}) => {
    const listRef = useRef();
    const location = useLocation();

    useEffect(() => {
        console.log(location.pathname, `/${list.replace(/ /g, "_")}`)
    })

    return (
        <Link to={`/lists/${list.replace(/ /g, "_")}`} onClick={() => {
            if (listRef !== selectedItem){
                setSelectedItem(listRef)
            }
        }}>
            <div className='list' ref={listRef} id={`list-${index}`}>
                {index === 0 && <p className='list-line temp'></p>}
                <p className='list-line list-line-top'></p>
                <div className='list-middle'>
                    <p className='list-circle'></p>
                    <span className={`list-title selection ${(selectedItem && selectedItem === listRef) || (location.pathname === `/lists/${list.replace(/ /g, "_")}`) ? 'selected' : ''}`}>{list}</span>
                </div>
                {isFinal && <p className='list-line list-line-bottom'></p>}
            </div>
        </Link>
    );
}
 
export default ListItem;