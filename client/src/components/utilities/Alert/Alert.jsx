import styles from "./Alert.module.scss";
import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertsContext } from "../../../context/AlertsContext";
import { TbAlertCircle, TbX } from "react-icons/tb";

const Alert = ({ type, message, id }) => {
  const alertsContext = useContext(AlertsContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      alertsContext.dispatch({ type: "DELETE_ALERT", payload: id });
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [id, alertsContext]);

  const variants = {
    enter: {
      scaleY: 1,
      transition: { delay: 0.15, duration: 0.15 },
    },
    exit: {
      scaleY: 0,
      transition: { duration: 0.15 },
    },
  };

  return (
    <motion.div
      className={`${styles.container} ${styles[type]}`}
      variants={variants}
      animate="enter"
      exit="exit"
      initial={{ scaleY: 0 }}
      transition={{ duration: 0.15, delay: 0.15 }}
    >
      <div className={styles.textContainer}>
        <TbAlertCircle /> {message}
      </div>
      <div
        className={styles.iconContainer}
        onClick={() =>
          alertsContext.dispatch({ type: "DELETE_ALERT", payload: id })
        }
      >
        <TbX />
      </div>
    </motion.div>
  );
};

export default Alert;
