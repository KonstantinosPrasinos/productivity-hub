import React, {useEffect, useRef} from 'react';
import {AnimatePresence, motion} from "framer-motion";
import styles from "./TextSwitchContainer.module.scss";

const TextSwitchContainer = ({children}) => {
    const isFirstRender = useRef(true);
    const shouldAnimate = useRef(true);
    const animatedChildrenContainer = useRef();

    useEffect(() => {
        // In order to trigger only when children changes
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }


        if (shouldAnimate.current) {
            shouldAnimate.current = false;

            setTimeout(() => {
                shouldAnimate.current = true;
            }, 300)
        }
    }, [children])

    return (
        <div className={styles.container}>
            {shouldAnimate.current && <AnimatePresence mode={"wait"} initial={false}>
                <motion.div
                    key={children}

                    initial={{y: "-1.5em"}}
                    animate={{y: 0}}
                    exit={{y: "1.5em"}}

                    ref={animatedChildrenContainer}
                >
                    {children}
                </motion.div>
            </AnimatePresence>}
            {!shouldAnimate.current && <div>{children}</div>}
        </div>
    );
};

export default TextSwitchContainer;
