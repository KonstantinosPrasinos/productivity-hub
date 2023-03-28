import React, {useState} from 'react';
import {AnimatePresence, motion} from "framer-motion";
import styles from './CollapsibleContainer.module.scss';

const CollapsibleContainer = ({children, isVisible, label, hasBorder = true}) => {
    const [extended, setExtended] = useState(false);

    return (
        <AnimatePresence initial={false}>
            {isVisible &&
                <motion.div
                    className={styles.container}
                    initial={"collapsed"}
                    animate={"extended"}
                    exit={"collapsed"}
                    variants={{
                        collapsed: {
                            height: 0,
                            padding: 0,
                            // marginTop: 0,
                            // marginBottom: 0,
                            overflowY: 'hidden'
                        },
                        extended: {
                            height: 'auto',
                            padding: label || !hasBorder ? 0 : '10px 0',
                            // marginTop: label || !hasBorder ? 0 : '10px',
                            // marginBottom: label || !hasBorder ? 0 : '10px',
                            transitionEnd: {
                                overflowY: 'visible'
                            }
                        }
                    }}
                    transition={{type: 'tween'}}
                >
                    {(isVisible || (label && extended)) && <motion.div
                        className={`Stack-Container No-Gap ${styles.childrenContainer} ${label || !hasBorder ? styles.noBorder : ''}`}

                    >
                        {children}
                    </motion.div>}
                </motion.div>
            }
        </AnimatePresence>
    );
};

export default CollapsibleContainer;
