import React from 'react';
import styles from './Modal.module.scss';
import Button from "../../buttons/Button/Button";
import {motion} from "framer-motion";

const Modal = ({dismountFunction, continueFunction, children}) => {
    const handleContainerClick = (e) => {
        if (e.currentTarget === e.target) dismountFunction();
    }
    return (
        <motion.div
            className={styles.container}
            onClick={handleContainerClick}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.1}}
        >
            <div className={`Stack-Container ${styles.subContainer} BigGap`}>
                <div className={styles.content}>
                    {children}
                </div>
                <div className={`Horizontal-Flex-Container Space-Around`}>
                    <Button filled={false} size={"big"} onClick={dismountFunction}>
                        Cancel
                    </Button>
                    <Button filled={false} size={"big"} onClick={continueFunction}>
                        Continue
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default Modal;
