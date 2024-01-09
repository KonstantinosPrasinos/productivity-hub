import styles from './IconButton.module.scss';

const IconButton = ({children, label, selected = null, onClick, border, color = 'inherit', disabled, onContextMenu}) => {
    return (
        <button
            onClick={onClick}
            onContextMenu={onContextMenu}
            className={`
                ${styles.container}
                ${selected !== null ? (selected === true ? styles.selected : (selected === false ? styles.notSelected : '')) : ''}
                ${border ? styles.border : ''}
                ${styles[color]}
            `}
            disabled={disabled}
        >
            <div className={styles.icon}>{children}</div>
            {label && <div className='Label'>{label}</div>}
        </button>
    );
};

export default IconButton;
