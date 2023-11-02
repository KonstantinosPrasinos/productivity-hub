import {useEffect, useRef, useState} from "react";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./DropDownInput.module.scss";
import {TbChevronDown} from "react-icons/tb";
import {createPortal} from "react-dom";

const DropDownInput = ({placeholder, isDisabled, selected, children}) => {
  const [extended, setExtended] = useState(false);
  const [overlayContentTop, setOverlayContentTop] = useState(0);
  const [overlayContentLeft, setOverlayContentLeft] = useState(0);
  const containerRef = useRef();
  const iconRef = useRef();
  const hasEventListener = useRef(false);

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

  const handleOverlayClick = (e) => {
      e.stopPropagation();
      setExtended(false);
  }

  useEffect(() => {
      if (extended) {
          const setOverlayPosition = () => {
              const {top, left} = containerRef.current.getBoundingClientRect();

              setOverlayContentTop(`calc(${top}px + 2.5em)`);
              setOverlayContentLeft(left)
          }
          window.addEventListener("resize", setOverlayPosition);
          setOverlayPosition();
      }
  }, [extended]);

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
                // key={extended}
                initial={{rotate: extended ? 0 : 180}}
                animate={{rotate: extended ? 180 : 0}}
                transition={{type: "tween"}}
                ref={iconRef}
            >
                <TbChevronDown />
            </motion.div>
        </AnimatePresence>
      </div>
        {createPortal((
            <AnimatePresence>
                {extended && !isDisabled && (
                    <div
                        className={styles.optionsOverlay}
                        onClick={handleOverlayClick}
                    >
                        <motion.div
                            className={`${
                                styles.optionsContainer
                            } Stack-Container Rounded-Container`}
                            initial={{height: 0, padding: "0 12px"}}
                            animate={{height: 'auto', padding: '6px 12px'}}
                            exit={{overflowY: "hidden", height: 0, padding: "0 12px"}}
                            transition={{duration: 0.15}}
                            style={{top: overlayContentTop, left: overlayContentLeft}}
                        >
                            {children.map((option, index) => {
                                // Each options key should be its "value", in order to render as a selected
                                return (
                                    <div
                                        className={`${styles.option} ${option.key === selected ? styles.optionSelected : ""} `}
                                        key={index}
                                        onClick={handleExtension}
                                    >
                                        {option}
                                    </div>
                                );
                            })}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        ), document.getElementById("app") ?? document.getElementById("root"))}
    </div>
  );
};

export default DropDownInput;
