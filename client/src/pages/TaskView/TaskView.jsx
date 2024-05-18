import React, { useContext, useMemo, useRef, useState } from "react";
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import CategoryIndicator from "../../components/indicators/CategoryIndicator/CategoryIndicator";
import IconButton from "../../components/buttons/IconButton/IconButton";
import Button from "../../components/buttons/Button/Button";
import { MiniPagesContext } from "../../context/MiniPagesContext";
import styles from "./Taskview.module.scss";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import { useDeleteTask } from "../../hooks/delete-hooks/useDeleteTask";
import { useChangeEntryValue } from "../../hooks/change-hooks/useChangeEntryValue";
import { useGetTaskCurrentEntry } from "../../hooks/get-hooks/useGetTaskCurrentEntry";
import { useGetTaskEntries } from "../../hooks/get-hooks/useGetTaskEntries";
import Modal from "../../components/containers/Modal/Modal";
import { DayPicker } from "react-day-picker";
import pickerStyles from "react-day-picker/dist/style.module.css";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import CollapsibleContainer from "../../components/containers/CollapsibleContainer/CollapsibleContainer";
import { useAddEntry } from "../../hooks/add-hooks/useAddEntry";
import { TbCheck, TbEdit, TbPlus, TbRefresh, TbTrash } from "react-icons/tb";
import { useDeleteEntry } from "../../hooks/delete-hooks/useDeleteEntry";
import TextButton from "../../components/buttons/TextButton/TextButton";
import { useChangeEntry } from "../../hooks/change-hooks/useChangeEntry";
import ToggleButton from "../../components/buttons/ToggleButton/ToggleButton";
import { UndoContext } from "../../context/UndoContext";
import { useGetSettings } from "../../hooks/get-hooks/useGetSettings";
import { useChangeSettings } from "../../hooks/change-hooks/useChangeSettings";
import Table from "@/components/utilities/Table/Table.jsx";
import { dateIsProper } from "@/functions/dateIsProper.js";
import { getDateAddDetails } from "@/functions/getDateAddDetails.js";
import CurrentProgress from "@/components/indicators/CurrentProgress/CurrentProgress";

