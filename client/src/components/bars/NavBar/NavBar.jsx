import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import styles from "./NavBar.module.scss";
import { TbChevronDown, TbChevronUp, TbHome, TbInbox, TbPlus, TbPoint, TbRepeat, TbSearch, TbSettings, TbZoomCheck } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router-dom";
import { MiniPagesContext } from "../../../context/MiniPagesContext";
import { AnimatePresence, motion } from "framer-motion";
import { useScreenSize } from "@/hooks/useScreenSize";
import { ComponentCommunicationContext } from "@/context/ComponentCommunicationContext";
import { useGetCategories } from "@/hooks/get-hooks/useGetCategories";
import { useGetGroups } from "@/hooks/get-hooks/useGetGroups";

const desktopVariants = {
  initial: {
    x: "-3em",
    scale: 0,
  },
  animate: {
    x: 0,
    scale: 1,
  },
};

const mobileVariants = {
  initial: {
    y: "3em",
    scale: 0,
  },
  animate: {
    y: 0,
    scale: 1,
  },
};

const navBarDesktopVariants = {
  initial: {
    width: "auto",
    gap: "50px"
  },
  search: {
    width: "auto",
    gap: "50px"
  },
}

const navBarVariants = {
  initial: {
    width: 132,
    gap: "30px"
  },
  search: {
    width: "calc(100% - 110px)",
    gap: "10px"
  }
};

const addButtonVariants = {
  initial: {
    rotate: 0,
    borderRadius: "10px"
  },
  search: {
    rotate: 45,
    borderRadius: "50%",
  }
}

const NavigationButton = ({ onClick = () => { }, selected = false, children }) => {
  return <button className={`${styles.navButton} ${selected ? styles.selected : ""}`} onClick={onClick}>
    {children}
  </button>
}

/**
 * @param {{
 *   categoryClicked?: () => void,
 *   selected: boolean | any,
 *   category: any,
 *   subCategories?: any[],
 *   subCategoryClicked?: (subCategory: any) => void
 * }} props
 */
