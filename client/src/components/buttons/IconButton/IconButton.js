import styles from './IconButton.module.scss';

const IconButton = ({children}) => {
    return (
        <button className={styles.container}>
            {children}
        </button>
    );
};

export default IconButton;
