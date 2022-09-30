import styles from './IconButton.module.scss';

const IconButton = ({children, label, selected, onClick, border}) => {
    return (
        <button onClick={onClick} className={`${styles.container} ${selected !== null ? (selected ? styles.selected : styles.notSelected) : ''} ${border ? styles.border : ''}`}>
            {children}
            {label && <div className='Label'>{label}</div>}
        </button>
    );
};

export default IconButton;
