import styles from "./Alert.module.scss";
import {useContext, useEffect, useRef, useState} from "react";
import {motion, useAnimation} from "framer-motion";
import { AlertsContext } from "../../../context/AlertsContext";
import { TbX } from "react-icons/tb";
import IconButton from "@/components/buttons/IconButton/IconButton.jsx";

const Alert = ({ type, message, title = "This is a title", id }) => {
  const alertsContext = useContext(AlertsContext);
  const timer = useRef();
  const timerStartTimestamp = useRef();
  const timerRemainingTime = useRef(2500);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Automatically clear after 2 seconds
    timerStartTimestamp.current = (new Date()).getTime();
    timer.current = setTimeout(() => {
      controls.start("hidden")
    }, 2500);

    controls.start("visible");

    // Remove timeout on component unmount
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [id, alertsContext]);

  const controls = useAnimation();

  const variants = {
    visible: { y: 0 },
    hidden: { y: -100 }
  }

  const handleDragEnd = (event, info) => {
    if (info.velocity.y < -100) {
      controls.start("hidden");
    }
  }

  const handleAnimationComplete = (variant) => {
    if (variant === "hidden") {
      alertsContext.dispatch({ type: "DELETE_ALERT", payload: id });
    }
  }

  const handleCloseClick = () => {
    controls.start("hidden");
  }

  const handleMouseEnter = () => {
    if (timer.current && timerStartTimestamp.current) {
      setIsPaused(true);
      timerRemainingTime.current = timerRemainingTime.current - ((new Date()).getTime() - timerStartTimestamp.current);
      timerStartTimestamp.current = null;
      clearTimeout(timer.current);
    }
  }

  const handleMouseLeave = () => {
    setIsPaused(false);
    timer.current = setTimeout(() => {
      controls.start("hidden");
    }, timerRemainingTime.current);
    timerStartTimestamp.current = (new Date()).getTime();
  }

  return (
    <motion.div
      className={`${styles.container}`}

      animate={controls}
      initial={"hidden"}
      variants={variants}
      onAnimationComplete={handleAnimationComplete}

      drag={"y"}
      dragConstraints={{top: 0, bottom: 0}}
      onDragEnd={handleDragEnd}
      dragMomentum={true}
      dragElastic={{top: 0.5, bottom: 0.2}}

      onMouseOver={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`${styles.typeIndicator} ${styles[type]}`}></div>
      <div className={styles.textContainer}>
        <span className={"Title-Small"}>{title}</span>
        <span className={"Body-Small"}>{message}</span>
        <div className={styles.timerContainer}>
          <div className={`${styles.timerIndicator} ${isPaused ? styles.paused : ""} ${styles[type]}`}></div>
        </div>
      </div>
      <div className={styles.iconContainer}>
        <IconButton onClick={handleCloseClick}>
          <TbX />
        </IconButton>
      </div>
    </motion.div>
  );
};

export default Alert;
