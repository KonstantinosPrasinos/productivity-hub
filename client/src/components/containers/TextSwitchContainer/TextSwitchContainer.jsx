import React from 'react';
import {AnimatePresence, motion} from "framer-motion";
import styles from "./TextSwitchContainer.module.scss";

const TextSwitchContainer = ({children}) => {
    return (
        <div className={styles.container}>
            <AnimatePresence mode={"wait"} initial={false}>
                <motion.div
                    key={children}

                    initial={{y: "-1.5em"}}
                    animate={{y: 0}}
                    exit={{y: "1.5em"}}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default TextSwitchContainer;
