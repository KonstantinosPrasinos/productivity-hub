import styles from './IconButton.module.scss';

const IconButton = ({children, label, selected = null, onClick, border, color = 'inverse', disabled}) => {
    return (
        <button onClick={onClick} className={`
            ${styles.container}
            ${selected !== null ? (selected === true ? styles.selected : (selected === false ? styles.notSelected : '')) : ''}
            ${border ? styles.border : ''}
            ${styles[color]}`}
                disabled={disabled}
        >
            {children}
            {label && <div className='Label'>{label}</div>}
        </button>
    );
};

export default IconButton;
