import { useState } from "react";
import styles from "./ToggleButton.module.scss";

const ToggleButton = () => {
    const [active, setActive] = useState(false)
  return <div className={`${styles.container} ${active ? styles.active : ""}`} onClick={() => setActive(prev => !prev)}></div>;
};

export default ToggleButton;
