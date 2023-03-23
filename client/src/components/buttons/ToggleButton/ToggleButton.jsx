import { useState } from "react";
import styles from "./ToggleButton.module.scss";

const ToggleButton = ({isToggled, setIsToggled}) => {
  return <div className={`${styles.container} ${isToggled ? styles.active : ""}`} onClick={() => setIsToggled(prev => !prev)}></div>;
};

export default ToggleButton;
