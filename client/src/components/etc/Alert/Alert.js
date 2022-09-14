import styles from "./Alert.module.scss";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertsContext } from "../../../context/AlertsContext";

const Alert = ({ type, message, id }) => {

    const alertsContext = useContext(AlertsContext);

    const deleteAlert = () => {
        alertsContext.dispatch({type: "DELETE_ALERT", payload: id});
    }

    useEffect(() => {
        console.log(id)
        const timer = setTimeout(deleteAlert, 3000);
        return () => clearTimeout(timer);
    }, [id]);

    const displayIcon = () => {
        switch (type) {
            case "error":
            case "warning":
                return <ErrorIcon />
            case "success":
                return <CheckCircleIcon />
            case "info":
                return <InfoIcon />
            default:
                break;
        }
    }
  return (
    <motion.div className={`${styles.container} ${styles[type]}`} exit={{scaleY: 0}} transition={{duration: 0.15}}>
        <div className={styles.textContainer}> {displayIcon()} {message} </div>
      <div className={styles.iconContainer} onClick={deleteAlert}>
        <CloseIcon />
      </div>
    </motion.div>
  );
};

export default Alert;
