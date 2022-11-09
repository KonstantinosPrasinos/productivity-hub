import styles from "./TextBoxInput.module.scss";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {useState} from "react";
import IconButton from "../../buttons/IconButton/IconButton";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const TextBoxInput = ({
                          placeholder = "placeholder",
                          type = "text",
                          icon,
                          isDisabled = false,
                          value,
                          setValue,
                          size = 'medium',
                          width = 'medium',
                          onKeydown = () => {
                          },
                          invalid = null
                      }) => {

    const [passwordVisible, setPasswordVisible] = useState(false)

    const handleChange = (event) => {
        if (type === 'number') {
            if (isNaN(event.target.value)) {
                return;
            }
        }
        setValue(event.target.value)
    }

    const handleBlur = () => {
        if (type === 'number') {
            checkIfNull()
        }
    }

    const checkIfNull = () => {
        if (value === null || value === '') {
            setValue(0);
        }
    }

    const increment = () => {
        checkIfNull();
        setValue(parseInt(value) + 1);
    }

    const decrement = () => {
        checkIfNull();
        setValue(parseInt(value) - 1);
    }

    const handleShowPassword = () => {
        setPasswordVisible(current => !current);
    }

    const handleType = () => {
        switch (type) {
            case 'email':
                return 'email';
            case 'password':
                if (passwordVisible) {
                    return 'text';
                }
                return 'password';
            default:
                return 'text';
        }
    }

    return (<div
        className={`
            ${styles.container}
            Horizontal-Flex-Container
            Rounded-Container
            ${styles[size]} ${styles[width]}
            ${invalid !== null ? (invalid ? styles.invalid : styles.valid) : ''} // If invalid is null then the border is normal, else it's red for invalid and green for valid
        `}
    >
        {icon !== null && <>{icon}</>}
        <span className={styles.inputWrapper}>
          <input
              disabled={isDisabled}
              type={handleType()}
              className={styles.input} placeholder={placeholder}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={onKeydown}
          />
      </span>
        {type === "number" && (<div className={styles.buttonsContainer}>
            <button
                disabled={isDisabled}
                className={`${styles.button}`}
                onClick={increment}
            >
                <ArrowDropUpIcon sx={{position: "absolute", top: "-0.25em", left: "-0.25em"}}/>
            </button>
            <button
                disabled={isDisabled}
                className={`${styles.button}`}
                onClick={decrement}
            >
                <ArrowDropDownIcon sx={{position: "absolute", top: "-0.25em", left: "-0.25em"}}/>
            </button>
        </div>)}
        {type === 'password' && <IconButton onClick={handleShowPassword}>
            {passwordVisible ? <VisibilityOffIcon/> : <VisibilityIcon/>}
        </IconButton>}
    </div>);
};

export default TextBoxInput;
