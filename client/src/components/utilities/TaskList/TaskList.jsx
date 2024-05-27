import React, { useContext, useMemo, useState } from "react";
import styles from "./TaskList.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import Task from "@/components/indicators/Task/Task.jsx";
import Chip from "@/components/buttons/Chip/Chip";
import { useGetCategories } from "@/hooks/get-hooks/useGetCategories";
import { TbPlus } from "react-icons/tb";
import Button from "@/components/buttons/Button/Button";
import { MiniPagesContext } from "@/context/MiniPagesContext";
import { useGetGroups } from "@/hooks/get-hooks/useGetGroups";

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

const CategoryChips = ({
  categoryFilter,
  setCategoryFilter,
  subCategoryFilter,
  setSubCategoryFilter,
}) => {
  const { data: categories } = useGetCategories();
  const { data: subCategories } = useGetGroups();
  const miniPagesContext = useContext(MiniPagesContext);

  const toggleSelected = (category) => {
    if (
      categoryFilter
        .map((tempCategory) => tempCategory._id)
        .includes(category._id)
    ) {
      setCategoryFilter((current) =>
        current.filter((tempCategory) => tempCategory._id != category._id)
      );

      // setSubCategoryFilter((current) =>
      //   current.filter(
      //     (tempSubcategory) => tempSubcategory.parent !== category._id
      //   )
      // );
    } else {
      setCategoryFilter((current) => [
        ...current,
        { ...category, selectedSubcategories: [] },
      ]);
    }
  };

  const toggleSubcategorySelected = (subcategory) => {
    const subcategoryParent = categoryFilter.find(
      (tempSubcategory) => tempSubcategory._id === subcategory.parent
    );

    if (subcategoryParent.selectedSubcategories.includes(subcategory)) {
      setCategoryFilter((current) =>
        current.map((tempCategory) =>
          tempCategory._id != subcategoryParent._id
            ? tempCategory
            : {
                ...tempCategory,
                selectedSubcategories:
                  tempCategory.selectedSubcategories.filter(
                    (tempSubcategory) => tempSubcategory._id !== subcategory._id
                  ),
              }
        )
      );
    } else {
      setCategoryFilter((current) =>
        current.map((tempCategory) =>
          tempCategory._id != subcategoryParent._id
            ? tempCategory
            : {
                ...tempCategory,
                selectedSubcategories: [
                  ...tempCategory.selectedSubcategories,
                  subcategory,
                ],
              }
        )
      );
    }
  };

  const handleNewClick = () => {
    miniPagesContext.dispatch({
      type: "ADD_PAGE",
      payload: { type: "new-category" },
    });
  };

  return (
    <>
      <div className={styles.categoryChipContainer}>
        {/* {categoryFilter.map((category) => (
          <Chip
            size={"small"}
            key={category._id}
            selected={category._id}
            value={category._id}
            setSelected={() => toggleSelected(category)}
            hasShadow={true}
          >
            <div className={styles.categoryContents}>
              <div
                className={`${styles.categoryChipColor} ${category.color}`}
              ></div>
              <span>{category.title}</span>
            </div>
          </Chip>
        ))} */}
        {categories.map((category) => {
          const categorySubcategories = subCategories.filter(
            (subCategory) => subCategory.parent === category._id
          );

          return (
            <div
              key={category._id}
              className={
                categorySubcategories.length ? styles.categoryContainer : ""
              }
            >
              <Chip
                size={"small"}
                selected={
                  categoryFilter
                    .map((tempCategory) => tempCategory._id)
                    .includes(category._id)
                    ? category
                    : null
                }
                value={category}
                setSelected={() => toggleSelected(category)}
                hasShadow={true}
              >
                <div className={styles.categoryContents}>
                  <div
                    className={`${styles.categoryChipColor} ${category.color}`}
                  ></div>
                  <span>{category.title}</span>
                </div>
              </Chip>
              <AnimatePresence>
                {categoryFilter
                  .map((tempCategory) => tempCategory._id)
                  .includes(category._id) &&
                  categorySubcategories.map((subCategory) => (
                    <motion.div
                      key={subCategory._id}
                      className={styles.subCategoryContainer}
                      initial={{ height: 0, marginTop: 0, opacity: 0 }}
                      animate={{ height: "auto", marginTop: 10, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      exit={{
                        height: 0,
                        marginTop: 0,
                        overflow: "hidden",
                        opacity: 0,
                      }}
                    >
                      <div className={styles.subCategoryIndicator}></div>
                      <Chip
                        value={subCategory}
                        selected={
                          categoryFilter
                            .find(
                              (tempCategory) =>
                                tempCategory._id === category._id
                            )
                            .selectedSubcategories.includes(subCategory)
                            ? subCategory
                            : null
                        }
                        size={"small"}
                        hasShadow={true}
                        setSelected={() =>
                          toggleSubcategorySelected(subCategory)
                        }
                      >
                        {subCategory.title}
                      </Chip>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          );
        })}
        <Button
          onClick={handleNewClick}
          filled={false}
          type={"square"}
          hasShadow={true}
          size="small"
        >
          <span className="Horizontal-Flex-Container">
            Add new
            <TbPlus />
          </span>
        </Button>
      </div>
    </>
  );
};

const TaskList = ({ tasks = [], usesTime = false }) => {
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [subCategoryFilter, setSubCategoryFilter] = useState([]);

  const filteredTasks = useMemo(() => {
    if (categoryFilter.length == 0) return tasks;

    return tasks.filter((task) => {
      // Check for if the tasks is actually a group of tasks in a category
      if (task.hasOwnProperty("tasks")) {
        const matchedCategory = categoryFilter.find(
          (tempFilter) => tempFilter._id === task.tasks[0].category
        );

        const matchesSubcategory =
          matchedCategory?.selectedSubcategories?.length === 0 ||
          matchedCategory?.selectedSubcategories
            .map((tempFilter) => tempFilter._id)
            .includes(task.tasks[0].group);

        return matchedCategory && matchesSubcategory;
      } else {
        return categoryFilter
          .map((tempFilter) => tempFilter._id)
          .includes(task.category);
      }
    });
  }, [categoryFilter, tasks]);

  return (
    <motion.div
      variants={variants}
      initial={"hidden"}
      animate={"visible"}
      exit={"exit"}
      className={styles.container}
    >
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
                <Task
                  key={task.tasks[0]._id}
                  tasks={task.tasks}
                  usesTime={usesTime}
                ></Task>
              )
            )}
        </AnimatePresence>
      </div>
      <CategoryChips
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        subCategoryFilter={subCategoryFilter}
        setSubCategoryFilter={setSubCategoryFilter}
      />
    </motion.div>
  );
};

export default TaskList;
