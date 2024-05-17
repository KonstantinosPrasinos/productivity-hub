import React, { useMemo, useState } from "react";
import styles from "./TaskList.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import Task from "@/components/indicators/Task/Task.jsx";
import Chip from "@/components/buttons/Chip/Chip";
import { useGetCategories } from "@/hooks/get-hooks/useGetCategories";

const variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
};

const CategoryChips = ({ categoryFilter, setCategoryFilter }) => {
  const { data: categories } = useGetCategories();

  const toggleSelected = (category) => {
    if (categoryFilter.includes(category)) {
      setCategoryFilter((current) =>
        current.filter((tempCategory) => tempCategory._id != category._id)
      );
    } else {
      setCategoryFilter((current) => [...current, category]);
    }
  };

  return (
    <>
      <div className={styles.categoryChipContainer}>
        {categoryFilter.map((category) => (
          <Chip
            size={"small"}
            key={category._id}
            selected={category._id}
            value={category._id}
            setSelected={() => toggleSelected(category)}
          >
            <div className="Horizontal-Flex-Container">
              <div
                className={`${styles.categoryChipColor} ${category.color}`}
              ></div>
              {category.title}
            </div>
          </Chip>
        ))}
        {categories
          .filter((category) => !categoryFilter.includes(category))
          .map((category) => (
            <Chip
              size={"small"}
              key={category._id}
              selected={null}
              value={category._id}
              setSelected={() => toggleSelected(category)}
            >
              <div className="Horizontal-Flex-Container">
                <div
                  className={`${styles.categoryChipColor} ${category.color}`}
                ></div>
                {category.title}
              </div>
            </Chip>
          ))}
      </div>
    </>
  );
};

const TaskList = ({ tasks = [] }) => {
  const [filter, setFilter] = useState([]);

  const filteredTasks = useMemo(() => {
    if (filter.length == 0) return tasks;

    return tasks.filter((task) => {
      // Check for if the tasks is actually a group of tasks in a category
      if (task.hasOwnProperty("tasks")) {
        return filter
          .map((tempFilter) => tempFilter._id)
          .includes(task.tasks[0].category);
      } else {
        return filter
          .map((tempFilter) => tempFilter._id)
          .includes(task.category);
      }
    });
  }, [filter, tasks]);

  return (
    <motion.div
      variants={variants}
      initial={"hidden"}
      animate={"visible"}
      exit={"exit"}
      className={styles.container}
    >
      <CategoryChips categoryFilter={filter} setCategoryFilter={setFilter} />
      <div className={`Stack-Container ${styles.leftSide}`}>
        {/*
                Animate Presence is needed here to set initial to true.
                Otherwise, the stagger doesn't work on list view because of the switch container.
            */}
        <AnimatePresence initial={true} mode="popLayout">
          {filteredTasks.length === 0 && (
            <motion.div
              initial={"hidden"}
              animate={"visible"}
              exit={"exit"}
              variants={childVariants}
              className={`Empty-Indicator-Container`}
            >
              No tasks for now
            </motion.div>
          )}
          {filteredTasks.length > 0 &&
            filteredTasks.map((task) =>
              !task.hasOwnProperty("tasks") ? (
                <Task key={task._id} tasks={[task]}></Task>
              ) : (
                <Task key={task.tasks[0]._id} tasks={task.tasks}></Task>
              )
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TaskList;
