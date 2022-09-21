import styles from './IconButton.module.scss';

const IconButton = ({children, label, selected, onClick}) => {
    return (
        <button onClick={onClick} className={`${styles.container} ${selected !== null ? (selected ? styles.selected : styles.notSelected) : ''}`}>
            {children}
            {label && <div className='Label'>{label}</div>}
        </button>
    );
};

export default IconButton;
