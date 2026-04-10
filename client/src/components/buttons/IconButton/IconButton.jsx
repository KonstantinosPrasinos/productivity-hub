import styles from "./IconButton.module.scss";

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.label]
 * @param {boolean|null} [props.selected]
 * @param {Function} [props.onClick]
 * @param {boolean} [props.border]
 * @param {string} [props.color]
 * @param {boolean} [props.disabled]
 * @param {Function} [props.onContextMenu]
 * @param {string} [props.size]
 * @param {boolean} [props.hasPadding]
 */
const IconButton = ({
  children,
  label,
  selected = null,
  onClick,
  border,
  color = "inherit",
  disabled,
  onContextMenu,
  size = "medium",
  hasPadding = true,
}) => {
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
                ${styles.container}
                ${
                  selected !== null
                    ? selected === true
                      ? styles.selected
                      : selected === false
                      ? styles.notSelected
                      : ""
                    : ""
                }
                ${border ? styles.border : ""}
                ${styles[color]}
                ${styles[size]}
                ${hasPadding ? "" : styles.noPadding}
            `}
      disabled={disabled}
    >
      <div className={styles.icon}>{children}</div>
      {label && <div className="Label">{label}</div>}
    </button>
  );
};

export default IconButton;
