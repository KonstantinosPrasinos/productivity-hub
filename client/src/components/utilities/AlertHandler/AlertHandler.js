import { useContext } from 'react';
import { AlertsContext } from '../../../context/AlertsContext';
import Alert from '../Alert/Alert';
import styles from './AlertHandler.module.scss';
import { AnimatePresence } from "framer-motion";

const AlertHandler = () => {
    const alertsContext = useContext(AlertsContext);

    return (<div className={styles.container}>
        <AnimatePresence>
            {alertsContext.state.length > 0 && alertsContext.state.map((alert) => alertsContext.state[0].id === alert.id && <Alert key={alert.id} id={alert.id} message={alert.message} type={alert.type} />)}
        </AnimatePresence>
    </div>);
}
 
export default AlertHandler;