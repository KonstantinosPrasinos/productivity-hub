import React from 'react';
import {AnimatePresence, motion} from "framer-motion";

const SwitchContainer = ({children, selectedTab}) => {
    return (
        <div>
            <AnimatePresence exitBeforeEnter>
                {selectedTab >= 0 && selectedTab < children.length && <motion.div
                    key={selectedTab}
                    variants={{
                        enter: {
                            height: 0,
                            overflowY: 'hidden'
                        },
                        selected: {
                            height: 'auto',
                            transitionEnd: {
                                overflowY: 'visible'
                            }
                        },
                        exit: {
                            height: 0,
                            overflowY: 'hidden'
                        }
                    }}
                    initial={'enter'}
                    animate={'selected'}
                    exit={'exit'}
                >
                    {children[selectedTab]}
                </motion.div>}
            </AnimatePresence>
        </div>
    );
};

export default SwitchContainer;