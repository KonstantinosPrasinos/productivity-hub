import React, { useContext, useMemo, useRef} from "react";
import styles from "./TaskList.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import Task from "@/components/indicators/Task/Task.jsx";
import Chip from "@/components/buttons/Chip/Chip";
import { useGetCategories } from "@/hooks/get-hooks/useGetCategories";
import { TbEraser, TbPlus, TbSearch} from "react-icons/tb";
import Button from "@/components/buttons/Button/Button";
import { MiniPagesContext } from "@/context/MiniPagesContext";
import { useGetGroups } from "@/hooks/get-hooks/useGetGroups";
import { useScreenSize } from "@/hooks/useScreenSize";
import { ComponentCommunicationContext } from "@/context/ComponentCommunicationContext.jsx";

const variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0
  },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8, marginTop: 20 },
  visible: { opacity: 1, y: 0, scale: 1, marginTop: 20 },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } },
};

const CategoryChips = ({
  categories,
  subCategories,
  categoryFilter,
  setCategoryFilter,
  expandDirection = "vertical",
  toggleSearchVisibility = () => {},
}) => {
  const miniPagesContext = useContext(MiniPagesContext);

  const toggleSelected = (category) => {
    if (
      categoryFilter
        .map((tempCategory) => tempCategory._id)
        .includes(category._id)
    ) {
      setCategoryFilter(
        categoryFilter.filter(
          (tempCategory) => tempCategory._id != category._id,
        ),
      );
    } else {
      setCategoryFilter([
        ...categoryFilter,
        { ...category, selectedSubcategories: [] },
      ]);
    }
  };

  const toggleSubcategorySelected = (subcategory) => {
    const subcategoryParent = categoryFilter.find(
      (tempSubcategory) => tempSubcategory._id === subcategory.parent,
    );

    if (subcategoryParent.selectedSubcategories.includes(subcategory)) {
      setCategoryFilter(
        categoryFilter.map((tempCategory) =>
          tempCategory._id != subcategoryParent._id
            ? tempCategory
            : {
                ...tempCategory,
                selectedSubcategories:
                  tempCategory.selectedSubcategories.filter(
                    (tempSubcategory) =>
                      tempSubcategory._id !== subcategory._id,
                  ),
              },
        ),
      );
    } else {
      setCategoryFilter(
        categoryFilter.map((tempCategory) =>
          tempCategory._id != subcategoryParent._id
            ? tempCategory
            : {
                ...tempCategory,
                selectedSubcategories: [
                  ...tempCategory.selectedSubcategories,
                  subcategory,
                ],
              },
        ),
      );
    }
  };

  const handleContextMenu = (event, category) => {
    event.preventDefault();
    toggleSearchVisibility();
    miniPagesContext.dispatch({
      type: "ADD_PAGE",
      payload: { type: "category-view", id: category._id },
    });
  };

  return (
    <>
      {categories.map((category) => {
        const categorySubcategories = subCategories.filter(
          (subCategory) => subCategory.parent === category._id,
        );

        return (
          <div
            key={category._id}
            className={
              expandDirection === "vertical"
                ? ""
                : styles.categoryChipsContainer
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
              hasShadow={expandDirection === "vertical"}
              onContextMenu={(event) => handleContextMenu(event, category)}
            >
              <div className={styles.categoryContents}>
                <div
                  className={`${styles.categoryChipColor} ${category.color}`}
                ></div>
                <span>{category.title}</span>
              </div>
            </Chip>
            <AnimatePresence>
              {expandDirection !== "vertical" &&
                categorySubcategories.length > 0 &&
                categoryFilter
                  .map((tempCategory) => tempCategory._id)
                  .includes(category._id) && (
                  <motion.div
                    exit={{ opacity: 0 }}
                    className={styles.divider}
                  ></motion.div>
                )}
            </AnimatePresence>
            <div
              className={
                expandDirection === "vertical"
                  ? styles.subcategoryChipsHidden
                  : styles.subcategoryChips
              }
            >
              <AnimatePresence>
                {categoryFilter
                  .map((tempCategory) => tempCategory._id)
                  .includes(category._id) &&
                  categorySubcategories.map((subCategory) => (
                    <motion.div
                      key={subCategory._id}
                      className={`${styles.subCategoryContainer} ${
                        expandDirection === "vertical"
                          ? styles.subCategoryContainerVertical
                          : ""
                      }`}
                      initial={{
                        height: expandDirection === "vertical" ? 0 : "auto",
                        marginTop: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        marginTop: expandDirection === "vertical" ? 10 : 0,
                        opacity: 1,
                      }}
                      transition={{ duration: 0.2 }}
                      exit={{
                        height: expandDirection === "vertical" ? 0 : "auto",
                        marginTop: 0,
                        overflow:
                          expandDirection === "vertical" ? "hidden" : null,
                        opacity: 0,
                      }}
                    >
                      <Chip
                        value={subCategory}
                        selected={
                          categoryFilter
                            .find(
                              (tempCategory) =>
                                tempCategory._id === category._id,
                            )
                            .selectedSubcategories.includes(subCategory)
                            ? subCategory
                            : null
                        }
                        size={"small"}
                        hasShadow={expandDirection === "vertical"}
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
          </div>
        );
      })}
    </>
  );
};

const BigScreenFilters = ({
                            categories,
                            subCategories,
                            categoryFilter,
                            setCategoryFilter,
                            searchFilter,
                            setSearchFilter,
                            showNonCurrentTasks,
                            setShowNonCurrentTasks,
                          }) => {
  const miniPagesContext = useContext(MiniPagesContext);

  const toggleNoCategory = () => {
    if (categoryFilter.find((category) => category._id === "-1")) {
      setCategoryFilter(
          categoryFilter.filter((tempCategory) => tempCategory._id != "-1"),
      );
    } else {
      setCategoryFilter([
        ...categoryFilter,
        { _id: "-1", selectedSubcategories: [] },
      ]);
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
          <SearchBar
              isStandalone={true}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
          />
          <div className={styles.filterChip}>
            <Chip
              value={true}
              hasShadow={true}
              size={"small"}
              selected={showNonCurrentTasks}
              setSelected={() => setShowNonCurrentTasks(!showNonCurrentTasks)}
            >
              Show non-current tasks
            </Chip>
          </div>
          <Chip
              value={-1}
              setSelected={() => toggleNoCategory()}
              selected={
                categoryFilter.find((category) => category._id === "-1") ? -1 : null
              }
              hasShadow={true}
              size={"small"}
          >
            No category
          </Chip>
          <div className={styles.filterLabel}>Categories:</div>
          <CategoryChips
              categories={categories}
              subCategories={subCategories}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
          />
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

const SearchBar = ({ isStandalone = false, searchFilter, setSearchFilter }) => {
  const handleChange = (event) => {
    setSearchFilter(event.target.value);
  };

  return (
    <div
      className={`${styles.searchInput} ${
        isStandalone ? styles.standalone : ""
      }`}
    >
      <TbSearch />
      <input
        className={styles.searchTextInput}
        placeholder="Search"
        value={searchFilter}
        onChange={handleChange}
      ></input>
      {isStandalone && (
        <button
          className={styles.searchEraser}
          onClick={() => setSearchFilter("")}
        >
          <TbEraser />
        </button>
      )}
    </div>
  );
};

const SearchScreen = ({
  categoryFilter,
  setCategoryFilter,
  categories,
  subCategories,
  toggleVisibility,
  searchFilter,
  showNonCurrentTasks,
  setShowNonCurrentTasks,
}) => {
  const miniPagesContext = useContext(MiniPagesContext);

  const toggleNoCategory = () => {
    if (categoryFilter.find((category) => category._id === "-1")) {
      setCategoryFilter(
        categoryFilter.filter((tempCategory) => tempCategory._id != "-1"),
      );
    } else {
      setCategoryFilter([
        ...categoryFilter,
        { _id: "-1", selectedSubcategories: [] },
      ]);
    }
  };

  const handleNewClick = () => {
    toggleVisibility();
    miniPagesContext.dispatch({
      type: "ADD_PAGE",
      payload: { type: "new-category" },
    });
  };
  return (
    <>
      {searchFilter.length === 0 && (
        <motion.div
          className={`${styles.searchContainer} ${searchFilter.length !== 0 ? styles.searching : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={styles.categoryFilters}>
            <div className={styles.filterLabel}>Filters:</div>
            <Chip
              value={true}
              size={"small"}
              selected={showNonCurrentTasks}
              setSelected={() => setShowNonCurrentTasks(!showNonCurrentTasks)}
            >
              Show non-current tasks
            </Chip>
            <Chip
              value={-1}
              setSelected={() => toggleNoCategory()}
              selected={
                categoryFilter.find((category) => category._id === "-1")
                  ? -1
                  : null
              }
              size={"small"}
            >
              No category
            </Chip>
            <div className={styles.filterLabel}>Categories:</div>
            <CategoryChips
              categories={categories}
              subCategories={subCategories}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              expandDirection={"horizontal"}
              toggleSearchVisibility={toggleVisibility}
            />
            <Button
              onClick={handleNewClick}
              filled={false}
              type={"square"}
              size="small"
            >
              <span className="Horizontal-Flex-Container">
                Add new
                <TbPlus />
              </span>
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
};

const TaskList = ({
  tasks = [],
  usesTime = false,
  showNonCurrentTasks = false,
  setShowNonCurrentTasks = () => {},
}) => {
  const { data: categories } = useGetCategories();
  const { data: subCategories } = useGetGroups();
  const leftRef = useRef();
  const { screenSize } = useScreenSize();

  const componentCommunicationContext = useContext(
    ComponentCommunicationContext,
  );

  const setSearchFilter = (value) => {
    componentCommunicationContext.dispatch({
      type: "SET_SEARCH_QUERY",
      payload: value,
    });
  }

  const setCategoryFilter = (value) => {
    componentCommunicationContext.dispatch({
      type: "SET_TASK_FILTERS",
      payload: value,
    });
  };

  const filteredTasks = useMemo(() => {
    if (
      componentCommunicationContext.state.filters.length == 0 &&
      componentCommunicationContext.state.searchQuery.length === 0
    )
      return tasks;

    return tasks.reduce((reducedTasks, currentTask) => {
      if (currentTask.hasOwnProperty("tasks")) {
        const matchesCategory =
          componentCommunicationContext.state.filters.length === 0 ||
          componentCommunicationContext.state.filters.find(
            (tempFilter) => tempFilter._id === currentTask.tasks[0].category,
          );

        const matchesSubcategory =
          matchesCategory === true ||
          matchesCategory?.selectedSubcategories?.length === 0 ||
          matchesCategory?.selectedSubcategories
            .map((tempFilter) => tempFilter._id)
            .includes(currentTask.tasks[0].group);

        if (matchesSubcategory && matchesCategory) {
          let taskFilteredBySearch;

          if (componentCommunicationContext.state.searchQuery.length === 0) {
            taskFilteredBySearch = currentTask;
          } else {
            taskFilteredBySearch = {
              ...currentTask,
              tasks: currentTask.tasks.filter((tempTask) =>
                tempTask.title
                  .toLowerCase()
                  .includes(componentCommunicationContext.state.searchQuery.toLowerCase()),
              ),
            };
          }

          if (taskFilteredBySearch.tasks.length !== 0)
            reducedTasks.push(taskFilteredBySearch);
        }
      } else {
        // _id of -1 is for when the "no category" option is selected. Then show all tasks with no category
        const showNoCategory =
          componentCommunicationContext.state.filters.length === 0 ||
          componentCommunicationContext.state.filters.some(
            (category) => category._id === "-1",
          );

        const matchesSearch =
          componentCommunicationContext.state.searchQuery.length === 0 ||
          currentTask.title.toLowerCase().includes(componentCommunicationContext.state.searchQuery.toLowerCase());

        if (showNoCategory && matchesSearch) reducedTasks.push(currentTask);
      }

      return reducedTasks;
    }, []);
  }, [componentCommunicationContext.state.filters, tasks, componentCommunicationContext.state.searchQuery]);

  const toggleSearchVisibility = () => {
    componentCommunicationContext.dispatch({
      type: "SET_SEARCH_SCREEN_VISIBLE",
      payload: !componentCommunicationContext.state.searchScreenVisible,
    });
  };

  return (
    <motion.div
      variants={variants}
      initial={"hidden"}
      animate={"visible"}
      exit={"exit"}
      className={styles.container}
    >
      {screenSize === "small" && (
        <AnimatePresence>
          {componentCommunicationContext.state.searchScreenVisible && (
            <SearchScreen
              categoryFilter={componentCommunicationContext.state.filters}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
              subCategories={subCategories}
              toggleVisibility={toggleSearchVisibility}
              searchFilter={componentCommunicationContext.state.searchQuery}
              showNonCurrentTasks={showNonCurrentTasks}
              setShowNonCurrentTasks={setShowNonCurrentTasks}
            />
          )}
        </AnimatePresence>
      )}
      <motion.div
        className={`Stack-Container ${styles.leftSide}`}
        ref={leftRef}
      >
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
                  key={
                    task.tasks[0].group
                      ? `${task.tasks[0].category}-${task.tasks[0].group}`
                      : task.tasks[0].category
                  }
                  tasks={task.tasks}
                  usesTime={usesTime}
                ></Task>
              ),
            )}
        </AnimatePresence>
      </motion.div>
      {screenSize !== "small" && (
        <BigScreenFilters
          categoryFilter={componentCommunicationContext.state.filters}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          subCategories={subCategories}
          showNonCurrentTasks={showNonCurrentTasks}
          searchFilter={componentCommunicationContext.state.searchQuery}
          setSearchFilter={setSearchFilter}
          setShowNonCurrentTasks={setShowNonCurrentTasks}
        />
      )}
    </motion.div>
  );
};

export default TaskList;
