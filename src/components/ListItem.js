import { Link } from 'react-router-dom';

const ListItem = ({list, index, isFinal, selectedList, setSelectedList}) => {

    return (
        <Link to={`/lists/${list}`} key={index} onClick={() => {
            if (index !== selectedList) setSelectedList(index);
        }}>
            <div className={'list'}>
                <p className='list-line list-line-top'></p>
                {selectedList === index && 
                <div className='semi-circle top-semi-circle'>
                    <p className='indent top-indent'></p>
                </div>}
                <div className='list-middle'>
                    <p className='list-circle'></p>
                    <span className={`list-title ${selectedList === index ? 'list-selected' : ''}`}>{list}</span>
                </div>
                {isFinal && <p className='list-line list-line-bottom'></p>}
                {selectedList === index && 
                <div className='semi-circle bottom-semi-circle'>
                    <p className='indent bottom-indent'></p>
                </div>}
            </div>
        </Link>
    );
}
 
export default ListItem;