import {useDispatch } from 'react-redux';

import { addGroup, removeGroup } from '../../app/contentSlice';

const NewGroup = () => {
    const dispatch = useDispatch();

    return (
        <div className="new-group">
            <button onClick={() => dispatch(addGroup('test'))}>Add Group</button>
            <button onClick={() => dispatch(removeGroup(0))}>Remove Group</button>
        </div>
    );
}
 
export default NewGroup;