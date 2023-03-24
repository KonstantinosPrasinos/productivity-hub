import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import styles from "./HeaderExtendContainer.module.scss";

const HeaderExtendContainer = ({header, children, extendedInherited = null, setExtendedInherited = null, isDisabled = false}) => {
    const [isExtended, setIsExtended] = useState(false);

    const handleClick = () => {
        if (!isDisabled) {
            setExtendedInherited ? setExtendedInherited() : setIsExtended(current => !current)
        }
    }

    return (
        <section className={styles.container}>
            <div
                className={`${styles.headerContainer} ${isDisabled ? styles.disabled : ''}`}
                onClick={handleClick}
            >
                {header}
            </div>
            <AnimatePresence>
                {(isExtended || extendedInherited) && <motion.section
                    className={styles.contentContainer}
                    key={isExtended || extendedInherited}
                    initial={{height: 0, paddingBottom: 0}}
                    animate={{height: 'auto', paddingBottom: 12, transitionEnd: {overflowY: 'visible'}}}
                    exit={{height: 0, paddingBottom: 0, overflowY: 'hidden'}}
                    transition={{duration: 0.2}}
                >
                    {children}
                </motion.section>}
            </AnimatePresence>
        </section>
    );
};

export default HeaderExtendContainer;
