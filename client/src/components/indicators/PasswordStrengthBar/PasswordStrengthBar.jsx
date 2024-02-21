import React, {useMemo} from 'react';
import styles from './PasswordStrengthBar.module.scss';

const PasswordStrengthBar = ({password, setPasswordScore}) => {
    const {score, message} = useMemo(() => {
        if (password.length === 0) {
            setPasswordScore(0);
            return {score: 0, message: "Password too short"}
        }
        if (password.length < 8) {
            setPasswordScore(1);
            return {score: 1, message: "Password too short"}
        }

        let score = 1;

        if (password.length >= 12) {
            score++;
        }

        let diversity = 0;
        let missingProperty ;
        let matched = {upper: false, lower: false, number: false, symbol: false}

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
            if (matched[property]) diversity++
            else if (!missingProperty) missingProperty = property
        }

        let message;

        switch (missingProperty) {
            case 'upper':
                message = "n uppercase letter"
                break;
            case 'lower':
                message = " lowercase letter"
                break;
            case 'number':
                message = " number"
                break;
            case 'symbol':
                message = " symbol"
                break;
        }

        if (diversity < 2) {
            setPasswordScore(1);
            return {score: 1, message: `Password is too simple, try adding a${message}`}
        } else if (diversity < 4) {
            setPasswordScore(score + diversity - 2);
            return {score: score + diversity - 2, message: `Password is fine, try adding a${message}`}
        } else if (password.length < 12) {
            setPasswordScore(score + diversity - 2);
            return {score: score + diversity - 2, message: "Password is good, try making it longer"}
        }

        setPasswordScore(score + diversity - 2);

        return {score: score + diversity - 2, message: "Password is strong"}
    }, [password])

    return (
        <div className={styles.container}>
            <div className={`${styles.bars} ${styles[`barsStrength${score}`]}`}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <span className={"Label-Medium"}>{message}</span>
        </div>
    );
};

export default PasswordStrengthBar;