import styles from "./Task.module.scss";
import CategoryIndicator from "../CategoryIndicator/CategoryIndicator";
import {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MiniPagesContext } from "@/context/MiniPagesContext";
import CurrentProgress from "../CurrentProgress/CurrentProgress";
import { TbFlame, TbHash, TbTargetArrow } from "react-icons/all";
import { useGetTaskCurrentEntry } from "@/hooks/get-hooks/useGetTaskCurrentEntry";
import TextSwitchContainer from "@/components/containers/TextSwitchContainer/TextSwitchContainer";
import { TbCheck } from "react-icons/tb";
import { checkTaskCompleted } from "@/functions/checkTaskCompleted";

const RepeatDetails = ({ task }) => {
  const { data: entry, isLoading } = useGetTaskCurrentEntry(
    task._id,
    task.currentEntryId
  );

  if (!task.repeats && task.type !== "Number") return;

  return (
    <div className={styles.repeatDetails}>
      {task.type === "Number" && (
        <div>
          <TbHash />
          <TextSwitchContainer>
            {isLoading && "..."}
            {!isLoading && entry.value}
          </TextSwitchContainer>
        </div>
      )}
      {task.type === "Number" && task.goal?.number && (
        <div>
          <TbTargetArrow />
          <TextSwitchContainer>{task.goal?.number}</TextSwitchContainer>
        </div>
      )}
      {task.type === "Number" && task.longGoal?.type && (
        <div className={styles.repeatSeparator}>|</div>
      )}
      {task.longGoal?.type && (
        <>
          <div>
            {task.longGoal?.type === "Streak" && (
              <>
                <TbFlame />
                <TextSwitchContainer>{task.streak?.number}</TextSwitchContainer>
              </>
            )}
            {task.longGoal?.type === "Total Completed" && (
              <>
                <TbCheck />
                <TextSwitchContainer>
                  {task.totalCompletedEntries}
                </TextSwitchContainer>
              </>
            )}
          </div>
          <div>
            <TbTargetArrow />
            <TextSwitchContainer>{task.longGoal?.number}</TextSwitchContainer>
          </div>
        </>
      )}
    </div>
  );
};

const Task = forwardRef(({ tasks, usesTime = false }, ref) => {
  const miniPagesContext = useContext(MiniPagesContext);
  const { data: entries, isLoading } = useGetTaskCurrentEntry(tasks);

  const filteredTasks = useMemo(() => {
    if (!usesTime) return tasks;

    return tasks.filter((task) => {
      const entry = entries?.find(
        (entry) => entry?._id === task.currentEntryId
      );

      if (!entry) return;

      return !checkTaskCompleted(task, entry);
    });
  }, [tasks, entries, isLoading]);

  const handleTaskClick = (taskId) => {
    miniPagesContext.dispatch({
      type: "ADD_PAGE",
      payload: { type: "task-view", id: taskId },
    });
  };

  const variants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: {
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.div
      className={styles.container}
      variants={variants}
      layout={"position"}
      ref={ref}
    >
      {tasks[0].category && (
        <CategoryIndicator
          categoryId={tasks[0].category}
          groupId={tasks[0].group}
        />
      )}
      <div className={"Stack-Container"}>
        {filteredTasks.map((task) => (
          <div
            key={task._id}
            className={styles.task}
            onClick={() => handleTaskClick(task._id)}
          >
            <div className={styles.detailsList}>
              <div className={styles.titleContainer}>{task.title}</div>
              <RepeatDetails task={task} />
            </div>
            <CurrentProgress key={task._id} task={task} />
          </div>
        ))}
      </div>
    </motion.div>
  );
});

export default Task;
