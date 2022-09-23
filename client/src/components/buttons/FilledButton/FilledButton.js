import styles from "./FilledButton.module.scss";

const FilledButton = ({ onClick, children, type='round' }) => {
  return <button onClick={onClick} className={`Button ${styles.container} ${type === 'round' ? '' : styles.square }`}>{children}</button>;
};

export default FilledButton;
