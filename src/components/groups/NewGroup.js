
import { useRef, createRef, useState } from 'react';

import { Select, Paper, TextField, Button, MenuItem, FormControl, InputLabel} from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Grow'

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

import { useTheme } from '@emotion/react';

import { gsap } from 'gsap';

const NewGroup = () => {

    const paperRef = useRef();
    const theme = useTheme();

    const [tasks, setTasks] = useState([]);

    const addNewTask = () => {
        setTasks((prev) => [{title: null, order: prev.length, ref: createRef}, ...prev])
    }

    const handleMouseDown = (ref, index) => {
        let tween = gsap.to(ref.current, {opacity: 0.6, duration: 0.1});
        const handleMouseMove = (event) => {
            if (event.pageY > ref.current.getBoundingClientRect().y + ref.current.getBoundingClientRect().height) {
                //Move task down the list
                if (tasks[index].order < tasks.length - 1){
                    const temp = parseInt(ref.current.style.order);
                    const previous = tasks.find((task) => task.order === tasks[index].order + 1);
                    previous.order = temp;
                    previous.ref.current.style.order = temp;

                    tasks[index].order++;
                    ref.current.style.order = tasks[index].order;
                }
            } else if (event.pageY < ref.current.getBoundingClientRect().y) {
                //Move task up the list
                if (tasks[index].order > 0){
                    const temp = parseInt(ref.current.style.order);
                    const previous = tasks.find((task) => task.order === tasks[index].order - 1);
                    previous.order = temp;
                    previous.ref.current.style.order = temp;

                    tasks[index].order--;
                    ref.current.style.order = tasks[index].order;
                }
            }
        }

        const cleanUp = (downEventListener, moveEventListener) => {
            window.removeEventListener('mouseup', cleanUp);
            paperRef.current.removeEventListener('mousemove', handleMouseMove);
            tween.reverse();
        }

        window.addEventListener('mouseup', cleanUp);
        paperRef.current.addEventListener('mousemove', handleMouseMove);
    }

    return (
        <Paper className="new-group" ref={paperRef} sx={{
            position: 'relative',
            height: '100%',
            padding: '3em'
        }}>
            <TextField label='Title' variant='standard'></TextField>

            <Button variant="outlined" onClick={addNewTask}>Add new task</Button>
            <div className="new-tasks-container">
                <TransitionGroup>
                {tasks.map((task, index) => (
                    <Collapse key={index} orientation="vertical" timeout={500}>
                        <div className="new-task" ref={task.ref} key={index} style={{ order: task.order }} >
                            <DragIndicatorIcon onMouseDown={() => { handleMouseDown(task.ref, index) }} sx={{
                                color: theme.palette.background.paper,
                                backgroundColor: theme.palette.primary.main,
                                borderRadius: '50%',
                                border: `3px solid ${theme.palette.primary.main}`,
                                marginTop: '0.5em',
                                marginRight: '0.5em',
                                ':hover': {
                                    opacity: 0.6,

                                }
                            }} />
                            
                            <TextField size="small" label="Title" variant='standard' sx={{width: '10em', marginRight: '1.5em'}}></TextField>
                            <FormControl>
                                <InputLabel id={`type-select-${index}`}>Type</InputLabel>
                                <Select sx={{width: '10em'}} label="Type" labelId={`type-select-${index}`} variant="standard" size="small">
                                    <MenuItem value={'temp'}>Temp</MenuItem>
                                </Select>
                            </FormControl>
                            
                        </div>
                    </Collapse>

                ))}
                </TransitionGroup>
                
            </div>

            {/* <button onClick={() => dispatch(addGroup('test'))}>Add Group</button>
            <button onClick={() => dispatch(removeGroup(0))}>Remove Group</button> */}
        </Paper>
    );
}
 
export default NewGroup;