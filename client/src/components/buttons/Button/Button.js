import styles from "./Button.module.scss";
import {motion} from 'framer-motion';

const Button = ({
                    onClick,
                    children,
                    type = 'round',
                    filled = 'true',
                    size,
                    initial,
                    exit,
                    transition,
                    animate,
                    layout = false,
                    width = 'medium',
                    disabled = false,
                    isWarning = false
                }) => {

    return <motion.div
        initial={initial}
        animate={animate}
        exit={exit}
        layout={"size"}
        transition={transition}
    >
        <button
            onClick={onClick}
            className={`Button Horizontal-Flex-Container
                ${styles.container}
                  ${styles[size]}
                  ${type === 'round' ? '' : styles.square}
                  ${filled ? '' : styles.outlined}
                  ${styles[width]}
                  ${isWarning ? styles.isWarning : ''}
            `}
            disabled={disabled}
        >
            {children}
        </button>
    </motion.div>;
};

export default Button;
