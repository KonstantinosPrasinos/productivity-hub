import styles from "./Task.module.scss";
import CategoryIndicator from "../CategoryIndicator/CategoryIndicator";
import {
  forwardRef,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MiniPagesContext } from "@/context/MiniPagesContext";
import CurrentProgress from "../CurrentProgress/CurrentProgress";
import { TbChevronDown, TbFlame, TbHash, TbTargetArrow } from "react-icons/tb";
import { useGetTaskCurrentEntry } from "@/hooks/get-hooks/useGetTaskCurrentEntry";
import TextSwitchContainer from "@/components/containers/TextSwitchContainer/TextSwitchContainer";
import { TbCheck } from "react-icons/tb";
import IconButton from "@/components/buttons/IconButton/IconButton";
import { checkTaskCompleted } from "@/functions/checkTaskCompleted.js";
import { useScreenSize } from "@/hooks/useScreenSize.js";

const RepeatDetails = memo(({ task }) => {
  const { data: entry, isLoading } = useGetTaskCurrentEntry(
    task._id,
    task.currentEntryId,
  );

  if (!task.repeats && task.type !== "Number") return null;

  return (
    <div className={styles.repeatDetails}>
      {task.type === "Number" && (
        <div>
          <TbHash />
          <TextSwitchContainer>
            {isLoading && "..."}
            {!isLoading && entry.value}
          </TextSwitchContainer>
          {task.goal?.number && <>/ {task.goal?.number}</>}
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
});

const TaskRow = ({ task, handleTaskClick }) => {
  const { data: entry, isLoading: entryLoading } = useGetTaskCurrentEntry(
    task._id,
    task.currentEntryId,
  );

  const taskCompleted = useMemo(
    () => checkTaskCompleted(task, entry),
    [task, entry, entryLoading],
  );

  return (
    <motion.div
      key={task._id}
      className={`${styles.task} ${taskCompleted ? styles.taskCompleted : ""}`}
      onClick={() => handleTaskClick(task._id)}
      exit={{ opacity: 0, height: 0, padding: 0 }}
    >
      <div className={styles.detailsList}>
        <div className={styles.titleContainer}>{task.title}</div>
        <RepeatDetails task={task} />
      </div>
      <CurrentProgress key={task._id} task={task} />
    </motion.div>
  );
};

const Task = memo(
  forwardRef(({ tasks }, ref) => {
    const miniPagesContext = useContext(MiniPagesContext);
    const [isExpanded, setIsExpanded] = useState(true);
    const { screenSize } = useScreenSize();

    const variants = useMemo(() => {
      return {
        expanded: { opacity: 1, y: 0, /*scale: 1, */ height: "auto" },
        collapsed: {
          opacity: 1,
          y: 0,
          /*scale: 1, */ height:
            screenSize === "small" ? 16 * 1.2 + 10 + 20 : 14 * 1.2 + 8 + 20,
        },
        exit: {
          opacity: 0,
          scale: 0.5,
        },
      };
    }, [screenSize]);

    const handleTaskClick = useCallback((taskId) => {
      miniPagesContext.dispatch({
        type: "ADD_PAGE",
        payload: { type: "task-view", id: taskId },
      });
    }, []);

    const toggleExpansion = useCallback(() => {
      setIsExpanded((current) => !current);
    }, []);

    const animateValue = useMemo(() => {
      return isExpanded ? "expanded" : "collapsed";
    }, [isExpanded]);

    return (
      <motion.div
        className={styles.container}
        animate={animateValue}
        exit={"exit"}
        variants={variants}
        layout={"position"}
        ref={ref}
      >
        <div className={styles.subContainer}>
          {tasks[0].category && (
            <div className="Horizontal-Flex-Container Space-Between">
              <CategoryIndicator
                categoryId={tasks[0].category}
                groupId={tasks[0].group}
              />
              <div
                className={`${styles.expandButton} ${
                  isExpanded ? styles.expandButtonUpsideDown : ""
                }`}
              >
                <IconButton
                  size="large"
                  onClick={toggleExpansion}
                  hasPadding={false}
                >
                  <TbChevronDown />
                </IconButton>
              </div>
            </div>
          )}
          <div className={styles.tasksContainer}>
            <AnimatePresence>
              {tasks.map((task) => (
                <TaskRow
                  task={task}
                  handleTaskClick={handleTaskClick}
                  key={task._id}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }),
);

export default Task;
