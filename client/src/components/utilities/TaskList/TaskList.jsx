import { useContext } from "react";
import styles from "./TaskList.module.scss";
import { AnimatePresence, motion } from "framer-motion";
import Task from "@/components/indicators/Task/Task.jsx";
import Chip from "@/components/buttons/Chip/Chip";
import { TbEraser, TbPlus, TbSearch } from "react-icons/tb";
import Button from "@/components/buttons/Button/Button";
import { MiniPagesContext } from "@/context/MiniPagesContext";

import { useTaskList } from "./useTaskList";
import DesktopSearchBar from "./components/DesktopSearchBar";

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

/**
 * @param {Object} props
 * @param {any[]} props.categories
 * @param {any[]} props.subCategories
 * @param {any[]} props.categoryFilter
 * @param {Function} props.setCategoryFilter
 * @param {string} props.searchFilter
 * @param {Function} props.setSearchFilter
 * @param {boolean} props.showNonCurrentTasks
 * @param {Function} props.setShowNonCurrentTasks
 */
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

/**
 * @param {Object} props
 * @param {boolean} [props.isStandalone]
 * @param {string} props.searchFilter
 * @param {Function} props.setSearchFilter
 */
const SearchBar = ({ isStandalone = false, searchFilter, setSearchFilter }) => {
  const handleChange = (/** @type {{ target: { value: any; }; }} */ event) => {
    setSearchFilter(event.target.value);
  };

  return (
    <div
      className={`${styles.searchInput} ${isStandalone ? styles.standalone : ""
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

/**
 * @param {Object} props
 * @param {any[]} props.categoryFilter
 * @param {Function} props.setCategoryFilter
 * @param {any[]} props.categories
 * @param {any[]} props.subCategories
 * @param {Function} props.toggleVisibility
 * @param {string} props.searchFilter
 * @param {boolean} props.showNonCurrentTasks
 * @param {Function} props.setShowNonCurrentTasks
 */
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

/**
 * @param {Object} props
 * @param {any[]} [props.tasks]
 * @param {boolean} [props.usesTime]
 * @param {boolean} [props.showNonCurrentTasks]
 * @param {Function} [props.setShowNonCurrentTasks]
 */
const TaskList = ({
  tasks = [],
  usesTime = false,
  showNonCurrentTasks = false,
  setShowNonCurrentTasks = () => { },
}) => {
  const {
    filteredTasks,
    categories,
    subCategories,
    setCategoryFilter,
    setSearchFilter,
    toggleSearchVisibility,
    screenSize,
    searchScreenVisible,
    categoryFilter,
    searchQuery,
  } = useTaskList(tasks);

  return (
    <motion.div
      variants={variants}
      initial={"hidden"}
      animate={"visible"}
      exit={"exit"}
      className={styles.container}
    >
      {/* {screenSize === "small" && (
        <AnimatePresence>
          {searchScreenVisible && (
            <SearchScreen
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
              subCategories={subCategories}
              toggleVisibility={toggleSearchVisibility}
              searchFilter={searchQuery}
              showNonCurrentTasks={showNonCurrentTasks}
              setShowNonCurrentTasks={setShowNonCurrentTasks}
            />
          )}
        </AnimatePresence>
      )} */}
      <motion.div
        className={`Stack-Container ${styles.leftSide}`}
      >
        {screenSize !== "small" && (
          <DesktopSearchBar searchFilter={searchQuery} setSearchFilter={setSearchFilter} />
        )}
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
                    task?.tasks?.[0]?.group
                      ? `${task.tasks[0].category}-${task.tasks[0].group}`
                      : task?.tasks?.[0]?.category
                  }
                  tasks={task.tasks}
                  usesTime={usesTime}
                ></Task>
              ),
            )}
        </AnimatePresence>
      </motion.div>
      {/* {screenSize !== "small" && (
        <BigScreenFilters
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          subCategories={subCategories}
          showNonCurrentTasks={showNonCurrentTasks}
          searchFilter={searchQuery}
          setSearchFilter={setSearchFilter}
          setShowNonCurrentTasks={setShowNonCurrentTasks}
        />
      )} */}
    </motion.div>
  );
};

export default TaskList;
