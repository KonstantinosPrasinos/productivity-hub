import React, {useEffect, useRef} from 'react';
import {motion} from "framer-motion";
import styles from './SwitchContainer.module.scss';

const SwitchContainer = ({children, selectedTab}) => {
    const previousTab = useRef(selectedTab);

    useEffect(() => {
        previousTab.current = selectedTab;
    }, [selectedTab])

    if (selectedTab === null) return <div></div>

    return (
        <div className={styles.bigContainer}>
            {selectedTab >= 0 && selectedTab < children.length && <motion.div
                className={styles.container}
                key={selectedTab}

                initial={{
                    x: previousTab.current < selectedTab ? 500 : -500,
                    opacity: 0
                }}
                animate={{
                    x: 0,
                    opacity: 1
                }}

                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                }}
            >
                {children[selectedTab]}
            </motion.div>}
        </div>
    );
};

export default SwitchContainer;
