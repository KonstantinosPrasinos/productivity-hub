import React, {useContext, useState} from 'react';
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import CategoryIndicator from "../../components/indicators/CategoryIndicator/CategoryIndicator";
import Divider from "../../components/utilities/Divider/Divider";
import IconButton from "../../components/buttons/IconButton/IconButton";
import Button from "../../components/buttons/Button/Button";
import Chip from "../../components/buttons/Chip/Chip";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import styles from './Taskview.module.scss';
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import {useDeleteTask} from "../../hooks/delete-hooks/useDeleteTask";
import {useChangeEntry} from "../../hooks/change-hooks/useChangeEntry";
import {useGetTaskCurrentEntry} from "../../hooks/get-hooks/useGetTaskCurrentEntry";
import {useGetTaskEntries} from "../../hooks/get-hooks/useGetTaskEntries";
import LoadingIndicator from "../../components/indicators/LoadingIndicator/LoadingIndicator";
import {AnimatePresence, motion} from 'framer-motion';
import {
    FaPen,
    FaTrash,
    FaChevronLeft,
    FaMinus,
    FaChevronRight,
    FaSortDown,
    FaSortUp,
    FaCheck,
    FaPlus
} from "react-icons/fa";
import TextButton from "../../components/buttons/TextButton/TextButton";

const TaskTableContents = ({pastEntries, isLoading = false, sortOrderDate = 1, sortOrderValue = 0, currentEntry}) => {
    const [pageNumber, setPageNumber] = useState(0);

    if (isLoading) return (
        <tbody>
        <tr>
            <td colSpan={2} className={styles.loadingIndicatorContainer}>
                <LoadingIndicator size={"inline"} />
            </td>
        </tr>
        </tbody>
    )

    const entries = [...pastEntries, currentEntry];

    if (entries.length === 0) return (
        <tr>
            No entries
        </tr>
    )

    let sortedEntries;

    if (sortOrderDate !== 0) {
        sortedEntries = entries.sort((a, b) => {
            const dA = Date.parse(a.date);
            const dB = Date.parse(b.date);

            return sortOrderDate * (dA - dB);
        });
    } else {
        sortedEntries = entries.sort((a, b) => {
            return sortOrderValue * (a.value - b.value);
        });
    }

    const lastEntryNumber = () => {
        if (entries.length - 10 * pageNumber > 10) return (pageNumber * 10  + 10);
        return entries.length - 10 * pageNumber;
    }

    const increasePageNumber = () => {
        setPageNumber(current => current + 1);
    }
    const decreasePageNumber = () => {
        setPageNumber(current => current - 1);
    }

    return (
        <>
            <tbody>
            {sortedEntries.slice(pageNumber * 10, pageNumber * 10 + 10).map(entry => {
                const entryDate = new Date(entry.date);

                return <tr key={entry._id}>
                    <td>{entryDate.toLocaleDateString()}</td>
                    <td>{entry.value}</td>
                </tr>
            })}
            </tbody>
            <tfoot>
            <tr>
                <td>{pageNumber * 10 + 1}-{lastEntryNumber()} of {entries.length}</td>
                <td className={styles.pageButtons}>
                    <IconButton
                        onClick={decreasePageNumber}
                        disabled={pageNumber === 0}
                    >
                        <FaChevronLeft />
                    </IconButton>
                    <IconButton
                        onClick={increasePageNumber}
                        disabled={pageNumber === Math.floor(entries.length / 10)}
                    >
                        <FaChevronRight />
                    </IconButton>
                </td>
            </tr>
            </tfoot>
        </>
    )
}

const SortIcon = ({sortOrder}) => {
    switch (sortOrder) {
        case 0:
            return <FaMinus/>
        case 1:
            return <FaSortDown/>
        case -1:
            return <FaSortUp/>
    }
}

