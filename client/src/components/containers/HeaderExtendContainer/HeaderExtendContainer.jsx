import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import styles from "./HeaderExtendContainer.module.scss";

const HeaderExtendContainer = ({header, children, extendedInherited = null, setExtendedInherited = null, isDisabled = false, hasPointer = true, extendOnClick = true}) => {
    const [isExtended, setIsExtended] = useState(false);

    const handleClick = () => {
        if (!isDisabled && extendOnClick) {
            setExtendedInherited ? setExtendedInherited() : setIsExtended(current => !current)
        }
    }

    return (
        <section className={styles.container}>
            <div
                className={`${styles.headerContainer} ${isDisabled ? styles.disabled : ''} ${hasPointer ? styles.hasPointer : ""}`}
                onClick={handleClick}
            >
                {header}
            </div>
            <AnimatePresence initial={false}>
                {(isExtended || extendedInherited) &&
                    <motion.section
                        className={`${styles.contentContainer}`}
                        key={isExtended || extendedInherited}
                        initial={{height: 0, paddingBottom: 0}}
                        animate={{height: 'auto', paddingBottom: 12, transitionEnd: {overflowY: 'visible'}}}
                        exit={{height: 0, paddingBottom: 0, overflowY: 'hidden'}}
                        transition={{duration: 0.3}}
                    >
                        {children}
                    </motion.section>
                }
            </AnimatePresence>
        </section>
    );
};

export default HeaderExtendContainer;
