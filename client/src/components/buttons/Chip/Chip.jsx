import styles from "./Chip.module.scss";
import { TbX } from "react-icons/tb";
import IconButton from "@/components/buttons/IconButton/IconButton";
import React from "react";

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
  onContextMenu = () => {},
}) => {
  return (
    <div
      className={`${styles.container} ${styles.widthLimited} Button ${
        styles[style]
      } ${type === "select" && value === selected ? styles.filled : ""} ${
        type === "icon"
      } ${styles[size]} ${disabled ? styles.disabled : ""} ${
        hasShadow ? "Has-Shadow" : ""
      }`}
    >
      <button
        className={styles.children}
        onContextMenu={onContextMenu}
        onClick={(e) => {
          if (!disabled) {
            switch (type) {
              case "select":
                if (setSelected) setSelected(value);
                break;
              case "icon":
                if (onClick) onClick(e);
                break;
            }
          }
        }}
      >
        {children}
      </button>
      {deleteFunction && (
        <IconButton onClick={deleteFunction}>
          <TbX />
        </IconButton>
      )}
    </div>
  );
};

export default Chip;
