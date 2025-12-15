import styles from "./Button.module.scss";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const Button = ({
  onClick,
  children,
  type = "round",
  filled = true,
  size = "medium",
  initial,
  exit,
  transition,
  animate,
  width = "medium",
  disabled = false,
  isWarning = false,
  symmetrical = false,
  hasShadow = false,
}) => {
  const classes = [styles.container, styles[size], styles[width]];

  if (type !== "round") {
    classes.push(styles.square);
  }

  if (!filled) {
    classes.push(styles.outlined);
  }

  if (isWarning) {
    classes.push(styles.isWarning);
  }

  if (symmetrical) {
    classes.push(styles.symmetrical);
  }

  if (hasShadow) {
    classes.push("Has-Shadow");
  }

  return (
    <motion.button
      onClick={onClick}
      className={classes.join(' ')}
      disabled={disabled}
      initial={initial}
      animate={animate}
      exit={exit}
      layout={"size"}
      transition={transition}
    >
      {children}
    </motion.button>
  );
};

Button.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  style: PropTypes.oneOf(['squared', 'rounded', "outlined"]),
  type: PropTypes.oneOf(['select', 'icon']),
  width: PropTypes.oneOf(['max']),
};

export default Button;