const TaskView = ({index, length, task}) => {
    const miniPagesContext = useContext(MiniPagesContext);
    const {mutate: deleteTask} = useDeleteTask();
    const {mutate: setTaskCurrentEntry} = useChangeEntry(task.title);
    const {data: entries, isLoading: entriesLoading} = useGetTaskEntries(task._id);
    const {data: entry} = useGetTaskCurrentEntry(task._id, task.currentEntryId);

    const [selectedGraph, setSelectedGraph] = useState('Average');
    const [sortOrderDate, setSortOrderDate] = useState(1); // 1 for most recent -> less recent, -1 for less recent -> most recent, 0 if sorting by other type.
    const [sortOrderValue, setSortOrderValue] = useState(0);

    const graphOptions = ['Average', 'Total'];

    const [date, setDate] = useState(new Date());

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

    const handleSetCurrentValueNumber = (e) => {
        const eventNumber = parseInt(e);

        if (isNaN(eventNumber) || eventNumber < 0) {
            setTaskCurrentEntry(task._id, entry._id, 0);
        } else {
            setTaskCurrentEntry(task._id, entry._id, eventNumber);
        }
    }

    const handleChangeSortOrderValue = () => {
        switch (sortOrderValue) {
            case 0:
                setSortOrderValue(1);
                setSortOrderDate(0);
                break;
            case 1:
                setSortOrderValue(-1);
                break;
            case -1:
                setSortOrderValue(1);
                break;
        }
    }

    const handleChangeSortOrderDate = () => {
        switch (sortOrderDate) {
            case 0:
                setSortOrderDate(1);
                setSortOrderValue(0);
                break;
            case 1:
                setSortOrderDate(-1);
                break;
            case -1:
                setSortOrderDate(1);
                break;
        }
    }

    return (
        <MiniPageContainer
            index={index}
            length={length}
        >
            <section className={`Horizontal-Flex-Container Space-Between`}>
                <div className={'Title'}>{task.title}</div>
                <div className={`Horizontal-Flex-Container ${styles.editIcons}`}>
                    <IconButton onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'new-task', id: task._id}})}><FaPen /></IconButton>
                    <IconButton onClick={handleDelete}><FaTrash /></IconButton>
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
                        <FaCheck />
                    </div> :
                    <div className={'Horizontal-Flex-Container'}>
                        <TextBoxInput value={entry?.value ?? 0} setValue={handleSetCurrentValueNumber} type={"number"}></TextBoxInput>
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
                        <FaChevronLeft />
                    </IconButton>
                    <div>
                        {`${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`}
                    </div>
                    <IconButton onClick={() => addToMonth(1)}>
                        <FaChevronRight />
                    </IconButton>
                </div>
            </section>
            <section>
                <table>
                    <thead>
                    <tr>
                        <th>
                            <button className={styles.tableButton} onClick={handleChangeSortOrderDate}>
                                Date:
                                <AnimatePresence mode={"wait"}>
                                    <motion.div
                                        key={sortOrderDate}
                                        initial={{scale: 0}}
                                        animate={{scale: 1}}
                                        exit={{scale: 0}}
                                        transition={{duration: 0.1}}
                                    >
                                        <SortIcon sortOrder={sortOrderDate} />
                                    </motion.div>
                                </AnimatePresence>
                            </button>
                        </th>
                        <th>
                            <button className={styles.tableButton} onClick={handleChangeSortOrderValue}>
                                Value:
                                <AnimatePresence mode={"wait"}>
                                    <motion.div
                                        key={sortOrderValue}
                                        initial={{scale: 0}}
                                        animate={{scale: 1}}
                                        exit={{scale: 0}}
                                        transition={{duration: 0.1}}
                                    >
                                        <SortIcon sortOrder={sortOrderValue} />
                                    </motion.div>
                                </AnimatePresence>
                            </button>
                        </th>
                    </tr>
                    </thead>
                    <TaskTableContents
                        pastEntries={entries}
                        sortOrderDate={sortOrderDate}
                        isLoading={entriesLoading}
                        sortOrderValue={sortOrderValue}
                        currentEntry={entry}
                    />
                </table>
                <TextButton>
                    Add new entry <FaPlus />
                </TextButton>
            </section>
            <section className={'Horizontal-Flex-Container Space-Between'}>
                <Button filled={false} size={'small'}>
                    See all entries
                </Button>
                <div className={'Label'}>
                    {new Date(task.createdAt).toLocaleString()}
                </div>
            </section>
        </MiniPageContainer>
    );
};

export default TaskView;
