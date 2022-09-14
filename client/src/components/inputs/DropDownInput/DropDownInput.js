import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import styles from "./DropDownInput.module.scss";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const DropDownInput = ({ children, options }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [extended, setExtended] = useState(false);

  return (
    <div className={styles.container}>
      <div
        className={`Horizontal-Flex-Container Rounded-Container ${styles.inputContainer}`}
        onClick={() => setExtended((current) => !current)}
      >
        <div>{selectedIndex !== null ? options[selectedIndex] : children}</div>
        <ArrowDropDownIcon
          className={`${styles.arrowIndicator} ${
            extended ? styles.extended : ""
          }`}
        />
      </div>
      <AnimatePresence>
        {extended && (
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
                <div className={`${styles.option}`} key={index} onClick={() => {setSelectedIndex(index); setExtended(false)}}>
                  {option}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DropDownInput;
