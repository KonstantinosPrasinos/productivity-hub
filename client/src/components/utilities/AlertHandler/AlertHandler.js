import { useContext, useEffect, useRef } from 'react';
import { AlertsContext } from '../../../context/AlertsContext';
import Alert from '../../etc/Alert/Alert';
import styles from './AlertHandler.module.scss';
import { AnimatePresence } from "framer-motion";

const AlertHandler = () => {
    const alertsContext = useContext(AlertsContext);
    const containerRef = useRef();

    const test = alertsContext.state.map((alert) => <Alert id={alert.id} message={alert.message} type={alert.type} />)

    useEffect(() => {
        // if (alertsContext.state.length > 0) {
        //     const alert = alertsContext.state[0];
        //     containerRef.current.appendChild(<Alert id={alert.id} message={alert.message} type={alert.type} />)
        // }
    }, [alertsContext]);

    return (<div className={styles.container}>
        <AnimatePresence>
            {test[0]}
        </AnimatePresence>
    </div>);
}
 
export default AlertHandler;