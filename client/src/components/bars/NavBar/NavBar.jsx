import React, {useCallback, useContext, useEffect, useState} from "react";

import styles from "./NavBar.module.scss";
import {TbHome, TbPlus, TbSearch, TbSettings, TbZoomCheck} from "react-icons/tb";
import { useLocation, useNavigate } from "react-router-dom";
import { MiniPagesContext } from "../../../context/MiniPagesContext";
import {AnimatePresence, motion} from "framer-motion";
import { useScreenSize } from "@/hooks/useScreenSize";
import { ComponentCommunicationContext } from "@/context/ComponentCommunicationContext.jsx";

const desktopVariants = {
  initial: {
    x : "-3em",
    scale: 0,
  },
  animate: {
    x: 0,
    scale: 1,
  },
};

const mobileVariants = {
  initial: {
    y : "3em",
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

const NavigationButton = ({onClick = () => {}, selected = false, children}) => {
  return <button className={`${styles.navButton} ${selected ? styles.selected : ""}`} onClick={onClick}>
    {children}
  </button>
}

const NavBar = () => {
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
    console.log(selected)
  }, [selected]);

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
      transition={{duration: 0.4, type: "spring"}}
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
            animate={{scale: 1}}
            exit={{scale: 0}}
        >
          <NavigationButton
              onClick={() => handleNavigation("/home")}
              selected={selected === "home"}
          >
            <TbHome/>
          </NavigationButton>
        </motion.div>}
        {screenSize === "small" && (
            <div className={styles.item}>
              <NavigationButton
                  onClick={handleSearchClick}
                  selected={selected === "search"}
              >
                {componentCommunicationContext.state.searchQuery !== "" || componentCommunicationContext.state.filters.length > 0 ? <TbZoomCheck /> : <TbSearch/>}
              </NavigationButton>
            </div>
        )}
        {
          selected === "search" && <div className={styles.searchBar} key={"search-bar"}>
              <motion.input
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
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
            animate={{scale: 1}}
            exit={{scale: 0}}
        >
          <NavigationButton
              onClick={() => handleNavigation("/settings")}
              selected={selected === "settings"}
          >
            <TbSettings/>
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
