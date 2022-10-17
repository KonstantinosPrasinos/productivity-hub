import React, {useState} from 'react';
import {AnimatePresence, motion} from "framer-motion";
import styles from './CollapsibleContainer.module.scss';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CollapsibleContainer = ({children, isVisible, label}) => {
    const [extended, setExtended] = useState(false);

    return (
        <div className={styles.container}>
            {label &&
                <div className={`${label ? `Rounded-Container ${styles.subContainer}` : ''} Horizontal-Flex-Container Space-Between Clickable`}
                     onClick={() => {setExtended(state => !state)}}
                >
                    <span>{label}</span>
                    <motion.div
                        animate={extended ? 'extended' : 'collapsed'}
                        variants={{
                        extended: {
                            rotate: 180
                        },
                        collapsed: {
                            rotate: 0
                        }}}
                        transition={{type: 'tween'}}
                    >
                        <ExpandMoreIcon />
                    </motion.div>
                </div>
            }
            <AnimatePresence>
                {(isVisible || (label && extended)) && <motion.div
                    className={`Stack-Container ${styles.childrenContainer} ${label ? styles.noBorder : ''}`}
                    initial={"collapsed"}
                    animate={"extended"}
                    exit={"collapsed"}
                    variants={{
                        collapsed: {
                            height: 0,
                            padding: 0,
                            marginTop: 0,
                            marginBottom: 0,
                            overflowY: 'hidden'
                        },
                        extended: {
                            height: 'auto',
                            padding: '10px 0',
                            marginTop: '10px',
                            marginBottom: '10px',
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
