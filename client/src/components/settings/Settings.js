import {useDispatch, useSelector} from 'react-redux';

import { addGroup, removeGroup } from '../../app/contentSlice';

import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { setIsDarkMode } from '../../app/uiSlice';

const Settings = () => {
    const dispatch = useDispatch();

    const theme = useSelector((state) => state.ui.isDarkMode)

    return (
        <div className="new-group">
            <button onClick={() => dispatch(addGroup('test'))}>Add Group</button>
            <button onClick={() => dispatch(removeGroup(0))}>Remove Group</button>
            <button onClick={() => {
                dispatch(setIsDarkMode(!theme));
                console.log(theme);
            }}>Change Theme</button>
            <FormControl fullWidth>
                <InputLabel id="task-type-select-label">Type</InputLabel>
                <Select
                    id="task-type-select"
                    label="Type"
                    labelId="task-type-select-label"
                    variant="outlined"
                >
                    <MenuItem value={'CheckBox'}>Checkbox</MenuItem>
                    <MenuItem value={'Number-Text'}>Number-Text</MenuItem>
                </Select>
            </FormControl>
        </div>
    );
}
 
export default Settings;