const StatSection = ({ task }) => {
  const { data: entries, isLoading } = useGetTaskEntries(task._id);

  const { data: entry } = useGetTaskCurrentEntry(task._id, task.currentEntryId);
  const { functionName, timeToAdd } = useMemo(
    () =>
      getDateAddDetails(task.repeatRate.bigTimePeriod, task.repeatRate.number),
    [task]
  );

  const {
    currentStreak,
    longestStreak,
    longestStreakEndDate,
    currentStreakStartingDate,
    totalEntries,
    totalStarted,
    totalCompleted,
  } = useMemo(() => {
    let currentStreak = 0;
    let longestStreak = 0;

    let currentStreakStartingDate = null;
    let longestStreakEndDate = null;

    let totalEntries = 0;
    let totalStarted = 0;
    let totalCompleted = 0;

    if (isLoading)
      return {
        currentStreak,
        longestStreak,
        longestStreakEndDate,
        currentStreakStartingDate,
      };

    const allEntries = entries?.length ? [entry, ...entries] : [entry];

    const streakDate = new Date(task.repeatRate.startingDate[0]);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    while (streakDate.getTime() <= today.getTime()) {
      let dateCompleted = false;

      totalEntries++;

      const streakEntry = allEntries.find(
        (entry) =>
          entry.value > 0 &&
          new Date(entry.date).getTime() === streakDate.getTime()
      );

      if (streakEntry) {
        if (task.type === "Checkbox" && streakEntry) {
          dateCompleted = true;
        }

        if (task.type === "Number") {
          if (task?.goal?.number) {
            if (task.goal.number < entry.value) {
              dateCompleted = true;
            } else {
              totalStarted++;
            }
          } else {
            dateCompleted = true;
          }
        }
      }

      if (dateCompleted) {
        currentStreak++;
        totalCompleted++;

        if (!currentStreakStartingDate) {
          currentStreakStartingDate = new Date(streakEntry.date);
        }

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          longestStreakEndDate = new Date(streakEntry.date);
        }
      } else {
        currentStreak = 0;
        currentStreakStartingDate = null;
      }

      streakDate[`set${functionName}`](
        streakDate[`get${functionName}`]() + timeToAdd
      );
    }

    // If end date is today and current streak is not 0 then the longest streak is ongoing
    streakDate[`set${functionName}`](
      streakDate[`get${functionName}`]() - timeToAdd
    );
    if (
      longestStreakEndDate &&
      longestStreakEndDate.getTime() === streakDate.getTime() &&
      currentStreak > 0
    ) {
      longestStreakEndDate = "Ongoing";
    }

    return {
      currentStreak,
      longestStreak,
      longestStreakEndDate,
      currentStreakStartingDate,
      totalEntries,
      totalCompleted,
      totalStarted,
    };
  }, [task, entries, entry, isLoading]);

  return (
    <section className={"Grid-Container"}>
      <div className={"Rounded-Container Stack-Container"}>
        <div className={"Label"}>Current Streak</div>
        <div>
          {currentStreak === 1
            ? `${currentStreak} entry`
            : `${currentStreak} entries`}
        </div>
        <div className={"Label"}>
          {currentStreak > 0
            ? `Since: ${currentStreakStartingDate.toLocaleDateString()}`
            : ""}
        </div>
      </div>
      <div className={"Rounded-Container Stack-Container"}>
        <div className={"Label"}>Longest Streak</div>
        <div>
          {longestStreak === 1
            ? `${longestStreak} entry`
            : `${longestStreak} entries`}
        </div>
        <div className={"Label"}>
          {longestStreakEndDate === "Ongoing"
            ? "Ongoing"
            : longestStreakEndDate?.toLocaleDateString() ?? ""}
        </div>
      </div>
      {task.type === "Number" && (
        <>
          <div className={"Rounded-Container Stack-Container"}>
            <div className={"Label"}>% Completed</div>
            <div>
              {totalEntries > 0
                ? ((totalCompleted / totalEntries) * 100).toFixed(1)
                : 0}
            </div>
            <div className={"Label"}>Total: {totalCompleted}</div>
          </div>
          <div className={"Rounded-Container Stack-Container"}>
            <div className={"Label"}>% Started</div>
            <div>
              {totalEntries > 0
                ? ((totalStarted / totalEntries) * 100).toFixed(1)
                : 0}
            </div>
            <div className={"Label"}>Total: {totalStarted}</div>
          </div>
        </>
      )}
    </section>
  );
};

