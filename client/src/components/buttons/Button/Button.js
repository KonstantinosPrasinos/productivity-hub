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
                    layout,
                    width = 'medium',
                    disabled = false,
                    isWarning = false
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
          `}
        disabled={disabled}
        initial={initial}
        animate={animate}
        exit={exit}
        layout={layout}
        transition={transition}
    >
        {children}
    </motion.button>;
};

export default Button;
