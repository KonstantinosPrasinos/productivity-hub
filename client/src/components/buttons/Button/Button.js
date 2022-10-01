import styles from "./Button.module.scss";

const Button = ({ onClick, children, type='round', filled = 'true' }) => {
  return <button onClick={onClick} className={`Button ${styles.container} ${type === 'round' ? '' : styles.square } ${filled ? '' : styles.outlined}`}>{children}</button>;
};

export default Button;
