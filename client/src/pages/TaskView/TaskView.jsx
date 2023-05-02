import React, {useContext, useState} from 'react';
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import CategoryIndicator from "../../components/indicators/CategoryIndicator/CategoryIndicator";
import Divider from "../../components/utilities/Divider/Divider";
import IconButton from "../../components/buttons/IconButton/IconButton";
import Button from "../../components/buttons/Button/Button";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import styles from './Taskview.module.scss';
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import {useDeleteTask} from "../../hooks/delete-hooks/useDeleteTask";
import {useChangeEntryValue} from "../../hooks/change-hooks/useChangeEntryValue";
import {useGetTaskCurrentEntry} from "../../hooks/get-hooks/useGetTaskCurrentEntry";
import {useGetTaskEntries} from "../../hooks/get-hooks/useGetTaskEntries";
import LoadingIndicator from "../../components/indicators/LoadingIndicator/LoadingIndicator";
import {AnimatePresence, motion} from 'framer-motion';
import Modal from "../../components/containers/Modal/Modal";
import {DayPicker} from "react-day-picker";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import CollapsibleContainer from "../../components/containers/CollapsibleContainer/CollapsibleContainer";
import {useAddEntry} from "../../hooks/add-hooks/useAddEntry";
import {
    TbCheck,
    TbChevronDown,
    TbChevronLeft,
    TbChevronRight, TbChevronUp,
    TbEdit,
    TbMinus, TbPlus, TbRefresh,
    TbTrash
} from "react-icons/tb";
import {useDeleteEntry} from "../../hooks/delete-hooks/useDeleteEntry";
import TextButton from "../../components/buttons/TextButton/TextButton";
import {useChangeEntry} from "../../hooks/change-hooks/useChangeEntry";
import ToggleButton from "../../components/buttons/ToggleButton/ToggleButton";
import {UndoContext} from "../../context/UndoContext";
import {useGetSettings} from "../../hooks/get-hooks/useGetSettings";
import {useChangeSettings} from "../../hooks/change-hooks/useChangeSettings";

const StatSection = ({entries}) => {
    return (
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
                <div>3 days</div>
                <div></div>
            </div>
            <div className={'Rounded-Container Stack-Container'}>
                <div className={'Label'}>Unfilled Days</div>
                <div>2 days</div>
                <div className={'Label'}>Ended at: 05/10/2022</div>
            </div>
        </section>
    );
}

const TaskTableContents = ({entries, isLoading = false, sortOrderDate = 1, sortOrderValue = 0, setEditedEntry, setIsVisibleNewEntryModal}) => {
    const [pageNumber, setPageNumber] = useState(0);
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);

    if (isLoading) return (
        <tbody>
        <tr>
            <td colSpan={3} className={styles.loadingIndicatorContainer}>
                <LoadingIndicator size={"inline"} />
            </td>
        </tr>
        </tbody>
    )

    if (entries.length === 0) return (
        <tr>
            <td colspan={3}>No entries</td>
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

    const handleEditEntry = (entry) => {
        setEditedEntry(entry);
        setIsVisibleNewEntryModal(true);
    }

    return (
        <>
            <motion.tbody className={styles.tBody} key={pageNumber}>
                        {sortedEntries.slice(pageNumber * 5, pageNumber * 5 + 5).map(entry => {
                            const entryDate = new Date(entry.date);

                            return <tr
                                key={entry._id}
                            >
                                <td>{entryDate.toLocaleDateString()}</td>
                                <td>{entry.value}</td>
                                <td>
                                    <IconButton onClick={() => handleEditEntry(entry)}>
                                        <TbEdit />
                                    </IconButton>
                                </td>
                            </tr>
                        })}
            </motion.tbody>
            <tfoot>
            <tr>
                <td colSpan={3}>
                    <div className={"Horizontal-Flex-Container Space-Between"}>
                        <div>{pageNumber * 5 + 1}-{lastEntryNumber()} of {entries.length}</div>
                        <div>
                            <IconButton
                                onClick={decreasePageNumber}
                                disabled={pageNumber === 0}
                            >
                                <TbChevronLeft />
                            </IconButton>
                            <IconButton
                                onClick={increasePageNumber}
                                disabled={pageNumber === Math.floor(entries.length / 5)}
                            >
                                <TbChevronRight />
                            </IconButton>
                        </div>
                    </div>
                </td>
            </tr>
            </tfoot>
        </>
    )
}

