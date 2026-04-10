import styles from "./Chip.module.scss";
import { TbX } from "react-icons/tb";
import IconButton from "@/components/buttons/IconButton/IconButton";
import React from "react";
import PropTypes from "prop-types";

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {any} props.value
 * @param {any} [props.selected]
 * @param {(value: any) => void} [props.setSelected]
 * @param {string} [props.type]
 * @param {React.MouseEventHandler<HTMLButtonElement>} [props.onClick]
 * @param {string} [props.style]
 * @param {string} [props.size]
 * @param {boolean} [props.disabled]
 * @param {React.MouseEventHandler<HTMLButtonElement>} [props.deleteFunction]
 * @param {boolean} [props.hasShadow]
 * @param {React.MouseEventHandler<HTMLButtonElement>} [props.onContextMenu]
 */
const Chip = ({
  children,
  value,
  selected,
  setSelected,
  type = "select",
  onClick,
  style = "squared",
  size,
  disabled,
  deleteFunction,
  hasShadow = false,
  onContextMenu = () => { },
}) => {
  const classes = [styles.container, styles.widthLimited, 'Button', styles[style]];

  if (type === 'select' && value === selected) {
    classes.push(styles.filled);
  }

  if (size) {
    classes.push(styles[size]);
  }

  if (disabled) {
    classes.push(styles.disabled);
  }

  if (hasShadow) {
    classes.push('Has-Shadow');
  }

  return (
    <div className={classes.join(' ')}>
      <button
        className={styles.chipButton}
        onContextMenu={onContextMenu}
        onClick={(e) => {
          if (!disabled) {
            if (onClick) onClick(e);
            if (setSelected) setSelected(value);
          }
        }}
      >
        {children}
      </button>
      {deleteFunction && (
        <IconButton
          onClick={deleteFunction}
        >
          <TbX />
        </IconButton>
      )}
    </div>
  );
};

export default Chip;
