import styles from "./Button.module.scss";
import {motion} from 'framer-motion';

const Button = ({
                    onClick,
                    children,
                    type = 'round',
                    filled = true,
                    size = 'medium',
                    initial,
                    exit,
                    transition,
                    animate,
                    width = 'medium',
                    disabled = false,
                    isWarning = false,
                    symmetrical = false
                }) => {

    return <motion.button
            onClick={onClick}
            className={`Button Horizontal-Flex-Container
                ${styles.container}
                  ${styles[size]}
                  ${type === 'round' ? '' : styles.square}
                  ${filled ? '' : styles.outlined}
                  ${styles[width]}
                  ${isWarning ? styles.isWarning : ''}
                  ${symmetrical ? styles.symmetrical : ""}
            `}
            disabled={disabled}
            initial={initial}
            animate={animate}
            exit={exit}
            layout={"size"}
            transition={transition}

            whileHover={!disabled ? {y: -1} : null}
            whileTap={!disabled ? {y: 1} : null}
        >
            {children}
        </motion.button>;
};

export default Button;
