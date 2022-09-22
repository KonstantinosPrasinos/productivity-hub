import {useRef, useState} from "react";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./DropDownInput.module.scss";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const DropDownInput = ({ placeholder, options, isDisabled }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [extended, setExtended] = useState(false);
  const containerRef = useRef();

  const handleExtension = () => {
      const collapse = (event) => {
          if (event.target !== containerRef.current && !containerRef.current.contains(event.target)) {
              setExtended(false);
          }
      }

      setExtended(current => !current);
      if (!extended) {
          document.body.addEventListener('click', collapse);
      } else {
          document.body.removeEventListener('click', collapse);
      }
  }

  return (
    <div className={`${isDisabled ? styles.disabled : ''} ${styles.container}`} ref={containerRef}>
      <div
        className={`Horizontal-Flex-Container Rounded-Container ${isDisabled ? styles.disabled : ''} ${styles.inputContainer}`}
        onClick={handleExtension}

      >
        <div>{selectedIndex !== null ? options[selectedIndex] : placeholder}</div>
        <ArrowDropDownIcon
          className={`${styles.arrowIndicator} ${
            extended ? styles.extended : ""
          }`}
        />
      </div>
        <div >
            <AnimatePresence>

                {extended && !isDisabled && (
                    <motion.div
                        className={`${
                            styles.optionsContainer
                        } Stack-Container Rounded-Container`}
                        initial={{scaleY: 0}}
                        animate={{scaleY: 1}}
                        exit={{scaleY: 0}}
                        transition={{duration: 0.15}}
                    >
                        {options.map((option, index) => {
                            return (
                                <div className={`${styles.option}`} key={index} onClick={() => {setSelectedIndex(index); handleExtension();}}>
                                    {option}
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

    </div>
  );
};

export default DropDownInput;