const EntryModal = ({dismountNewEntryModal, taskId, editedEntry = null, entryDates}) => {
    const [value, setValue] = useState(editedEntry ? editedEntry.value : '0');
    const [date, setDate] = useState(editedEntry ? new Date(editedEntry.date) : "");
    const [isVisibleCalendar, setIsVisibleCalendar] = useState(false);
    const {mutateAsync: addEntry, isLoading, isError} = useAddEntry();
    const {mutateAsync: changeEntry, isLoading: isLoadingChange, isError: isErrorChange} = useChangeEntry();
    const {mutateAsync: deleteEntry, isLoading: isLoadingDelete, isError: isErrorDelete} = useDeleteEntry();

    const checkIsToday = (dateString) => {
        const currentDate = new Date();
        const date = new Date(dateString)

        return (
            date.getFullYear() === currentDate.getFullYear() &&
            date.getMonth() === currentDate.getMonth() &&
            date.getDate() === currentDate.getDate()
        );
    }

    const isToday = editedEntry ? checkIsToday(editedEntry.date) : false;

    const toggleCalendar = () => {
        setIsVisibleCalendar(current => !current);
    }

    const handleDateClick = (e) => {
        setIsVisibleCalendar(false);
        setDate(e);
    }

    const handleContinue = async () => {
        if (editedEntry) {
            if (date !== editedEntry.date || value !== editedEntry.value) {
                await changeEntry({taskId, entryId: editedEntry._id, value, date});
            }
            if (!isErrorChange) {
                dismountNewEntryModal();
            }
        } else {
            await addEntry({date, value, taskId});
            if (!isError) {
                dismountNewEntryModal();
            }
        }
    }

    const resetToOriginalValues = () => {
        if (editedEntry) {
            setValue(editedEntry.value);
            setDate((new Date(editedEntry.date)).toLocaleDateString());
        }
    }

    const handleDeleteClick = async () => {
        if (editedEntry) {
            if (isToday) {
                await changeEntry({taskId, entryId: editedEntry._id, value: 0});

                if (!isErrorChange) {
                    dismountNewEntryModal();
                }
            } else {
                await deleteEntry({taskId, entryId: editedEntry._id});

                if (!isErrorDelete) {
                    dismountNewEntryModal();
                }
            }
        }
    }

    const renderDisplayIcon = () => {
        if (isToday) return (
            <IconButton
                onClick={handleDeleteClick}
            >
                <TbRefresh />
            </IconButton>
        );
        return (
            <IconButton
                onClick={handleDeleteClick}
            >
                <TbTrash />
            </IconButton>
        );
    }

    const disabledDates = () => {
        if (editedEntry) {
            const editedEntryDate = new Date(editedEntry.date);

            return entryDates.filter(date => editedEntryDate.getTime() !== date.getTime());
        }
        return entryDates;
    }

    return (
        <Modal
            isOverlay={true}
            dismountFunction={dismountNewEntryModal}
            isLoading={isLoading || isLoadingChange || isLoadingDelete}
        >
            <div className={"Stack-Container Big-Gap"}>
                <div className={"Horizontal-Flex-Container Space-Around"}>
                    <div className={`Display Horizontal-Flex-Container`}>
                        {editedEntry ? (isToday ? "Today's entry" : "Existing entry") : "New Entry"}
                        {editedEntry &&
                            renderDisplayIcon()
                        }
                    </div>
                </div>
                <div className={"Label"}>{editedEntry ?
                    <div>
                        The original date was {(new Date(editedEntry.date)).toLocaleDateString()} and the original value was {editedEntry.value}
                        <br />
                        You can edit the entry below. {isToday && (<><br />You cannot delete today's entry, you can only reset it's value.</>)}
                        <br />
                        <TextButton onClick={resetToOriginalValues}>Reset to original values.</TextButton>
                    </div>:
                    "In order to create a new entry you need to enter a valid date and value."
                }</div>
            </div>
            <div className={'Horizontal-Flex-Container Space-Between'}>
                <InputWrapper label={"Date"}>
                    <TextBoxInput
                        type={"calendar"}
                        placeholder={"Date"}
                        toggleCalendar={toggleCalendar}
                        value={date ? date.toLocaleDateString() : ''}
                        setValue={setDate}
                        isDisabled={isToday}
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
                        disabled={disabledDates()}
                    />
                </div>
            </CollapsibleContainer>
            <div className={'Horizontal-Flex-Container Space-Between'}>
                <Button
                    size={'large'}
                    filled={false}
                    onClick={dismountNewEntryModal}
                >
                    Cancel
                </Button>
                <Button
                    size={'large'}
                    disabled={!date || date.toLocaleDateString()?.length <= 0}
                    onClick={handleContinue}
                >
                    Continue
                </Button>
            </div>
        </Modal>
    );
}

