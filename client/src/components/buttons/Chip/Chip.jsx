import styles from "./Chip.module.scss";

const Chip = ({ children, value, selected, setSelected, type='select', onClick, style = 'squared', size, disabled}) => {
  return (
    <button
      className={`Button ${styles[style]} ${styles.container} ${type === 'select' && value === selected ? styles.filled : ""} ${type === 'icon'} ${styles[size]} ${disabled ? styles.disabled : ''}`}
      onClick={(e) => {
          if (!disabled) {
              switch (type) {
                  case 'select':
                      setSelected(value);
                      break;
                  case 'icon':
                      onClick(e);
                      break;
              }
          }
      }}
    >
      {children}
    </button>
  );
};

export default Chip;
