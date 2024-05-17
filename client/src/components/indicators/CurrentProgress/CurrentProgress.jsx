import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useState } from "react";
import styles from "./CurrentProgress.module.scss";
import { useChangeEntryValue } from "../../../hooks/change-hooks/useChangeEntryValue";
import { useGetTaskCurrentEntry } from "../../../hooks/get-hooks/useGetTaskCurrentEntry";

const LocalTbCheck = () => {
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
      <motion.path
        pathLength={1}
        strokeLinecap="round"
        initial={{ strokeDashoffset: 1, color: "var(--success-color)" }}
        animate={{
          strokeDashoffset: 0,
          opacity: 1,
          color: "var(--primary-color)",
        }}
        exit={{
          strokeDashoffset: 1,
          opacity: 0,
        }}
        transition={{
          type: "spring",
          duration: 0.3,
          bounce: 0,
          color: {
            delay: 0.2,
            duration: 0.1,
          },
        }}
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
      <motion.path d="M12 5l0 14" />
      <path d="M5 12l14 0" />
    </svg>
  );
};

const CurrentProgress = ({ task }) => {
  const { data: entry, isLoading } = useGetTaskCurrentEntry(
    task._id,
    task.currentEntryId
  );
  const [isChecked, setIsChecked] = useState(entry?.value > 0);
  const { mutate: setTaskCurrentEntry } = useChangeEntryValue(task.title);
  const [numberIsGreen, setNumberIsGreen] = useState(false);
  const isGreenTimeout = useRef();

  const toggleIsChecked = (event) => {
    event.stopPropagation();
    setIsChecked((current) => !current);

    if (isLoading) return;
    if (task.type === "Checkbox") {
      const number = isChecked ? 0 : 1;

      setTaskCurrentEntry({
        taskId: task._id,
        entryId: entry?._id,
        value: number,
      });
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

  return (
    <button onClick={toggleIsChecked} className={styles.container}>
      <AnimatePresence initial={false}>
        {task.type === "Number" && <LocalTbAdd isGreen={numberIsGreen} />}
        {task.type === "Checkbox" && isChecked && <LocalTbCheck />}
      </AnimatePresence>
    </button>
  );
};

export default CurrentProgress;
