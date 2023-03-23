import styles from './TextButton.module.scss';

const TextButton = ({children, onClick}) => {
    return (
        <button className={styles.container} onClick={onClick}>
            {children}
        </button>
    );
};

export default TextButton;
