import { useRef } from 'react';
import { Link } from 'react-router-dom';

const ListItem = ({list, index, isFinal, selectedList, setSelectedList}) => {
    const listRef = useRef();
    const topRef = useRef();
    const bottomRef = useRef();

    const changeStyleOfIndents = (action) => {
        if (!selectedList) return;
        if (selectedList.list === listRef) return;
        const selectedIndex = parseInt(selectedList.list.current.id.slice(selectedList.list.current.id.indexOf('-') + 1, selectedList.list.current.id.length));
        if (selectedIndex === index + 1){
            selectedList.top.current.classList[action]('accent-color-2-background');
        } else if (selectedIndex === index - 1) {
            selectedList.bottom.current.classList[action]('accent-color-2-background');
        }
    }

    return (
        <Link to={`/lists/${list}`} onClick={() => {
            if (listRef !== selectedList){
                const tempObj = {
                    top: topRef,
                    bottom: bottomRef,
                    list: listRef
                }
                setSelectedList(tempObj)
                changeStyleOfIndents('remove');
            }
        }}>
            <div className='list' ref={listRef} id={`list-${index}`}>
                <p className='list-line list-line-top'></p>
                <div className={`semi-circle top-semi-circle ${!selectedList || (selectedList && selectedList.list !== listRef) ? 'invisible' : ''}`}>
                    <p className='indent top-indent' id={`top-indent-${index}`} ref={topRef}></p>
                </div>
                <div className='list-middle'>
                    <p className='list-circle'></p>
                    <span className={`list-title ${selectedList && selectedList.list === listRef ? 'list-selected' : ''}`} onMouseEnter={() => changeStyleOfIndents('add')} onMouseLeave={() => changeStyleOfIndents('remove')}>{list}</span>
                </div>
                {isFinal && <p className='list-line list-line-bottom'></p>}
                <div className={`semi-circle bottom-semi-circle ${!selectedList || (selectedList && selectedList.list !== listRef) ? 'invisible' : ''}`}>
                    <p className='indent bottom-indent' id={`bottom-indent-${index}`} ref={bottomRef}></p>
                </div>
            </div>
        </Link>
    );
}
 
export default ListItem;