const ConfirmDeleteModal = ({dismountConfirmDeleteModal, deleteFunction, changeSettingsFunction}) => {
    const [neverShowAgain, setNeverShowAgain] = useState(false);

    const handleContinue = async () => {
        if (neverShowAgain) {
            changeSettingsFunction();
        }
        dismountConfirmDeleteModal();
        deleteFunction();
    }

    return (
        <Modal
            isOverlay={true} dismountFunction={dismountConfirmDeleteModal}
        >
            <div className={"Stack-Container Big-Gap"}>
                <div className={"Display"}>
                    Are you sure you want to delete this task?
                </div>
                <div className={"Label"}>
                    If you continue you will be able to undo this action for <b>10 seconds</b> (or until you dismiss the undo prompt),
                    after which the task will be deleted permanently.
                </div>
                <div className={"Label Horizontal-Flex-Container "}>
                    Never show this again:
                    <ToggleButton isToggled={neverShowAgain} setIsToggled={setNeverShowAgain} />
                </div>
            </div>
            <div className={'Horizontal-Flex-Container Space-Between'}>
                <Button
                    size={'large'}
                    filled={false}
                    onClick={dismountConfirmDeleteModal}
                >
                    Cancel
                </Button>
                <Button
                    size={'large'}
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
            return <TbMinus/>
        case 1:
            return <TbChevronUp />
        case -1:
            return <TbChevronDown />
    }
}

