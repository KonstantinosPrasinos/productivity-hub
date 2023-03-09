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
import Modal from "../../components/containers/Modal/Modal";
import {DayPicker} from "react-day-picker";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import CollapsibleContainer from "../../components/containers/CollapsibleContainer/CollapsibleContainer";
import {useAddEntry} from "../../hooks/add-hooks/useAddEntry";

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
        if (entries.length - 5 * pageNumber > 5) return (pageNumber * 5  + 5);
        return entries.length;
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
            {sortedEntries.slice(pageNumber * 5, pageNumber * 5 + 5).map(entry => {
                const entryDate = new Date(entry.date);

                return <tr key={entry._id}>
                    <td>{entryDate.toLocaleDateString()}</td>
                    <td>{entry.value}</td>
                </tr>
            })}
            </tbody>
            <tfoot>
            <tr>
                <td>{pageNumber * 5 + 1}-{lastEntryNumber()} of {entries.length}</td>
                <td className={styles.pageButtons}>
                    <IconButton
                        onClick={decreasePageNumber}
                        disabled={pageNumber === 0}
                    >
                        <FaChevronLeft />
                    </IconButton>
                    <IconButton
                        onClick={increasePageNumber}
                        disabled={pageNumber === Math.floor(entries.length / 5)}
                    >
                        <FaChevronRight />
                    </IconButton>
                </td>
            </tr>
            </tfoot>
        </>
    )
}

const EntryModal = ({toggleNewEntryModal, taskId}) => {
    const [value, setValue] = useState(0);
    const [date, setDate] = useState();
    const [isVisibleCalendar, setIsVisibleCalendar] = useState(false);
    const {mutateAsync: addEntry, isLoading, isError} = useAddEntry();

    const toggleCalendar = () => {
        setIsVisibleCalendar(current => !current);
    }

    const handleDateClick = (e) => {
        setIsVisibleCalendar(false);
        setDate(e.toLocaleDateString());
    }

    const handleContinue = async () => {
        await addEntry({date, value, taskId});
        if (!isError) {
            toggleNewEntryModal();
        }
    }

    return (
        <Modal
            isOverlay={true}
            dismountFunction={toggleNewEntryModal}
            isLoading={isLoading}
        >
            <div className={"Stack-Container Big-Gap"}>
                <div className={"Display"}>New entry</div>
                <div className={"Label"}>In order to create a new entry you need to enter a valid date and value.</div>
            </div>
            <div className={'Horizontal-Flex-Container Space-Between'}>
                <InputWrapper label={"Date"}>
                    <TextBoxInput
                        type={"calendar"}
                        placeholder={"Date"}
                        toggleCalendar={toggleCalendar}
                        value={date}
                        setValue={setDate}
                    />
                </InputWrapper>
                <InputWrapper label={"Value"}>
                    <TextBoxInput
                        type={"number"}
                        placeholder={"Value"}
                        value={value}
                        setValue={setValue}
                    />
                </InputWrapper>
            </div>
            <CollapsibleContainer isVisible={isVisibleCalendar}>
                <div className={'Horizontal-Flex-Container Align-Center'}>
                    <DayPicker
                        mode={"single"}
                        selected={date}
                        onDayClick={handleDateClick}
                    />
                </div>
            </CollapsibleContainer>
            <div className={'Horizontal-Flex-Container Space-Between'}>
                <Button
                    size={"big"}
                    filled={false}
                    onClick={toggleNewEntryModal}
                >
                    Cancel
                </Button>
                <Button
                    size={"big"}
                    disabled={date?.length <= 0}
                    onClick={handleContinue}
                >
                    Continue
                </Button>
            </div>

        </Modal>
    );
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
    const [isVisibleNewEntryModal, setIsVisibleNewEntryModal] = useState(false);
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

    const toggleNewEntryModal = () => {
        setIsVisibleNewEntryModal(current => !current);
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
            default:
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
            default:
                break;
        }
    }

    return (
        <div>
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
                {/*<section className={'Stack-Container'}>*/}
                {/*    <div className={'Horizontal-Flex-Container'}>*/}
                {/*        {graphOptions.map((option, index) => (*/}
                {/*            <Chip*/}
                {/*                selected={selectedGraph}*/}
                {/*                setSelected={setSelectedGraph}*/}
                {/*                value={option}*/}
                {/*                key={index}*/}
                {/*            >*/}
                {/*                {option}*/}
                {/*            </Chip>*/}
                {/*        ))}*/}
                {/*    </div>*/}
                {/*    <div className={'Horizontal-Flex-Container Space-Between'}>*/}
                {/*        <IconButton onClick={() => addToMonth(-1)}>*/}
                {/*            <FaChevronLeft />*/}
                {/*        </IconButton>*/}
                {/*        <div>*/}
                {/*            {`${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`}*/}
                {/*        </div>*/}
                {/*        <IconButton onClick={() => addToMonth(1)}>*/}
                {/*            <FaChevronRight />*/}
                {/*        </IconButton>*/}
                {/*    </div>*/}
                {/*</section>*/}
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

                </section>
                <section className={'Horizontal-Flex-Container Space-Between'}>
                    <Button onClick={toggleNewEntryModal}>
                        Add new entry <FaPlus />
                    </Button>
                    <div className={'Label Stack-Container'}>
                        <div>Created at:</div>
                        <div>{" " + new Date(task.createdAt).toLocaleString()}</div>
                    </div>
                </section>
            </MiniPageContainer>
            {isVisibleNewEntryModal && <EntryModal toggleNewEntryModal={toggleNewEntryModal} taskId={task._id} />}
        </div>
    );
};

export default TaskView;
