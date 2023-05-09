import styles from "./Chip.module.scss";
import {motion} from "framer-motion"

const Chip = ({ children, value, selected, setSelected, type='select', onClick, style = 'squared', size, disabled}) => {
  return (
    <motion.div
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
      whileHover={!disabled ? {y: -1} : null}
    >
      {children}
    </motion.div>
  );
};

export default Chip;
