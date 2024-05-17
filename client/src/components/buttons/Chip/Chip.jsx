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
}) => {
  return (
    <div
      className={`${styles.container} Button ${styles[style]} ${
        type === "select" && value === selected ? styles.filled : ""
      } ${type === "icon"} ${styles[size]} ${disabled ? styles.disabled : ""}`}
    >
      <button
        className={styles.children}
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
