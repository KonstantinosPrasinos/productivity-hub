import React, { memo, useEffect, useState } from "react";
import styles from "./PasswordStrengthBar.module.scss";

const PasswordStrengthBar = memo(
  ({ password, passwordScore, setPasswordScore }) => {
    const [message, setMessage] = useState("");

    useEffect(() => {
      if (password.length === 0) {
        if (passwordScore !== 0) setPasswordScore(0);
        setMessage("Password too short");
      }

      if (password.length < 8) {
        if (passwordScore !== 1) {
          setPasswordScore(1);
          setMessage("Password too short");
        }
      }

      let score = 1;

      if (password.length >= 12) {
        score++;
      }

      let diversity = 0;
      let missingProperty;
      let matched = {
        upper: false,
        lower: false,
        number: false,
        symbol: false,
      };

      for (const char of password) {
        if (char.match(/[A-Z]/)) {
          matched.upper = true;
        } else if (char.match(/[a-z]/)) {
          matched.lower = true;
        } else if (char.match(/[0-9]/)) {
          matched.number = true;
        } else if (char.match(/[^a-zA-Z0-9]/)) {
          matched.symbol = true;
        }
      }

      for (const property in matched) {
        if (matched[property]) diversity++;
        else if (!missingProperty) missingProperty = property;
      }

      let tempMessage;

      switch (missingProperty) {
        case "upper":
          tempMessage = "n uppercase letter";
          break;
        case "lower":
          tempMessage = " lowercase letter";
          break;
        case "number":
          tempMessage = " number";
          break;
        case "symbol":
          tempMessage = " symbol";
          break;
      }

      if (diversity < 2) {
        setPasswordScore(1);
        setMessage(`Password is too simple, try adding a${tempMessage}`);
      } else if (diversity < 4) {
        setPasswordScore(score + diversity - 2);
        setMessage(`Password is fine, try adding a${tempMessage}`);
      } else if (password.length < 12) {
        setPasswordScore(score + diversity - 2);
        setMessage("Password is good, try making it longer");
      }

      setPasswordScore(score + diversity - 2);
      setMessage("Password is strong");
    }, [password, setPasswordScore]);

    return (
      <div className={styles.container}>
        <div
          className={`${styles.bars} ${styles[`barsStrength${passwordScore}`]}`}
        >
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <span className={"Label-Medium"}>{message}</span>
      </div>
    );
  }
);

export default PasswordStrengthBar;
