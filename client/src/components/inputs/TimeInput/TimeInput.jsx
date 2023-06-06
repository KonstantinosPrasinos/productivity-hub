import React, {useEffect, useRef, useState} from 'react';
import styles from './TimeInput.module.scss';
import IconButton from "@/components/buttons/IconButton/IconButton";
import {TbClock} from "react-icons/all";
import {createPortal} from "react-dom";
import {AnimatePresence, motion} from "framer-motion";
import {useStepAnimations} from "@/hooks/useStepAnimations";

const TimeInput = ({hour, setHour, minute, setMinute, isDisabled}) => {
    const [overlayIsVisible, setOverlayIsVisible] = useState(false);
    const [overlayContentTop, setOverlayContentTop] = useState(0);
    const [overlayContentLeft, setOverlayContentLeft] = useState(0);
    const containerRef = useRef();

    const {scope: scopeHour, subtractUpdate: subtractUpdateHour, addUpdate: addUpdateHour} = useStepAnimations((0.8 + 1.5) * 20 + 1 /* 0.4em */, hour, setHour, styles.overlayHourTop, styles.overlayHourTopEdge, styles.overlayHourBottom, styles.overlayHourBottomEdge, styles.overlayHour, 0, 23);
    const {scope: scopeMinute, subtractUpdate: subtractUpdateMinute, addUpdate: addUpdateMinute} = useStepAnimations((0.8 + 1.5) * 20 + 1 /* 0.4em */, minute, setMinute, styles.overlayMinuteTop, styles.overlayMinuteTopEdge, styles.overlayMinuteBottom, styles.overlayMinuteBottomEdge, styles.overlayMinute, 0, 59);

    const makeTwoDigits = (number) => {
        if (number < 10) return `0${number}`;
        return number;
    }

    const handleHourChange = (e) => {
        const input = e.target.value;

        if (input.match(/^([0-9]|[01][0-9]?|2[0-3]?)?$/)) {
            setHour(input);
        }
    }

    const handleMinuteChange = (e) => {
        const input = e.target.value;

        if (input.match(/^([0-9]|[0-5][0-9]?)?$/)) {
            setMinute(input);
        }
    }

    const handleHourBlur = () => {
        if (hour.length === 0) {
            setHour('00');
            return;
        }

        if (hour.length === 1) {
            setHour('0'.concat(hour));
        }
    }

    const handleMinuteBlur = () => {
        if (minute.length === 0) {
            setMinute('00');
            return;
        }

        if (minute.length === 1) {
            setMinute('0'.concat(minute));
        }
    }

    const handleHourFocus = () => {
        if (hour !== '00' && hour[0] === '0') {
            setHour(hour.substring(1));
        }
    }

    const handleMinuteFocus = () => {
        if (minute !== '00' && minute[0] === '0') {
            setMinute(minute.substring(1));
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
            if (overlayIsVisible) setOverlayIsVisible(false)
        }
    }

    const handleClockClick = (e) => {
        e.stopPropagation();
        setOverlayIsVisible(current => !current);
    }

    const handleOverlayClick = (e) => {
        e.stopPropagation();
        setOverlayIsVisible(false);
    }

    const handleOverlayHourWheel = (e) => {
        if (e.deltaY < 0) {
            // Go down
            subtractUpdateHour();
        } else if (e.deltaY > 0) {
            // Go up
            addUpdateHour();
        }
    }

    const handleOverlayMinuteWheel = (e) => {
        if (e.deltaY < 0) {
            // Go down
            subtractUpdateMinute();
        } else if (e.deltaY > 0) {
            // Go up
            addUpdateMinute();
        }
    }

    const handleOverlayContainerClick = (e) => {
        e.stopPropagation();
    }

    useEffect(() => {
        if (overlayIsVisible) {
            const {top, left} = containerRef.current.getBoundingClientRect();

            setOverlayContentTop(top);
            setOverlayContentLeft(left)
        }
    }, [overlayIsVisible]);

    return (
        <>
            <div className={`Rounded-Container ${styles.container}`} ref={containerRef}>
                <input
                    className={styles.currentNumber}
                    value={makeTwoDigits(hour)}
                    onChange={handleHourChange}
                    onBlur={handleHourBlur}
                    onFocus={handleHourFocus}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                    placeholder={"00"}
                />
                :
                <input
                    className={styles.currentNumber}
                    value={makeTwoDigits(minute)}
                    onChange={handleMinuteChange}
                    onBlur={handleMinuteBlur}
                    onFocus={handleMinuteFocus}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                    placeholder={"00"}
                />
                <IconButton onClick={handleClockClick}><TbClock /></IconButton>
            </div>
            {createPortal((
                <AnimatePresence>
                    {overlayIsVisible && <div
                        className={styles.overlay}
                        onClick={handleOverlayClick}
                    >
                        <div
                            className={styles.overlayContentContainer}
                            style={{top: overlayContentTop, left: overlayContentLeft}}
                        >
                            <motion.div
                                className={`Rounded-Container ${styles.container} ${styles.overlayCurrentContainer}`}
                                onClick={handleOverlayContainerClick}

                                initial={{height: "2em"}}
                                animate={{height: "6em"}}
                                exit={{height: "2em"}}
                            >
                                <div onWheel={handleOverlayHourWheel} ref={scopeHour}>
                                    <div className={`${styles.overlayHour} ${styles.overlayHourTopEdge}`}>{parseInt(hour) - 2 > -1 ? makeTwoDigits(hour - 2) : ""}</div>
                                    <div className={styles.separator} />
                                    <div className={`${styles.overlayHour} ${styles.overlayHourTop}`}>{parseInt(hour) - 1 > -1 ? makeTwoDigits(hour - 1) : ""}</div>
                                    <motion.div
                                        className={styles.separator}
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                    />
                                    <input
                                        className={`${styles.currentNumber} ${styles.overlayHour}`}
                                        value={makeTwoDigits(hour)}
                                        onChange={handleHourChange}
                                        onBlur={handleHourBlur}
                                        onFocus={handleHourFocus}
                                        onKeyDown={handleKeyDown}
                                        disabled={isDisabled}
                                    />
                                    <motion.div
                                        className={styles.separator}
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                    />
                                    <div className={`${styles.overlayHour} ${styles.overlayHourBottom}`}>{parseInt(hour) + 1 < 24 ? makeTwoDigits(hour + 1) : ""}</div>
                                    <div className={styles.separator} />
                                    <div className={`${styles.overlayHour} ${styles.overlayHourBottomEdge}`}>{parseInt(hour) + 2 < 23 ? makeTwoDigits(hour + 2) : ""}</div>
                                </div>
                                :
                                <div onWheel={handleOverlayMinuteWheel} ref={scopeMinute}>
                                    <div className={`${styles.overlayMinute} ${styles.overlayMinuteTopEdge}`}>{parseInt(minute) - 2 > -1 ? makeTwoDigits(minute - 2) : ""}</div>
                                    <div className={styles.separator} />
                                    <div className={`${styles.overlayMinute} ${styles.overlayMinuteTop}`}>{parseInt(minute) - 1 > -1 ? makeTwoDigits(minute - 1) : ""}</div>
                                    <motion.div
                                        className={styles.separator}
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                    />
                                    <input
                                        className={`${styles.currentNumber} ${styles.overlayMinute}`}
                                        value={makeTwoDigits(minute)}
                                        onChange={handleMinuteChange}
                                        onBlur={handleMinuteBlur}
                                        onFocus={handleMinuteFocus}
                                        onKeyDown={handleKeyDown}
                                        disabled={isDisabled}
                                    />
                                    <motion.div
                                        className={styles.separator}
                                        initial={{opacity: 0}}
                                        animate={{opacity: 1}}
                                        exit={{opacity: 0}}
                                    />
                                    <div className={`${styles.overlayMinute} ${styles.overlayMinuteBottom}`}>{parseInt(minute) + 1 < 60 ? makeTwoDigits(minute + 1) : ""}</div>
                                    <div className={styles.separator} />
                                    <div className={`${styles.overlayMinute} ${styles.overlayMinuteBottomEdge}`}>{parseInt(minute) + 2 < 59 ? makeTwoDigits(minute + 2) : ""}</div>
                                </div>
                                <IconButton onClick={handleClockClick}><TbClock /></IconButton>
                            </motion.div>
                        </div>
                    </div>}
                </AnimatePresence>
            ), document.getElementById("app") ?? document.getElementById("root"))}
        </>
    );
};

export default TimeInput;
