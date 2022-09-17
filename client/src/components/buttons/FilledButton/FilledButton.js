import styles from "./FilledButton.module.scss";

const FilledButton = ({ onClick, children }) => {
  return <button className={`Button ${styles.container}`}>{children}</button>;
};

export default FilledButton;
