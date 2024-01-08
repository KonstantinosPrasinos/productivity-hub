import styles from "./TextBoxInput.module.scss";
import {forwardRef, useState} from "react";
import IconButton from "../../buttons/IconButton/IconButton";
import { TbEye, TbEyeOff, TbCaretDown, TbCaretUp, TbCalendar } from "react-icons/tb";

const TypePassword = ({passwordVisible, setPasswordVisible}) => {
    const handleShowPassword = () => {
        setPasswordVisible(current => !current);
    }

    return (
        <IconButton onClick={handleShowPassword}>
            {passwordVisible ? <TbEye/> : <TbEyeOff/>}
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
                <TbCaretUp />
            </button>
            <button
                disabled={isDisabled}
                className={`${styles.button}`}
                onClick={decrement}
            >
                <TbCaretDown />
            </button>
        </div>
    )
}

const TypeCalendar = ({toggleCalendar, isDisabled}) => {
    return (
        <IconButton
            disabled={isDisabled}
            onClick={toggleCalendar}
        >
            <TbCalendar />
        </IconButton>
    )
}

const TextBoxInput = forwardRef(({
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
                                     toggleCalendar = null,
                                     minNumber = null,
                                     maxNumber = null
                                 }, ref) => {

    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleChange = (event) => {
        if (type === 'number') {
            if (isNaN(event.target.value)) {
                if (minNumber === null || minNumber < 0) {
                    if (event.target.value !== "-") return;
                } else {
                    return;
                }
            }

            if (event.target.value.length > 0) {
                if (minNumber && parseFloat(event.target.value) < minNumber) return;
                if (maxNumber && parseFloat(event.target.value) > maxNumber) return;
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
        if (maxNumber === null || value + 1 <= maxNumber) {
            setValue(parseInt(value) + 1);
        }
    }

    const decrement = () => {
        checkIfNull();
        if (minNumber === null || parseInt(value) - 1 >= minNumber) {
            setValue(parseInt(value) - 1);
        }
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

              ref={ref}
          />
      </span>
        {type === "number" && <TypeNumber decrement={decrement} increment={increment} isDisabled={isDisabled} />}
        {type === "password" && <TypePassword passwordVisible={passwordVisible} setPasswordVisible={setPasswordVisible} />}
        {type === "calendar" && <TypeCalendar toggleCalendar={toggleCalendar} isDisabled={isDisabled} />}
    </div>);
});

export default TextBoxInput;