const EntryModal = ({
  dismountNewEntryModal,
  taskId,
  editedEntry = null,
  entryDates,
  task,
}) => {
  const [value, setValue] = useState(editedEntry ? editedEntry.value : "0");
  const [date, setDate] = useState(
    editedEntry ? new Date(editedEntry.date) : ""
  );
  const [isVisibleCalendar, setIsVisibleCalendar] = useState(false);
  const { mutateAsync: addEntry, isLoading, isError } = useAddEntry();
  const {
    mutateAsync: changeEntry,
    isLoading: isLoadingChange,
    isError: isErrorChange,
  } = useChangeEntry();
  const {
    mutateAsync: deleteEntry,
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
  } = useDeleteEntry();

  const checkIsToday = (dateString) => {
    const currentDate = new Date();
    const date = new Date(dateString);

    return (
      date.getFullYear() === currentDate.getFullYear() &&
      date.getMonth() === currentDate.getMonth() &&
      date.getDate() === currentDate.getDate()
    );
  };

  const isToday = editedEntry ? checkIsToday(editedEntry.date) : false;

  const toggleCalendar = () => {
    setIsVisibleCalendar((current) => !current);
  };

  const handleDateClick = (e) => {
    setIsVisibleCalendar(false);
    setDate(e);
  };

  const handleContinue = async () => {
    if (editedEntry) {
      if (date !== editedEntry.date || value !== editedEntry.value) {
        const newDate = new Date(date);
        newDate.setHours(newDate.getHours() - newDate.getTimezoneOffset() / 60);

        await changeEntry({
          taskId,
          entryId: editedEntry._id,
          value,
          date: newDate,
        });
      }
      if (!isErrorChange) {
        dismountNewEntryModal();
      }
    } else {
      const newDate = new Date(date);
      newDate.setHours(newDate.getHours() - newDate.getTimezoneOffset() / 60);

      await addEntry({ date: newDate, value, taskId });
      if (!isError) {
        dismountNewEntryModal();
      }
    }
  };

  const resetToOriginalValues = () => {
    if (editedEntry) {
      setValue(editedEntry.value);
      setDate(new Date(editedEntry.date).toLocaleDateString());
    }
  };

  const handleDeleteClick = async () => {
    if (editedEntry) {
      if (isToday) {
        await changeEntry({ taskId, entryId: editedEntry._id, value: 0 });

        if (!isErrorChange) {
          dismountNewEntryModal();
        }
      } else {
        await deleteEntry({ taskId, entryId: editedEntry._id });

        if (!isErrorDelete) {
          dismountNewEntryModal();
        }
      }
    }
  };

  const renderDisplayIcon = () => {
    if (isToday)
      return (
        <IconButton onClick={handleDeleteClick}>
          <TbRefresh />
        </IconButton>
      );
    return (
      <IconButton onClick={handleDeleteClick}>
        <TbTrash />
      </IconButton>
    );
  };

  const disabledDates = useMemo(() => {
    const datesToDisable = [{ after: new Date() }];

    if (editedEntry) {
      const editedEntryDate = new Date(editedEntry.date);

      datesToDisable.push(
        ...entryDates.filter(
          (date) => editedEntryDate.getTime() !== date.getTime()
        )
      );
    } else {
      datesToDisable.push(...entryDates);
    }

    return datesToDisable;
  }, [editedEntry, entryDates]);

  const classNames = {
    ...pickerStyles,
    day: styles.customDay,
    day_selected: styles.customSelectedDay,
  };

  const properDateStyles = { fontSize: "120%", fontWeight: "bold", opacity: 1 };

  const tempFunction = (date) => {
    return dateIsProper(date, task);
  };

  return (
    <Modal
      isOverlay={true}
      dismountFunction={dismountNewEntryModal}
      isLoading={isLoading || isLoadingChange || isLoadingDelete}
    >
      <div className={"Stack-Container Big-Gap"}>
        <div className={"Horizontal-Flex-Container Space-Around"}>
          <div className={`Display Horizontal-Flex-Container`}>
            {editedEntry
              ? isToday
                ? "Today's entry"
                : "Existing entry"
              : "New Entry"}
            {editedEntry && renderDisplayIcon()}
          </div>
        </div>
        <div className={"Label"}>
          {editedEntry ? (
            <div>
              The original date was{" "}
              {new Date(editedEntry.date).toLocaleDateString()} and the original
              value was {editedEntry.value}
              <br />
              You can edit the entry below.{" "}
              {isToday && (
                <>
                  <br />
                  You cannot delete today's entry, you can only reset it's
                  value.
                </>
              )}
              <br />
              <TextButton onClick={resetToOriginalValues}>
                Reset to original values.
              </TextButton>
            </div>
          ) : (
            "In order to create a new entry you need to enter a valid date and value."
          )}
          <br />
          <br />
          Note: Only dates that follow the rules stated when creating the entry
          will be counted towards the streak and other statistics. Such dates
          are marked on the calendar picker.
        </div>
      </div>
      <div className={"Horizontal-Flex-Container Space-Between"}>
        <InputWrapper label={"Date"}>
          <TextBoxInput
            type={"calendar"}
            placeholder={"Date"}
            toggleCalendar={toggleCalendar}
            value={date ? date.toLocaleDateString() : ""}
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
        <div className={"Horizontal-Flex-Container Align-Center"}>
          <DayPicker
            mode={"single"}
            classNames={classNames}
            selected={date}
            onDayClick={handleDateClick}
            disabled={disabledDates}
            modifiers={{ proper: tempFunction }}
            modifiersStyles={{ proper: properDateStyles }}
          />
        </div>
      </CollapsibleContainer>
      <div className={"Horizontal-Flex-Container Space-Between"}>
        <Button size={"large"} filled={false} onClick={dismountNewEntryModal}>
          Cancel
        </Button>
        <Button
          size={"large"}
          disabled={!date || date.toLocaleDateString()?.length <= 0}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </Modal>
  );
};

