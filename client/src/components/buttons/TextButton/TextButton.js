import styles from './TextButton.module.scss';

const TextButton = ({children, onClick}) => {
    return (
        <button className={`Button ${styles.container}`} onClick={onClick}>
            {children}
        </button>
    );
};

export default TextButton;
