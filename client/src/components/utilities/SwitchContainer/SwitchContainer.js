import React, {useEffect, useRef} from 'react';
import {AnimatePresence, motion} from "framer-motion";
import styles from './SwitchContainer.module.scss';

const SwitchContainer = ({children, selectedTab}) => {
    const previousTab = useRef(selectedTab);

    useEffect(() => {
        previousTab.current = selectedTab;
    }, [selectedTab])

    return (
        <div className={styles.bigContainer}>
            <AnimatePresence initial={false}>
                {selectedTab >= 0 && selectedTab < children.length && <motion.div
                    className={styles.container}
                    key={selectedTab}

                    initial={{
                        x: previousTab.current < selectedTab ? -500 : 500,
                        opacity: 0
                    }}
                    animate={{
                        x: 0,
                        opacity: 1
                    }}
                    exit={{
                        x: previousTab.current < selectedTab ? -500 : 500,
                        opacity: 0
                    }}

                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                >
                    {children[selectedTab]}
                </motion.div>}
            </AnimatePresence>
        </div>
    );
};

export default SwitchContainer;
