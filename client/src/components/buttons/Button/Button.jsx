import styles from "./Button.module.scss";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

/**
 * @param {Object} props
 * @param {import("react").MouseEventHandler<HTMLButtonElement>} props.onClick
 * @param {React.ReactNode} props.children
 * @param {string} [props.type]
 * @param {boolean} [props.filled]
 * @param {string} [props.size]
 * @param {import("framer-motion").MotionProps["initial"]} [props.initial]
 * @param {import("framer-motion").MotionProps["exit"]} [props.exit]
 * @param {import("framer-motion").MotionProps["transition"]} [props.transition]
 * @param {import("framer-motion").MotionProps["animate"]} [props.animate]
 * @param {string} [props.width]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.isWarning]
 * @param {boolean} [props.symmetrical]
 * @param {boolean} [props.hasShadow]
 */
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

  const motionProps = {};
  if (initial !== undefined) motionProps.initial = initial;
  if (animate !== undefined) motionProps.animate = animate;
  if (exit !== undefined) motionProps.exit = exit;
  if (transition !== undefined) motionProps.transition = transition;

  return (
    <motion.button
      onClick={onClick}
      className={classes.join(' ')}
      disabled={disabled}
      layout={"size"}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
};

Button.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  type: PropTypes.oneOf(['square', 'rounded', "outlined"]),
  width: PropTypes.oneOf(['max']),
};

export default Button;
