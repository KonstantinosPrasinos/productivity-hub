import styles from "./ToggleButton.module.scss";

const ToggleButton = ({isToggled, setIsToggled}) => {
  return <button className={`${styles.container} ${isToggled ? styles.active : ""}`} onClick={() => setIsToggled(prev => !prev)}></button>;
};

export default ToggleButton;
