import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import styles from "./CurrentProgress.module.scss";
import { useChangeEntryValue } from "../../../hooks/change-hooks/useChangeEntryValue";
import { useGetTaskCurrentEntry } from "../../../hooks/get-hooks/useGetTaskCurrentEntry";

const LocalTbCheck = ({ isChecked }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        pathLength={1}
        className={`${styles.checkbox} ${
          isChecked ? styles.isChecked : styles.notChecked
        }`}
        strokeLinecap="round"
        strokeDasharray={1}
        d="M5 12l5 5l10 -10"
      />
    </svg>
  );
};

const LocalTbAdd = ({ isGreen }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={isGreen ? styles.numberIsGreen : ""}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 5l0 14" />
      <path d="M5 12l14 0" />
    </svg>
  );
};

const CurrentProgress = ({ task }) => {
  const { data: entry, isLoading } = useGetTaskCurrentEntry(
    task._id,
    task.currentEntryId
  );
  const [isChecked, setIsChecked] = useState(entry?.value > 0 ? true : false);
  const { mutate: setTaskCurrentEntry } = useChangeEntryValue(task.title);
  const [numberIsGreen, setNumberIsGreen] = useState(false);
  const isGreenTimeout = useRef();
  const saveChangesTimeout = useRef();

  const saveChanges = () => {
    const number = isChecked ? 0 : 1;

    setTaskCurrentEntry({
      taskId: task._id,
      entryId: entry?._id,
      value: number,
    });

    saveChangesTimeout.current = null;
  };

  const toggleIsChecked = (event) => {
    event.stopPropagation();
    setIsChecked(!isChecked);

    if (isLoading) return;
    if (task.type === "Checkbox") {
      if (saveChangesTimeout.current) {
        clearTimeout(saveChangesTimeout.current);
        saveChangesTimeout.current = null;
      }

      saveChangesTimeout.current = setTimeout(saveChanges, 300);
    } else {
      setTaskCurrentEntry({
        taskId: task._id,
        entryId: entry._id,
        value: entry?.value + task.step,
      });

      if (isGreenTimeout.current) {
        clearTimeout(isGreenTimeout.current);
      }

      setNumberIsGreen(true);

      isGreenTimeout.current = setTimeout(() => setNumberIsGreen(false), 400);
    }
  };

  useEffect(() => {
    return () => {
      if (saveChangesTimeout.current) {
        clearTimeout(isGreenTimeout.current);
        saveChanges();
      }
    };
  }, []);

  return (
    <button
      onClick={toggleIsChecked}
      className={styles.container}
      key={`current-progress-${task._id}`}
    >
      {task.type === "Number" && <LocalTbAdd isGreen={numberIsGreen} />}
      {task.type === "Checkbox" && (
        <LocalTbCheck key={`checkbox-${task._id}`} isChecked={isChecked} />
      )}
    </button>
  );
};

export default CurrentProgress;
