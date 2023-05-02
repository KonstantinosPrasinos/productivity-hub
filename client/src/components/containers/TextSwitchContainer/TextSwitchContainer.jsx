import React from 'react';
import {AnimatePresence, motion} from "framer-motion";
import styles from "./TextSwitchContainer.module.scss";

const TextSwitchContainer = ({children}) => {
    return (
        <div className={styles.container}>
            <AnimatePresence mode={"wait"}>
                <motion.div
                    key={children}

                    initial={{y: "-1em"}}
                    animate={{y: 0}}
                    exit={{y: "1em"}}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default TextSwitchContainer;
