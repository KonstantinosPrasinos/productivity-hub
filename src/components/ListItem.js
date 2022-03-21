import {useRef } from 'react';
import { Link } from 'react-router-dom';

const ListItem = ({list, index, isFinal, selectedItem, setSelectedItem}) => {
    const listRef = useRef();

    return (
        <Link to={`/lists/${list}`} onClick={() => {
            if (listRef !== selectedItem){
                setSelectedItem(listRef)
            }
        }}>
            <div className='list' ref={listRef} id={`list-${index}`}>
                {index === 0 && <p className='list-line temp'></p>}
                <p className='list-line list-line-top'></p>
                <div className='list-middle'>
                    <p className='list-circle'></p>
                    <span className={`list-title selection ${selectedItem && selectedItem === listRef ? 'selected' : ''}`}>{list}</span>
                </div>
                {isFinal && <p className='list-line list-line-bottom'></p>}
            </div>
        </Link>
    );
}
 
export default ListItem;