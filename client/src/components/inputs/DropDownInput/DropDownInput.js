import {useContext, useRef, useState} from "react";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./DropDownInput.module.scss";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {MiniPagesContext} from "../../../context/MiniPagesContext";

const DropDownInput = ({ placeholder, options, isDisabled, selected, setSelected }) => {
  const [extended, setExtended] = useState(false);
  const containerRef = useRef();
  const miniPagesContext = useContext(MiniPagesContext);

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
        <div>{selected ? selected : placeholder}</div>
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
                                <div className={`${styles.option}`} key={index} onClick={() => {
                                    typeof option !== 'string' && miniPagesContext.dispatch({type: 'ADD_PAGE', payload: 'new-category'})
                                    setSelected(typeof option === 'string' ? option : '');
                                    handleExtension();
                                }}>
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
