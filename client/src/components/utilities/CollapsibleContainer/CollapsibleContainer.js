import React from 'react';
import {AnimatePresence, motion} from "framer-motion";
import styles from './CollapsibleContainer.module.scss';

const CollapsibleContainer = ({children, isVisible}) => {
    return (
        <AnimatePresence>
            {isVisible && <motion.div
                className={`Stack-Container ${styles.container}`}
                initial={{height: 0, overflowY: 'hidden'}}
                animate={{height: "auto", transitionEnd: {overflowY: 'visible'}}}
                exit={{height: 0, overflowY: 'hidden'}}
                transition={{type: 'tween'}}
            >
                {children}
            </motion.div>}
        </AnimatePresence>
    );
};

export default CollapsibleContainer;
