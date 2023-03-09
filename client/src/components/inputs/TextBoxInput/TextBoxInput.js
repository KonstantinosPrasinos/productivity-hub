import styles from "./TextBoxInput.module.scss";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {useState} from "react";
import IconButton from "../../buttons/IconButton/IconButton";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {FaCalendar} from "react-icons/fa";

const TypePassword = ({passwordVisible, setPasswordVisible}) => {


    const handleShowPassword = () => {
        setPasswordVisible(current => !current);
    }

    return (
        <IconButton onClick={handleShowPassword}>
            {passwordVisible ? <VisibilityOffIcon/> : <VisibilityIcon/>}
        </IconButton>
    );
}

const TypeNumber = ({isDisabled, increment, decrement}) => {
    return (
        <div className={styles.buttonsContainer}>
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
        </div>
    )
}

const TypeCalendar = ({toggleCalendar, isDisabled}) => {
    return (
        <button
            // className={styles.button}
            disabled={isDisabled}
            onClick={toggleCalendar}
        >
            <FaCalendar></FaCalendar>
        </button>
    )
}

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
                            alignment = 'left',
                          invalid = null,
                            toggleCalendar = null
                      }) => {

    const [passwordVisible, setPasswordVisible] = useState(false);

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
            checkIfNull();
        }
        if (type === 'calendar') {
            checkIfDate();
        }
    }

    const checkIfDate = () => {
        if ((new Date(value) === "Invalid Date") || !isNaN(value)) {
            setValue("");
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
              className={`${styles.input} ${styles[alignment]}`} placeholder={placeholder}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={onKeydown}
          />
      </span>
        {type === "number" && <TypeNumber decrement={decrement} increment={increment} isDisabled={isDisabled} />}
        {type === "password" && <TypePassword passwordVisible={passwordVisible} setPasswordVisible={setPasswordVisible} />}
        {type === "calendar" && <TypeCalendar toggleCalendar={toggleCalendar} isDisabled={isDisabled} />}
    </div>);
};

export default TextBoxInput;
