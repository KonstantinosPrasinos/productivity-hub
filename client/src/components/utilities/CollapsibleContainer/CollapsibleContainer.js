import React from 'react';
import {AnimatePresence, motion} from "framer-motion";
import styles from './CollapsibleContainer.module.scss';

const CollapsibleContainer = ({children, isVisible}) => {
    return (
        <div>
            <AnimatePresence>
                {isVisible && <motion.div
                    className={`Stack-Container ${styles.container}`}
                    initial={"collapsed"}
                    animate={"extended"}
                    exit={"collapsed"}
                    variants={{
                        collapsed: {
                            height: 0,
                            padding: 0,
                            marginBottom: 0,
                            overflowY: 'hidden'
                        },
                        extended: {
                            height: 'auto',
                            padding: '10px 0',
                            marginBottom: '20px',
                            transitionEnd: {
                                overflowY: 'visible'
                            }
                        }
                    }}
                    transition={{type: 'tween'}}
                >
                    {children}
                </motion.div>}
            </AnimatePresence>
        </div>
    );
};

export default CollapsibleContainer;
