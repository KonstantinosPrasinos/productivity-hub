import styles from './TextButton.module.scss';
import {Link} from "react-router-dom";

const TextButton = ({children, type, to}) => {
    return (
        <Link to={to} className={`${styles.container} ${type ? styles[type] : ''}`}>
            {children}
        </Link>
    );
};

export default TextButton;
