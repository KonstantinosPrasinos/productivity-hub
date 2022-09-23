import styles from "./Chip.module.scss";

const Chip = ({ children, value, selected, setSelected }) => {
  return (
    <div
      className={`Button ${styles.container} ${
        value === selected ? styles.selected : ""
      }`}
      onClick={() => setSelected(value)}
    >
      {children}
    </div>
  );
};

export default Chip;