const TaskView = ({index, length, task}) => {
    const miniPagesContext = useContext(MiniPagesContext);
    const undoContext = useContext(UndoContext);
    
    const {mutate: deleteTask} = useDeleteTask();
    const {mutate: setTaskCurrentEntry} = useChangeEntryValue(task?.title);
    const {mutate: setSettings} = useChangeSettings();

    const {data: entries, isLoading: entriesLoading} = useGetTaskEntries(task?._id, task?.currentEntryId);
    const {data: entry} = useGetTaskCurrentEntry(task?._id, task?.currentEntryId);
    const {data: settings} = useGetSettings();

    // const [selectedGraph, setSelectedGraph] = useState('Average');
    const [editedEntry, setEditedEntry] = useState(null);
    const [isVisibleNewEntryModal, setIsVisibleNewEntryModal] = useState(false);
    const [isVisibleConfirmDeleteModal, setIsVisibleConfirmDeleteModal] = useState(false);
    const [sortOrderDate, setSortOrderDate] = useState(-1); // -1 for most recent -> less recent, 1 for less recent -> most recent, 0 if sorting by other type.
    const [sortOrderValue, setSortOrderValue] = useState(0);

    // const graphOptions = ['Average', 'Total'];

    // const [date, setDate] = useState(new Date());

    // const addToMonth = (adder) => {
    //     const newDate = new Date(date.getTime());
    //     newDate.setMonth(newDate.getMonth() + adder);
    //
    //     setDate(newDate);
    // }

    const updateSettings = async () => {
        await setSettings({...settings, confirmDeleteTask: false, priorityBounds: undefined});
    }

    const handleDelete = () => {
        miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''});
        undoContext.dispatch({type: 'ADD_UNDO', payload: {type: 'task', id: task?._id}});
        deleteTask(task?._id);
    }

    const handleDeleteClick = () => {
        if (settings.confirmDeleteTask) { // check with user settings for prompt to delete task
            setIsVisibleConfirmDeleteModal(true);
        } else {
            handleDelete()
        }
    }

    const handleSetCurrentValueCheckbox = () => {
        setTaskCurrentEntry(task?._id, entry?._id, entry?.value === 0 ? 1 : 0);
    }

    const handleSetCurrentValueNumber = (e) => {
        const eventNumber = parseInt(e);

        if (isNaN(eventNumber) || eventNumber < 0) {
            setTaskCurrentEntry(task?._id, entry._id, 0);
        } else {
            setTaskCurrentEntry(task?._id, entry._id, eventNumber);
        }
    }

    const dismountNewEntryModal = () => {
        setIsVisibleNewEntryModal(false);
        if (editedEntry) {
            setEditedEntry(null);
        }
    }

    const dismountConfirmDeleteModal = () => {
        setIsVisibleConfirmDeleteModal(false);
    }

    const handleChangeSortOrderValue = () => {
        switch (sortOrderValue) {
            case 0:
                setSortOrderValue(-1);
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
                setSortOrderDate(-1);
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
                    <div className={'Title'}>{task?.title}</div>
                    <div className={`Horizontal-Flex-Container ${styles.editIcons}`}>
                        <IconButton
                            onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'new-task', id: task?._id}})}
                        >
                            <TbEdit />
                        </IconButton>
                        <IconButton onClick={handleDeleteClick}><TbTrash /></IconButton>
                    </div>
                </section>
                <section className={'Horizontal-Flex-Container'}>
                    <div className={'Label'}>Category:</div>
                    {task?.category ?
                        <CategoryIndicator
                            categoryId={task?.category}
                            groupId={task?.group}
                        /> :
                        <div>None</div>
                    }
                </section>
                <section className={'Horizontal-Flex-Container'}>
                    <div className={'Label'}>Today's Entry:</div>
                    {task?.type === 'Checkbox' ?
                        <div className={`${styles.checkbox} ${entry?.value === 1 ? styles.checked : ''}`} onClick={handleSetCurrentValueCheckbox}>
                            <TbCheck />
                        </div> :
                        <div className={'Horizontal-Flex-Container'}>
                            <TextBoxInput value={entry?.value ?? 0} setValue={handleSetCurrentValueNumber} type={"number"}></TextBoxInput>
                        </div>}
                </section>
                <Divider />
                <StatSection entries={entries ? [...entries, entry] : [entry]} />
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
                    <motion.table className={styles.table}>
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
                            <th></th>
                        </tr>
                        </thead>
                        <TaskTableContents
                            entries={entries ? [...entries, entry] : [entry]}
                            sortOrderDate={sortOrderDate}
                            isLoading={entriesLoading}
                            sortOrderValue={sortOrderValue}
                            setEditedEntry={setEditedEntry}
                            setIsVisibleNewEntryModal={setIsVisibleNewEntryModal}
                        />
                    </motion.table>

                </section>
                <section className={'Horizontal-Flex-Container Space-Between'}>
                    <Button onClick={() => setIsVisibleNewEntryModal(true)}>
                        Add new entry <TbPlus />
                    </Button>
                    <div className={'Label Stack-Container'}>
                        <div>Created at:</div>
                        <div>{" " + new Date(task?.createdAt).toLocaleString()}</div>
                    </div>
                </section>
            </MiniPageContainer>
            {isVisibleNewEntryModal &&
                <EntryModal
                    dismountNewEntryModal={dismountNewEntryModal}
                    taskId={task?._id}
                    editedEntry={editedEntry}
                    entryDates={!entriesLoading ? [...entries, entry].map(tempEntry => new Date(tempEntry.date)) : [new Date(entry.date)]}
                />}
            {isVisibleConfirmDeleteModal &&
                <ConfirmDeleteModal
                    dismountConfirmDeleteModal={dismountConfirmDeleteModal}
                    deleteFunction={handleDelete}
                    changeSettingsFunction={updateSettings}
                />
            }
        </div>
    );
};

export default TaskView;
