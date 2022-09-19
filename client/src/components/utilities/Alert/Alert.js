import styles from "./Alert.module.scss";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertsContext } from "../../../context/AlertsContext";

const Alert = ({ type, message, id }) => {
  const alertsContext = useContext(AlertsContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("removing", id);
      alertsContext.dispatch({ type: "DELETE_ALERT", payload: id });
    }, 3000);
    return () => {
      clearTimeout(timer);
      console.log("unmount", id);
    };
  }, [id, alertsContext]);

  const displayIcon = () => {
    switch (type) {
      case "error":
      case "warning":
        return <ErrorIcon />;
      case "success":
        return <CheckCircleIcon />;
      case "info":
        return <InfoIcon />;
      default:
        break;
    }
  };

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
        {displayIcon()} {message}
      </div>
      <div
        className={styles.iconContainer}
        onClick={() =>
          alertsContext.dispatch({ type: "DELETE_ALERT", payload: id })
        }
      >
        <CloseIcon />
      </div>
    </motion.div>
  );
};

export default Alert;
