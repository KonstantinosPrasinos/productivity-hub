import styles from "./Chip.module.scss";

const Chip = ({ children, value, selected, setSelected, type='select', onClick, style = 'squared', size }) => {
  return (
    <div
      className={`Button ${styles[style]} ${styles.container} ${type === 'select' && value === selected ? styles.filled : ""} ${type === 'icon'} ${styles[size]}`}
      onClick={(e) => {
          switch (type) {
              case 'select':
                  setSelected(value);
                  return;
              case 'icon':
                  onClick(e);
                  return;
          }
      }}
    >
      {children}
    </div>
  );
};

export default Chip;
