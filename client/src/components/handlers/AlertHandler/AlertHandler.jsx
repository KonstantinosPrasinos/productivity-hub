import { useContext } from 'react';
import { AlertsContext } from '../../../context/AlertsContext';
import Alert from '../../utilities/Alert/Alert';
import styles from './AlertHandler.module.scss';

const AlertHandler = () => {
    const alertsContext = useContext(AlertsContext);

    return (<div className={styles.container}>
        {alertsContext.state.length > 0 && alertsContext.state.map((alert) => alertsContext.state[0].id === alert.id && <Alert key={alert.id} id={alert.id} message={alert.message} type={alert.type} />)}
    </div>);
}
 
export default AlertHandler;