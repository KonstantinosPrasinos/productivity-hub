import styles from "./ToggleButton.module.scss";

const ToggleButton = ({ isToggled, setIsToggled, disabled = false }) => {
  return (
    <button
      disabled={disabled}
      className={`${styles.container} ${isToggled ? styles.active : ""}`}
      onClick={() => setIsToggled((prev) => !prev)}
    ></button>
  );
};

export default ToggleButton;
