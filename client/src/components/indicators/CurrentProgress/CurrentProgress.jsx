import {AnimatePresence, motion, useAnimate} from "framer-motion";
import {useEffect, useMemo, useRef, useState} from "react";

import styles from "./CurrentProgress.module.scss";
import { TbCheck } from "react-icons/tb";
import IconButton from "../../buttons/IconButton/IconButton";
import {useChangeEntryValue} from "../../../hooks/change-hooks/useChangeEntryValue";
import {useGetTaskCurrentEntry} from "../../../hooks/get-hooks/useGetTaskCurrentEntry";

const CurrentProgress = ({task}) => {
    const getPercentage = () => {
        if (isLoading) return 0;
        let percentage;

        if (task.type === 'Checkbox') {
            percentage = entry?.value;
        } else {
            if (task.goal?.number) {
                percentage = entry?.value / task.goal.number;
            }
        }

        return percentage;
    }

    const getEntryColor = () => {
        if (task.type === "Checkbox") return entry?.value === 1;

        switch (task.goal.type) {
            case "At least":
                if (task.goal.number <= entry?.value) {
                    return "var(--green-color)";
                }
                break;
            case "Exactly":
                if (task.goal.number === entry?.value) {
                    return "var(--green-color)";
                } else if (task.goal.number < entry?.value) {
                    return "var(--red-color)";
                }
                break;
            case "At most":
                if (task.goal.number < entry?.value) {
                    return "var(--red-color)";
                }
                break;
            default:
                break;
        }

        return "var(--on-primary-color)";
    }

    const {mutate: setTaskCurrentEntry} = useChangeEntryValue(task.title);
    const {data: entry, isLoading} = useGetTaskCurrentEntry(task._id, task.currentEntryId);
    const [prevPercentage, setPrevPercentage] = useState(getPercentage());
    const [overlayIsVisible, setOverlayIsVisible] = useState(false);
    const [addValue, setAddValue] = useState(task.type === "Number" ? task.step : 1);
    const entryColor = useMemo(getEntryColor, [entry?.value]);
    const contentRef = useRef();
    const overlayRef = useRef();
    const animationDirection = useRef(0);
    const overlayMouseDown = useRef(false);
    const valueUpdates = useRef(0);
    const shouldUpdate = useRef(false);
    const theoreticalAddValue = useRef(addValue); // useState set state was too slow for animation orchestrations. It made it possible to go to addValue 0. Added this for state value checks
    const previousTouchY = useRef(null);
    const contextMenuTimeout = useRef(null);
    const [scope, animate] = useAnimate();

    const handleCheckboxClick = () => {
        if (!isLoading) {
            setPrevPercentage(getPercentage());

            const number = parseInt(entry.value) === 0 ? 1 : 0
            setTaskCurrentEntry({taskId: task._id, entryId: entry?._id, value: number});
        }
    }

    const handleNumberRightClick = (event) => {
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        event.preventDefault();
        if (!overlayIsVisible) {
            setOverlayIsVisible(true);
        }
        return false;
    }

    const handleNumberTouchStart = (e) => {
        e.stopPropagation();
        if (contextMenuTimeout.current === null) {
            contextMenuTimeout.current = setTimeout(() => {
                setOverlayIsVisible(true)
                contextMenuTimeout.current = null;
            }, 200);
        }
    }

    const handleNumberTouchEnd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (contextMenuTimeout.current !== null) {
            clearTimeout(contextMenuTimeout.current);
            contextMenuTimeout.current = null;
        }
    }

    const handleNumberClick = (event) => {
        event.stopPropagation();
        if (isLoading) return;

        setPrevPercentage(getPercentage());
        setTaskCurrentEntry({taskId: task._id, entryId: entry._id, value: entry?.value + addValue});
    }

    const circleVariants = {
        hidden: {pathLength: prevPercentage, opacity: getPercentage() > 0 ? 0 : 1},
        visible: () => {
            let percentage = getPercentage();

            const duration = Math.min(0.4, Math.abs(percentage - prevPercentage) * 2);

            return {
                pathLength: percentage, opacity: percentage > 0 ? 1 : 0, transition: {
                    pathLength: {type: "spring", duration: duration, bounce: 0}, opacity: {duration: 0.01, delay: percentage > 0 ? 0 : 0.75 * duration}
                }
            };
        }
    };

    const overlayContentVariants = {
        initial: {
            height: "35.2px",
            width: "35.2px",
            paddingTop: 0,
            paddingBottom: 0,
            color: entryColor
        },
        animate: {
            height: "88px",
            width: "41.6px",
            paddingTop: "10px",
            paddingBottom: "10px",
            color: "var(--on-primary-color)"
        },
        exit: {
            height: "35.2px",
            width: "35.2px",
            paddingTop: 0,
            paddingBottom: 0,
            color: entryColor,
            transition: {delay: 0.1}
        }
    }

    const handleOverlayContainerClick = (e) => {
        if (!overlayMouseDown) return;
        e.stopPropagation();
        overlayMouseDown.current = false;
        setOverlayIsVisible(false);
    }
    
    const doOverlayAnimations = () => { // direction is -1 for down and 1 for up
        let direction = valueUpdates.current > 0 ? -1 : 1;
        const handleTransitionEnd = () => {
            if (shouldUpdate.current) {
                shouldUpdate.current = false;
                setAddValue(current => current - direction);
                animate(`.${styles.overlayContentChild}`, {y: `0em`}, {duration: 0});
                theoreticalAddValue.current -= direction
                valueUpdates.current += direction;

                if (direction < 0) {
                    animate(`.${styles.overlayBottomEdge}`, {opacity: 0, scale: 0}, {duration: 0.01});
                    animate(".overlayContentTop", {opacity: 1, scale: 1}, {duration: 0.01})
                } else {
                    animate(`.${styles.overlayTopEdge}`, {opacity: 0, scale: 0}, {duration: 0.01});
                    animate(".overlayContentBottom", {opacity: 1, scale: 1}, {duration: 0.01})
                }

                if (valueUpdates.current !== 0) {
                    if (theoreticalAddValue.current + valueUpdates.current > 0 && theoreticalAddValue.current + valueUpdates.current < 999) {
                        doOverlayAnimations(direction);
                    } else {
                        valueUpdates.current = 0;
                    }
                }
            }
        }

        if (theoreticalAddValue.current + valueUpdates.current > 0 && theoreticalAddValue.current + valueUpdates.current < 999) {
            if (direction < 0) {
                animate(`.${styles.overlayBottomEdge}`, {opacity: 1, scale: 1}, {duration: 0.1});
                animate(".overlayContentTop", {opacity: 0, scale: 0}, {duration: 0.1})
            } else {
                animate(`.${styles.overlayTopEdge}`, {opacity: 1, scale: 1}, {duration: 0.1});
                animate(".overlayContentBottom", {opacity: 0, scale: 0}, {duration: 0.1})
            }
            shouldUpdate.current = true;
            animate(`.${styles.overlayContentChild}`, {y: `${direction * 24}px`}, {
                duration: 0.1,
                onComplete: handleTransitionEnd,
                from: 0,
                type: "tween"
            });
        } else {
            valueUpdates.current = 0;
        }
    }

    const handleOverlayWheel = (e) => {
        if (e.deltaY < 0) {
            // Go down
            if (theoreticalAddValue.current + valueUpdates.current > 1) {
                if (valueUpdates.current <= 0) {
                    valueUpdates.current -= 1;

                    if (valueUpdates.current >= -1) {
                        doOverlayAnimations(1);
                    }
                }
                // else {
                //     valueUpdates.current = -1;
                //     doOverlayAnimations(1);
                // }
            }
        } else if (e.deltaY > 0) {
            // Go up
            if (theoreticalAddValue.current + valueUpdates.current < 998) {
                if (valueUpdates.current >= 0) {
                    valueUpdates.current += 1;

                    if (valueUpdates.current <= 1) {
                        doOverlayAnimations(-1);
                    }
                }
                // else {
                //     valueUpdates.current = 1;
                //     doOverlayAnimations(-1);
                // }
            }
        }
    }

    const handleTopOverlayClick = (e) => {
        if (!overlayMouseDown) return;
        e.stopPropagation();
        if (addValue - 1 > 0) {
            setAddValue(current => current - 1);
            handleNumberClick(e);
            animationDirection.current = 0;
            overlayMouseDown.current = false;
            setOverlayIsVisible(false);
        }
    }

    const handleMiddleOverlayClick = (e) => {
        if (!overlayMouseDown) return;
        e.stopPropagation();
        handleNumberClick(e);
        animationDirection.current = 0;
        overlayMouseDown.current = false;
        setOverlayIsVisible(false);
    }

    const handleBottomOverlayClick = (e) => {
        if (!overlayMouseDown) return;
        e.stopPropagation();
        setAddValue(current => current + 1);
        handleNumberClick(e);
        animationDirection.current = 0;
        overlayMouseDown.current = false;
        setOverlayIsVisible(false);
    }

    const handleOverlayTouchMove = (e) => {
        if (previousTouchY.current !== null) {
            if (previousTouchY.current + 34 < e.touches[0].pageY) {
                // Go down
                if (theoreticalAddValue.current + valueUpdates.current > 1) {
                    if (valueUpdates.current <= 0) {
                        valueUpdates.current -= 1;

                        if (valueUpdates.current >= -1) {
                            doOverlayAnimations(1);
                        }
                    }
                    // else {
                    //     valueUpdates.current = -1;
                    //     doOverlayAnimations(1);
                    // }
                }
            } else if (previousTouchY.current - 34 > e.touches[0].pageY) {
                // Go up
                if (theoreticalAddValue.current + valueUpdates.current < 998) {
                    if (valueUpdates.current >= 0) {
                        valueUpdates.current += 1;

                        if (valueUpdates.current <= 1) {
                            doOverlayAnimations(-1);
                        }
                    }
                    // else {
                    //     valueUpdates.current = 1;
                    //     doOverlayAnimations(-1);
                    // }
                }
            }
        }

        if (previousTouchY.current + 34 < e.touches[0].pageY || previousTouchY.current - 34 > e.touches[0].pageY) {
            previousTouchY.current = e.touches[0].pageY;
        }
    }

    const handleOverlayTouchStart = () => {
        overlayMouseDown.current = true;
    }

    const handleOverlayTouchEnd = () => {
        previousTouchY.current = null;
    }

    useEffect(() => {
        if (overlayIsVisible) {
            const {top, left} = contentRef.current.getBoundingClientRect()
            overlayRef.current.style.top = `${top}px`;
            overlayRef.current.style.left = `${left}px`;
        }
    }, [overlayIsVisible]);

    useEffect(() => {
        if (!isLoading && !isNaN(entry?.value)){
            setPrevPercentage(entry?.value)
        }
    }, [entry?.value])

    return (
        <div className={styles.container}>
            {(task.type === "Checkbox" || (task.type === "Number" && task.goal?.number)) && <div className={`${styles.outlineContainer}`}>
                <AnimatePresence initial={true}>
                    <motion.svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 100 100"
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.circle
                            key={entry?.value}
                            cx="50%"
                            cy="50%"
                            r="calc(50% - 5px)"
                            stroke="var(--green-color)"
                            variants={circleVariants}
                        />
                    </motion.svg>
                </AnimatePresence>
            </div>}
            <div className={`${styles.textContainer}`} ref={contentRef}>
                {task.type === 'Number' && <button
                    style={{
                        color: entryColor,
                        fontSize: addValue.toString().length > 1 ? `calc(100% - ${(addValue.toString().length - 1) * 3}px)` : "16px"
                    }}
                    onClick={handleNumberClick}
                    onContextMenu={handleNumberRightClick}
                    onTouchStart={handleNumberTouchStart}
                    onTouchEnd={handleNumberTouchEnd}
                >
                    {isLoading ? "..." : `+${addValue}`}
                </button>}
                {task.type === 'Checkbox' &&
                    <IconButton
                        color={entry?.value > 0 ? 'green' : 'normal'}
                        selected={true}
                        onClick={handleCheckboxClick}
                    >
                    <TbCheck />
                </IconButton>}
            </div>
            <AnimatePresence>
                {overlayIsVisible &&
                    <motion.div
                        className={styles.overlayContainer}
                        animate={{pointerEvents: "unset"}}
                        transition={{delay: 0.22}}
                        onClick={handleOverlayContainerClick}
                        onWheel={handleOverlayWheel}
                        onTouchStart={handleOverlayTouchStart}
                        onTouchEnd={handleOverlayTouchEnd}
                    >
                        <div className={styles.overlay} ref={overlayRef} onTouchMove={handleOverlayTouchMove} key={"test"}>
                            <motion.div
                                className={styles.overlayContent}
                                initial={"initial"}
                                animate={"animate"}
                                exit={"exit"}
                                variants={overlayContentVariants}
                                style={{fontSize: addValue.toString().length > 1 ? `calc(100% - ${(addValue.toString().length - 1) * 3}px)` : "16px"}}
                                transition={{type: "tween", duration: 0.2}}
                                ref={scope}
                            >
                                <motion.div
                                    className={`${styles.overlayContentChild} ${styles.overlayTopEdge}`}
                                >
                                    {addValue - 2 > 0 ? `+${addValue - 2}` : ""}
                                </motion.div>
                                <motion.div
                                    className={`${styles.overlayContentChild} overlayContentTop`}
                                    onClick={handleTopOverlayClick}
                                >
                                    {addValue - 1 > 0 ? `+${addValue - 1}` : ""}
                                </motion.div>
                                <motion.div
                                    className={styles.overlayContentChild}
                                    onClick={handleMiddleOverlayClick}
                                >
                                    +{addValue}
                                </motion.div>
                                <motion.div
                                    className={`${styles.overlayContentChild} overlayContentBottom`}
                                    onClick={handleBottomOverlayClick}
                                >
                                    {addValue + 1 < 999 ? `+${addValue + 1}` : ""}
                                </motion.div>
                                <motion.div
                                    className={`${styles.overlayContentChild} ${styles.overlayBottomEdge}`}
                                >
                                    {addValue + 2 < 998 ? `+${addValue + 2}` : ""}
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                }
            </AnimatePresence>
        </div>
    );
};

export default CurrentProgress;