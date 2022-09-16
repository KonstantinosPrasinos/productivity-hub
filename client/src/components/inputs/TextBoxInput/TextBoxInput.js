import styles from "./TextBoxInput.module.scss";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useState } from "react";

const TextBoxInput = ({ placeholder = "placeholder", type = "text", icon }) => {
    const [text, setText] = useState(null)

    const handleChange = (event) => {
        if (type === 'number') {
            if (isNaN(event.target.value)) {
                return;
            }
        }
        setText(event.target.value)
    }

    const checkIfNull = () => {
        if (text === null) {
            setText(0);
        }
    }

    const increment = () => {
        checkIfNull();
        setText(current => current + 1);
    }

    const decrement = () => {
        checkIfNull();
        setText(current => current - 1);
    }

  return (
    <div
      className={`${styles.container} Horizontal-Flex-Container Rounded-Container`}
    >
      {icon !== null && <>{icon}</>}
      <span className={styles.inputWrapper}><input type="text" className={styles.input} placeholder={placeholder} value={text !== null ? text : ""} onChange={handleChange} /></span>
      {type === "number" && (
        <div className={styles.buttonsContainer}>
          <button className={`${styles.button} ${styles.buttonUp}`} onClick={increment}><ArrowDropUpIcon sx={{position: "absolute", top: "-0.25em", left: "-0.25em"}} /></button>
          <button className={`${styles.button} ${styles.buttonDown}`} onClick={decrement}><ArrowDropDownIcon className={styles.icon} sx={{position: "absolute", top: "-0.25em", left: "-0.25em"}} /></button>
        </div>
      )}
    </div>
  );
};

export default TextBoxInput;
