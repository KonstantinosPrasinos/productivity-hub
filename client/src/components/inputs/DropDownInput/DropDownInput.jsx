import {useContext, useRef, useState} from "react";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./DropDownInput.module.scss";
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {TbChevronDown} from "react-icons/tb";

const DropDownInput = ({ placeholder, options, isDisabled, selected, setSelected }) => {
  const [extended, setExtended] = useState(false);
  const containerRef = useRef();
  const iconRef = useRef();
  const hasEventListener = useRef(false);
  const miniPagesContext = useContext(MiniPagesContext);

  const handleExtension = () => {
      const collapse = (event) => {
          if (
              event.target !== containerRef.current &&
              !containerRef.current?.contains(event.target) &&
              event.target !== iconRef.current &&
              iconRef.current?.contains(event.target)
          ) {
              setExtended(false);
              document.body.removeEventListener('click', collapse);
              hasEventListener.current = false;
          }
      }

      if (!isDisabled) {
          setExtended(current => !current);
          if (!extended && !hasEventListener.current) {
              hasEventListener.current = true;
              document.body.addEventListener('click', collapse);
          }
      }
  }

  return (
    <div className={`${isDisabled ? styles.disabled : ''} ${styles.container}`} ref={containerRef}>
      <div
        className={`Horizontal-Flex-Container Rounded-Container ${isDisabled ? styles.disabled : ''} ${styles.inputContainer}`}
        onClick={handleExtension}
      >
        <div className={styles.selected}>{selected ? selected : placeholder}</div>
        <AnimatePresence initial={false} mode={"wait"}>
            <motion.div
                className={styles.arrowIcon}
                key={extended}
                initial={{rotate: extended ? 0 : 180}}
                animate={{rotate: extended ? 180 : 0}}
                transition={{type: "tween"}}
                ref={iconRef}
            >
                <TbChevronDown />
            </motion.div>
        </AnimatePresence>
      </div>
        <div>
            <AnimatePresence>
                {extended && !isDisabled && (
                    <motion.div
                        className={`${
                            styles.optionsContainer
                        } Stack-Container Rounded-Container`}
                        initial={{height: 0, padding: "0 12px"}}
                        animate={{height: 'auto', padding: '6px 12px'}}
                        exit={{height: 0, padding: "0 12px"}}
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