const ConfirmDeleteModal = ({
  dismountConfirmDeleteModal,
  deleteFunction,
  changeSettingsFunction,
}) => {
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  const handleContinue = async () => {
    if (neverShowAgain) {
      changeSettingsFunction();
    }
    dismountConfirmDeleteModal();
    deleteFunction();
  };

  return (
    <Modal isOverlay={true} dismountFunction={dismountConfirmDeleteModal}>
      <div className={"Stack-Container Big-Gap"}>
        <div className={"Display"}>
          Are you sure you want to delete this task?
        </div>
        <div className={"Label"}>
          If you continue you will be able to undo this action for{" "}
          <b>10 seconds</b> (or until you dismiss the undo prompt), after which
          the task will be deleted permanently.
        </div>
        <div className={"Label Horizontal-Flex-Container "}>
          Never show this again:
          <ToggleButton
            isToggled={neverShowAgain}
            setIsToggled={setNeverShowAgain}
          />
        </div>
      </div>
      <div className={"Horizontal-Flex-Container Space-Between"}>
        <Button
          size={"large"}
          filled={false}
          onClick={dismountConfirmDeleteModal}
        >
          Cancel
        </Button>
        <Button size={"large"} onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </Modal>
  );
};

const TaskView = ({ index, length, task }) => {
  const miniPagesContext = useContext(MiniPagesContext);
  const undoContext = useContext(UndoContext);

  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: setTaskCurrentEntry } = useChangeEntryValue(task?.title);
  const { mutate: setSettings } = useChangeSettings();

  const { data: entries, isLoading: entriesLoading } = useGetTaskEntries(
    task?._id,
    task?.currentEntryId
  );
  const { data: entry } = useGetTaskCurrentEntry(
    task?._id,
    task?.currentEntryId
  );
  const { data: settings } = useGetSettings();

  // const [selectedGraph, setSelectedGraph] = useState('Average');
  const [editedEntry, setEditedEntry] = useState(null);
  const [isVisibleNewEntryModal, setIsVisibleNewEntryModal] = useState(false);
  const [isVisibleConfirmDeleteModal, setIsVisibleConfirmDeleteModal] =
    useState(false);
  const collapsedFocusedElement = useRef();

  // const graphOptions = ['Average', 'Total'];

  // const [date, setDate] = useState(new Date());

  // const addToMonth = (adder) => {
  //     const newDate = new Date(date.getTime());
  //     newDate.setMonth(newDate.getMonth() + adder);
  //
  //     setDate(newDate);
  // }

  const updateSettings = async () => {
    await setSettings({ ...settings, priorityBounds: undefined });
  };

  const handleDelete = () => {
    miniPagesContext.dispatch({ type: "REMOVE_PAGE", payload: "" });
    undoContext.dispatch({
      type: "ADD_UNDO",
      payload: { type: "task", id: task?._id },
    });
    deleteTask(task?._id);
  };

  const handleDeleteClick = () => {
    if (settings.confirmDelete) {
      // check with user settings for prompt to delete task
      setIsVisibleConfirmDeleteModal(true);
    } else {
      handleDelete();
    }
  };

  const handleSetCurrentValueCheckbox = () => {
    setTaskCurrentEntry({
      taskId: task?._id,
      entryId: entry?._id,
      value: entry?.value === 0 ? 1 : 0,
    });
  };

  const handleSetCurrentValueNumber = (e) => {
    const eventNumber = parseInt(e);

    if (isNaN(eventNumber) || eventNumber < 0) {
      setTaskCurrentEntry({ taskId: task?._id, entryId: entry._id, value: 0 });
    } else {
      setTaskCurrentEntry({
        taskId: task?._id,
        entryId: entry._id,
        value: eventNumber,
      });
    }
  };

  const dismountNewEntryModal = () => {
    setIsVisibleNewEntryModal(false);
    if (editedEntry) {
      setEditedEntry(null);
    }
  };

  const dismountConfirmDeleteModal = () => {
    setIsVisibleConfirmDeleteModal(false);
  };

  const entriesWithIsProper = useMemo(() => {
    if (entriesLoading) return;

    const allEntries = entries ? [...entries, entry] : [entry];

    return allEntries.map((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setUTCHours(0, 0, 0, 0);

      return { ...entry, isProperDate: dateIsProper(entryDate, task) };
    });
  }, [entries, entry, entriesLoading]);

  const handleEditEntry = (entry) => {
    setEditedEntry(entry);
    setIsVisibleNewEntryModal(true);
  };

  return (
    <div>
      <MiniPageContainer
        index={index}
        length={length}
        showSaveButton={false}
        collapsedFocusedElement={collapsedFocusedElement}
      >
        <section
          className={`Horizontal-Flex-Container Space-Between`}
          ref={collapsedFocusedElement}
        >
          <div className={"Title"}>{task?.title}</div>
          <div className={`Horizontal-Flex-Container ${styles.editIcons}`}>
            <IconButton
              onClick={() =>
                miniPagesContext.dispatch({
                  type: "ADD_PAGE",
                  payload: { type: "new-task", id: task?._id },
                })
              }
            >
              <TbEdit />
            </IconButton>
            <IconButton onClick={handleDeleteClick}>
              <TbTrash />
            </IconButton>
          </div>
        </section>
        <section className={"Horizontal-Flex-Container"}>
          <div className={"Label"}>Category:</div>
          {task?.category ? (
            <CategoryIndicator
              categoryId={task?.category}
              groupId={task?.group}
            />
          ) : (
            <div>None</div>
          )}
        </section>
        <section className={"Horizontal-Flex-Container"}>
          <div className={"Label"}>{task.repeats && "Today's"} Value:</div>
          <CurrentProgress task={task} />
          {task.type === "Number" && entry.value}
        </section>
        {task.repeats && <StatSection task={task} />}
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
        {task.repeats && (
          <section>
            <Table
              entries={entriesWithIsProper}
              entriesLoading={entriesLoading}
              setIsVisibleNewEntryModal={setIsVisibleNewEntryModal}
              handleEditEntry={handleEditEntry}
            />
          </section>
        )}
        <section className={"Horizontal-Flex-Container Space-Between"}>
          {task.repeats && (
            <Button onClick={() => setIsVisibleNewEntryModal(true)}>
              Add new entry <TbPlus />
            </Button>
          )}
          <div className={"Label Stack-Container"}>
            <div>Created at:</div>
            <div>{" " + new Date(task?.createdAt).toLocaleString()}</div>
          </div>
        </section>
      </MiniPageContainer>
      {isVisibleNewEntryModal && (
        <EntryModal
          dismountNewEntryModal={dismountNewEntryModal}
          taskId={task?._id}
          editedEntry={editedEntry}
          entryDates={
            !entriesLoading
              ? [...entries, entry].map((tempEntry) => new Date(tempEntry.date))
              : [new Date(entry.date)]
          }
          task={task}
        />
      )}
      {isVisibleConfirmDeleteModal && (
        <ConfirmDeleteModal
          dismountConfirmDeleteModal={dismountConfirmDeleteModal}
          deleteFunction={handleDelete}
          changeSettingsFunction={updateSettings}
        />
      )}
    </div>
  );
};

export default TaskView;
