import styles from "./Button.module.scss";

const Button = ({ onClick, children, type='round', filled = 'true', size }) => {
  return <button onClick={onClick} className={`Button Horizontal-Flex-Container ${styles.container} ${styles[size]} ${type === 'round' ? '' : styles.square } ${filled ? '' : styles.outlined}`}>{children}</button>;
};

export default Button;
