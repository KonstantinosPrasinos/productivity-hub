import React, { useContext, useMemo, useRef, useState } from "react";
import styles from "./TaskList.module.scss";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import Task from "@/components/indicators/Task/Task.jsx";
import Chip from "@/components/buttons/Chip/Chip";
import { useGetCategories } from "@/hooks/get-hooks/useGetCategories";
import { TbChevronCompactDown, TbPlus, TbSearch, TbX } from "react-icons/tb";
import Button from "@/components/buttons/Button/Button";
import { MiniPagesContext } from "@/context/MiniPagesContext";
import { useGetGroups } from "@/hooks/get-hooks/useGetGroups";
import IconButton from "@/components/buttons/IconButton/IconButton";
import { useScreenSize } from "@/hooks/useScreenSize";

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
  categories,
  subCategories,
  categoryFilter,
  setCategoryFilter,
  expandDirection = "vertical",
}) => {
  const miniPagesContext = useContext(MiniPagesContext);

  const toggleSelected = (category) => {
    if (
      categoryFilter
        .map((tempCategory) => tempCategory._id)
        .includes(category._id)
    ) {
      setCategoryFilter((current) =>
        current.filter((tempCategory) => tempCategory._id != category._id),
      );
    } else {
      setCategoryFilter((current) => [
        ...current,
        { ...category, selectedSubcategories: [] },
      ]);
    }
  };

  const toggleSubcategorySelected = (subcategory) => {
    const subcategoryParent = categoryFilter.find(
      (tempSubcategory) => tempSubcategory._id === subcategory.parent,
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
                    (tempSubcategory) =>
                      tempSubcategory._id !== subcategory._id,
                  ),
              },
        ),
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
              },
        ),
      );
    }
  };

  const handleContextMenu = (event, category) => {
    event.preventDefault();
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
}) => {
  const miniPagesContext = useContext(MiniPagesContext);

  const toggleNoCategory = () => {
    if (categoryFilter.find((category) => category._id === "-1")) {
      setCategoryFilter((current) =>
        current.filter((tempCategory) => tempCategory._id != "-1"),
      );
    } else {
      setCategoryFilter((current) => [
        ...current,
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
        placeholder="Search"
        value={searchFilter}
        onChange={handleChange}
      ></input>
    </div>
  );
};

const SearchScreen = ({
  searchExpanded,
  searchBarRef,
  categoryFilter,
  setCategoryFilter,
  categories,
  subCategories,
  toggleVisibility,
  searchFilter,
  setSearchFilter,
}) => {
  const miniPagesContext = useContext(MiniPagesContext);

  const toggleNoCategory = () => {
    if (categoryFilter.find((category) => category._id === "-1")) {
      setCategoryFilter((current) =>
        current.filter((tempCategory) => tempCategory._id != "-1"),
      );
    } else {
      setCategoryFilter((current) => [
        ...current,
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
    <motion.div
      className={`${styles.searchContainer} ${
        searchExpanded ? styles.isExpanded : ""
      }`}
      exit={{ opacity: 0 }}
    >
      <div ref={searchBarRef} className={styles.searchBar}>
        <SearchBar
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
        />
      </div>
      {searchExpanded && (
        <motion.div
          className={styles.searchScreenBody}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className={styles.filterContainer}>
            <div className={styles.filterLabel}>Categories:</div>
            <div className={styles.categoryFilters}>
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
              <CategoryChips
                categories={categories}
                subCategories={subCategories}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                expandDirection={"horizontal"}
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
          </div>
          <IconButton size="large" onClick={toggleVisibility}>
            <TbX />
          </IconButton>
        </motion.div>
      )}
    </motion.div>
  );
};

const maxDragDistance = 150;

const TaskList = ({ tasks = [], usesTime = false }) => {
  const [categoryFilter, setCategoryFilter] = useState([]);
  const { data: categories } = useGetCategories();
  const { data: subCategories } = useGetGroups();
  const leftRef = useRef();
  const dragStartPosition = useRef();
  const [searchBarRef, animateSearchBar] = useAnimate();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const { screenSize } = useScreenSize();
  const [searchFilter, setSearchFilter] = useState("");

  const filteredTasks = useMemo(() => {
    if (categoryFilter.length == 0 && searchFilter.length === 0) return tasks;

    return tasks.reduce((reducedTasks, currentTask) => {
      if (currentTask.hasOwnProperty("tasks")) {
        const matchesCategory =
          categoryFilter.length === 0 ||
          categoryFilter.find(
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

          if (searchFilter.length === 0) {
            taskFilteredBySearch = currentTask;
          } else {
            taskFilteredBySearch = {
              ...currentTask,
              tasks: currentTask.tasks.filter((tempTask) =>
                tempTask.title
                  .toLowerCase()
                  .includes(searchFilter.toLowerCase()),
              ),
            };
          }

          if (taskFilteredBySearch.tasks.length !== 0)
            reducedTasks.push(taskFilteredBySearch);
        }
      } else {
        // _id of -1 is for when the "no category" option is selected. Then show all tasks with no category
        const showNoCategory =
          categoryFilter.length === 0 ||
          categoryFilter.some((category) => category._id === "-1");

        const matchesSearch =
          searchFilter.length === 0 ||
          currentTask.title.toLowerCase().includes(searchFilter.toLowerCase());

        if (showNoCategory && matchesSearch) reducedTasks.push(currentTask);
      }

      return reducedTasks;
    }, []);
  }, [categoryFilter, tasks, searchFilter]);

  const handleTouchStart = (event) => {
    if (leftRef.current.scrollTop === 0) {
      dragStartPosition.current = event.touches[0].clientY;
    }
  };

  const handleTouchMove = (event) => {
    if (
      leftRef.current.scrollTop === 0 &&
      dragStartPosition.current &&
      event.touches[0].clientY > dragStartPosition.current
    ) {
      if (!searchVisible) {
        setSearchVisible(true);
      }

      if (
        searchBarRef.current &&
        !searchExpanded &&
        dragStartPosition.current
      ) {
        if (
          event.touches[0].clientY - dragStartPosition.current <
          maxDragDistance
        ) {
          const animationPercentage =
            (event.touches[0].clientY - dragStartPosition.current) /
            maxDragDistance;

          searchBarRef.current.style.opacity = animationPercentage / 2;
          searchBarRef.current.style.top = `${animationPercentage * 3 - 2}em`;
        } else {
          if (!searchExpanded) {
            setSearchExpanded(true);
            animateSearchBar(searchBarRef.current, {
              opacity: 1,
              top: "1em",
            });
          }
        }
      }
    }
  };

  const handleTouchEnd = () => {
    dragStartPosition.current = null;
    if (!searchExpanded && searchBarRef.current) {
      animateSearchBar(
        searchBarRef.current,
        {
          opacity: 0,
          top: "-2em",
        },
        {
          onComplete: () => toggleSearchVisibility(),
        },
      );
    }
  };

  const toggleSearchVisibility = () => {
    if (searchVisible) {
      setSearchVisible(false);
      setSearchExpanded(false);
    } else {
      setSearchVisible(true);
      setSearchExpanded(true);
    }
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
          {searchVisible && (
            <SearchScreen
              searchBarRef={searchBarRef}
              searchExpanded={searchExpanded}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
              subCategories={subCategories}
              toggleVisibility={toggleSearchVisibility}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
            />
          )}
        </AnimatePresence>
      )}
      <motion.div
        className={`Stack-Container ${styles.leftSide}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={leftRef}
      >
        {/*
                Animate Presence is needed here to set initial to true.
                Otherwise, the stagger doesn't work on list view because of the switch container.
            */}
        {screenSize === "small" && (
          <button
            className={styles.searchIndicatorBar}
            onClick={toggleSearchVisibility}
          >
            <TbSearch />
            <div className={styles.chevronContainer}>
              <TbChevronCompactDown />
            </div>
          </button>
        )}
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
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          subCategories={subCategories}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
        />
      )}
    </motion.div>
  );
};

export default TaskList;
