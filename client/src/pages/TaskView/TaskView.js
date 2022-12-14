import React, {useContext, useState} from 'react';
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import CategoryIndicator from "../../components/indicators/CategoryIndicator/CategoryIndicator";
import Divider from "../../components/utilities/Divider/Divider";
import EditIcon from '@mui/icons-material/Edit';
import IconButton from "../../components/buttons/IconButton/IconButton";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Button from "../../components/buttons/Button/Button";
import Chip from "../../components/buttons/Chip/Chip";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './Taskview.module.scss';
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import CheckIcon from "@mui/icons-material/Check";
import {useDeleteTask} from "../../hooks/change-hooks/useDeleteTask";
import {useChangeEntry} from "../../hooks/change-hooks/useChangeEntry";
import {useGetTaskCurrentEntry} from "../../hooks/get-hooks/useGetTaskCurrentEntry";

const TaskView = ({index, length, task}) => {
    const miniPagesContext = useContext(MiniPagesContext);
    const {mutate: deleteTask} = useDeleteTask();
    const {mutate: setTaskCurrentEntry} = useChangeEntry(task.title);
    const {data: entry} = useGetTaskCurrentEntry(task._id, task.currentEntryId);

    const [selectedGraph, setSelectedGraph] = useState('Average');
    const graphOptions = ['Average', 'Total'];

    const [date, setDate] = useState(new Date);

    const addToMonth = (adder) => {
        const newDate = new Date(date.getTime());
        newDate.setMonth(newDate.getMonth() + adder);

        setDate(newDate);
    }

    const handleDelete = () => {
        miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''});
        deleteTask(task._id);
    }

    const handleSetCurrentValueCheckbox = () => {
        setTaskCurrentEntry(task._id, entry?._id, entry?.value === 0 ? 1 : 0);
    }

    const handleSetCurrentValueNumber = () => {
    }

    return (
        <MiniPageContainer
            index={index}
            length={length}
        >
            <section className={`Horizontal-Flex-Container Space-Between`}>
                <div className={'Title'}>{task.title}</div>
                <div>
                    <IconButton onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'new-task', id: task._id}})}><EditIcon /></IconButton>
                    <IconButton onClick={handleDelete}><DeleteIcon /></IconButton>
                </div>
            </section>
            <section className={'Horizontal-Flex-Container'}>
                <div className={'Label'}>Category:</div>
                {task.category ?
                    <CategoryIndicator
                        categoryId={task.category}
                        groupId={task.group}
                    /> :
                    <div>None</div>
                }
            </section>
            <section className={'Horizontal-Flex-Container'}>
                <div className={'Label'}>Today's Entry:</div>
                {task.type === 'Checkbox' ?
                    <div className={`${styles.checkbox} ${entry?.value === 1 ? styles.checked : ''}`} onClick={handleSetCurrentValueCheckbox}>
                        <CheckIcon sx={{
                            width: '100%',
                            height: '100%',
                            opacity: entry?.value ?? 0 === 1 ? 1 : 0,
                            "&:hover": {
                                opacity: 1,
                            }
                        }} />
                    </div> :
                    <div className={'Horizontal-Flex-Container'}>
                        <Button onClick={() => handleSetCurrentValueNumber(entry?.value ?? 0 - task.step)}>-{task.step}</Button>
                        <TextBoxInput value={entry?.value ?? 0} setValue={handleSetCurrentValueNumber}></TextBoxInput>
                        <Button onClick={() => handleSetCurrentValueNumber(entry?.value ?? 0 + task.step)}>+{task.step}</Button>
                    </div>}
            </section>
            <Divider />
            <section className={'Grid-Container Two-By-Two'}>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>Current Streak</div>
                    <div>2 days</div>
                    <div className={'Label'}>Since: 05/10/2022</div>
                </div>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>Best Streak</div>
                    <div>2 days</div>
                    <div className={'Label'}>Ended at: 05/10/2022</div>
                </div>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>Total</div>
                    <div>2 days</div>
                    <div className={'Label'}>Since: 05/10/2022</div>
                </div>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>Unfilled Days</div>
                    <div>2 days</div>
                    <div className={'Label'}>Ended at: 05/10/2022</div>
                </div>
            </section>
            <Divider />
            <section className={'Stack-Container'}>
                <div className={'Horizontal-Flex-Container'}>
                    {graphOptions.map((option, index) => (
                        <Chip
                            selected={selectedGraph}
                            setSelected={setSelectedGraph}
                            value={option}
                            key={index}
                        >
                            {option}
                        </Chip>
                    ))}
                </div>
                <div className={'Horizontal-Flex-Container Space-Between'}>
                    <IconButton onClick={() => addToMonth(-1)}>
                        <ArrowBackIosIcon />
                    </IconButton>
                    <div>
                        {`${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`}
                    </div>
                    <IconButton onClick={() => addToMonth(1)}>
                        <ArrowForwardIosIcon />
                    </IconButton>
                </div>
            </section>
            <section className={'Horizontal-Flex-Container Space-Between'}>
                <Button filled={false} size={'small'}>
                    See all entries
                </Button>
                <div className={'Label'}>
                    Created at: 02/10/2022
                </div>
            </section>
        </MiniPageContainer>
    );
};

export default TaskView;
