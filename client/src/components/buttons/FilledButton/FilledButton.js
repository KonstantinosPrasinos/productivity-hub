import styles from "./FilledButton.module.scss";

const FilledButton = ({ onClick, children }) => {
  return <div className={`Button ${styles.container}`}>{children}</div>;
};

export default FilledButton;
