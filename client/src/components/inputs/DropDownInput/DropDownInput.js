import {useContext, useRef, useState} from "react";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./DropDownInput.module.scss";
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {FaChevronDown} from "react-icons/fa";

const DropDownInput = ({ placeholder, options, isDisabled, selected, setSelected }) => {
  const [extended, setExtended] = useState(false);
  const containerRef = useRef();
  const miniPagesContext = useContext(MiniPagesContext);

  const handleExtension = () => {
      const collapse = (event) => {
          if (event.target !== containerRef.current && !containerRef.current?.contains(event.target)) {
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
        <div className={styles.selected}>{selected ? selected : placeholder}</div>
        <motion.div
            className={styles.arrowIcon}
            key={extended}
            initial={{rotate: extended ? 0 : 180}}
            animate={{rotate: extended ? 180 : 0}}
        >
            <FaChevronDown />
        </motion.div>
      </div>
        <div >
            <AnimatePresence>
                {extended && !isDisabled && (
                    <motion.div
                        className={`${
                            styles.optionsContainer
                        } Stack-Container Rounded-Container Has-Shadow`}
                        initial={{height: 0}}
                        animate={{height: 'auto'}}
                        exit={{height: 0}}
                        transition={{duration: 0.15}}
                    >
                        {options.map((option, index) => {
                            return (
                                <div className={`${styles.option}`} key={index} onClick={() => {
                                    typeof option !== 'string' && miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'new-category'}})
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