const CategoryButton = ({ categoryClicked = () => { }, selected, category, subCategories = [], subCategoryClicked = (subCategory) => { } }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = (event) => {
    event.stopPropagation();
    setExpanded(!expanded);
  }

  const subCategoryVariants = useMemo(() => ({
    open: { opacity: 1, height: "auto" },
    collapsed: { opacity: 0, height: 0 }
  }), []);

  return <motion.div layout className={`${styles.categoryContainer} ${selected && (selected?.selectedSubcategories.length === 0 || selected?.selectedSubcategories.length === subCategories.length) ? styles.categorySelected : ""}`} key={category._id}>
    <div className={styles.categoryButton} onClick={categoryClicked}>
      <span className={`${styles.categoryDot} ${category.color}`} ></span>
      <span className={styles.categoryTitle}>{category.title}</span>
      <div className={styles.spacer}></div>
      {subCategories.length > 0 && <button className={styles.categoryIcon} onClick={toggleExpanded}>{expanded ? <TbChevronUp /> : <TbChevronDown />}</button>}
    </div>
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          key="content"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={subCategoryVariants}
          style={{ overflow: "hidden" }}
        >
          {subCategories.map((subCategory) => (
            <button key={subCategory._id} className={`${styles.subCategoryButton} ${selected && selected?.selectedSubcategories.includes(subCategory) ? styles.categorySelected : ""}`} onClick={() => subCategoryClicked(subCategory)}>
              <span className={styles.subCategoryIcon}>{subCategory?.repeatRate?.startingDate.length > 0 ? <TbRepeat /> : <TbPoint />}</span>
              <span className={styles.subCategoryTitle}>{subCategory.title}</span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
}

const NavBar = () => {
  const { screenSize } = useScreenSize();
  const miniPagesContext = useContext(MiniPagesContext);
  const componentCommunicationContext = useContext(
    ComponentCommunicationContext,
  );

  const { data: categories } = useGetCategories();
  const { data: subCategories } = useGetGroups();

  const toggleAllSelected = () => {
    const filters = componentCommunicationContext.state.filters;

    if (filters.length === 0) {
      return;
    }

    filters.splice(0, filters.length);

    componentCommunicationContext.dispatch({
      type: "SET_TASK_FILTERS",
      payload: filters,
    });
  }

  const toggleSelectedCategory = (category) => {
    const filters = componentCommunicationContext.state.filters;

    const filterIndex = filters.findIndex((filter) => filter._id === category._id);

    if (filterIndex === -1) {
      filters.push({ ...category, selectedSubcategories: [] });
    } else {
      filters.splice(filterIndex, 1);
    }

    componentCommunicationContext.dispatch({
      type: "SET_TASK_FILTERS",
      payload: filters,
    });
  };

  const toggleSelectedSubCategory = (subCategory) => {
    const filters = componentCommunicationContext.state.filters;

    const categoryFilterIndex = filters.findIndex((filter) => filter._id === subCategory.parent);

    if (categoryFilterIndex === -1) {
      const category = categories.find((category) => category._id === subCategory.parent);
      filters.push({ ...category, selectedSubcategories: [subCategory] });
    } else {
      const subCategoryIndex = filters[categoryFilterIndex].selectedSubcategories.findIndex((s) => s._id === subCategory._id);

      if (subCategoryIndex === -1) {
        filters[categoryFilterIndex].selectedSubcategories.push(subCategory);
      } else {
        filters[categoryFilterIndex].selectedSubcategories.splice(subCategoryIndex, 1);
      }
    }

    componentCommunicationContext.dispatch({
      type: "SET_TASK_FILTERS",
      payload: filters,
    });
  }

  const settingsClicked = () => {
    // TODO: create settings minipage
  }

  return <div className={styles.container}>
    <button onClick={toggleAllSelected} className={`${styles.allSelected} ${componentCommunicationContext.state.filters.length === 0 ? styles.categorySelected : ""}`}>
      <span><TbInbox /></span>
      <span>All</span>
    </button>
    <div className={styles.divider}></div>
    <div className={styles.categoriesContainer}>
      {categories?.map((category) => (
        <CategoryButton
          key={category._id}
          category={category}
          categoryClicked={() => toggleSelectedCategory(category)}
          selected={componentCommunicationContext.state.filters.find((filter) => filter._id === category._id)}
          subCategories={subCategories?.filter((subCategory) => subCategory.parent === category._id)}
          subCategoryClicked={(subCategory) => toggleSelectedSubCategory(subCategory)}
        />
      ))}
    </div>
    <div className={styles.spacer}></div>
    <div className={styles.settingsContainer}>
      <motion.button
        onClick={settingsClicked}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 1.0 }}
        className={styles.settingsButton}
      ><TbSettings /></motion.button>
    </div>
  </div>
}

const OldNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { screenSize } = useScreenSize();

  const miniPagesContext = useContext(MiniPagesContext);
  const componentCommunicationContext = useContext(
    ComponentCommunicationContext,
  );

  const [selected, setSelected] = useState(null);

  const handleNavigation = useCallback((route) => {
    setSelected(route.substring(1));
    navigate(route, { replace: true })
  }, [navigate]);

  const handleSearchClick = useCallback(() => {
    if (selected !== "home") {
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 200) // todo fix the lag of tasklist and remove this timout
    }

    setSelected("search");

    componentCommunicationContext.dispatch({
      type: "SET_SEARCH_SCREEN_VISIBLE",
      payload: true,
    })
  }, [componentCommunicationContext, selected]);

  const handleCreateClick = useCallback(() => {
    if (selected === "search") {
      // When the search bar is open the add button acts like the close button
      setSelected("home");
      componentCommunicationContext.dispatch({
        type: "SET_SEARCH_SCREEN_VISIBLE",
        payload: false,
      })
    } else {
      miniPagesContext.dispatch({
        type: "ADD_PAGE",
        payload: { type: "new-task" },
      })
    }
  }, [selected]);

  const handleChange = useCallback((input) => {
    componentCommunicationContext.dispatch({
      type: "SET_SEARCH_QUERY",
      payload: input.target.value,
    })
  }, [componentCommunicationContext]);

  useEffect(() => {
    if (selected === "search") return;
    switch (location.pathname) {
      case "/":
      case "/home":
        setSelected("home");
        break;
      case "/list":
        setSelected("list");
        break;
      case "/settings":
        setSelected("settings");
        break;
      default:
        break;
    }
  }, [location]);



  return <motion.div
    className={styles.newContainer}
    transition={{ duration: 0.4, type: "spring" }}
    initial={"initial"}
    animate={"animate"}
    variants={screenSize === "small" ? mobileVariants : desktopVariants}
  >
    <motion.div
      className={styles.newNavBar}
      animate={selected === "search" ? "search" : "initial"}
      variants={screenSize === "small" ? navBarVariants : navBarDesktopVariants}
    >
      <AnimatePresence mode={"popLayout"}>
        {selected !== "search" && <motion.div
          className={styles.item}
          key={"home-button"}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <NavigationButton
            onClick={() => handleNavigation("/home")}
            selected={selected === "home"}
          >
            <TbHome />
          </NavigationButton>
        </motion.div>}
        {screenSize === "small" && (
          <div className={styles.item}>
            <NavigationButton
              onClick={handleSearchClick}
              selected={selected === "search"}
            >
              {componentCommunicationContext.state.searchQuery !== "" || componentCommunicationContext.state.filters.length > 0 ? <TbZoomCheck /> : <TbSearch />}
            </NavigationButton>
          </div>
        )}
        {
          selected === "search" && <div className={styles.searchBar} key={"search-bar"}>
            <motion.input
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.searchInput}
              placeholder="Search"
              onChange={handleChange}
              value={componentCommunicationContext.state.searchQuery}
            ></motion.input>
          </div>
        }
        {selected !== "search" && <motion.div
          className={styles.item}
          key={"settings-button"}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <NavigationButton
            onClick={() => handleNavigation("/settings")}
            selected={selected === "settings"}
          >
            <TbSettings />
          </NavigationButton>
        </motion.div>}
      </AnimatePresence>
    </motion.div>
    <motion.button
      className={styles.createButton}
      onClick={handleCreateClick}
      animate={selected === "search" ? "search" : "initial"}
      variants={addButtonVariants}
    >
      <TbPlus />
    </motion.button>
  </motion.div>
};

export default NavBar;
