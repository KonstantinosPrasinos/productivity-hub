import styles from "./Chip.module.scss";

const Chip = ({ children, index, selected, setSelected }) => {
  return (
    <div
      className={`Button ${styles.container} ${
        index === selected ? styles.selected : ""
      }`}
      onClick={() => setSelected(index)}
    >
      {children}
    </div>
  );
};

export default Chip;
