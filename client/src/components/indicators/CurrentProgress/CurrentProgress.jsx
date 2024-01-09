import {AnimatePresence, motion} from "framer-motion";
import {useEffect, useMemo, useRef, useState} from "react";

import styles from "./CurrentProgress.module.scss";
import { TbCheck } from "react-icons/tb";
import IconButton from "../../buttons/IconButton/IconButton";
import {useChangeEntryValue} from "../../../hooks/change-hooks/useChangeEntryValue";
import {useGetTaskCurrentEntry} from "../../../hooks/get-hooks/useGetTaskCurrentEntry";
import {createPortal} from "react-dom";
import {useStepAnimations} from "@/hooks/useStepAnimations";

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

        switch (task?.goal?.type) {
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
    const previousTouchY = useRef(null);
    const contextMenuTimeout = useRef(null);

    const {scope, addUpdate, subtractUpdate} = useStepAnimations(24, addValue, setAddValue, styles.overlayContentTop, styles.overlayTopEdge, styles.overlayContentBottom, styles.overlayBottomEdge, styles.overlayContentChild, 1, 999);

    const handleContainerClick = (event) => {
        event.stopPropagation();

        if (isLoading) return

        if (task.type === "Checkbox") {
            setPrevPercentage(getPercentage());

            const number = parseInt(entry.value) === 0 ? 1 : 0
            setTaskCurrentEntry({taskId: task._id, entryId: entry?._id, value: number});
        } else {
            handleNumberClick(event);
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
        e.stopPropagation();

        if (contextMenuTimeout.current !== null) {
            clearTimeout(contextMenuTimeout.current);
            contextMenuTimeout.current = null;
        } else {
            e.preventDefault();
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
            width: "35.2px", // 2.2em
            paddingTop: 0,
            paddingBottom: 0,
            color: entryColor
        },
        animate: {
            height: "88px",
            width: "45.76px", // 2.6em + 10% (for hover transform). I have used px instead, in order to change the fond size when needed
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

    const handleOverlayWheel = (e) => {
        if (e.deltaY < 0) {
            // Go down
            subtractUpdate();
        } else if (e.deltaY > 0) {
            // Go up
            addUpdate();
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
                subtractUpdate();
            } else if (previousTouchY.current - 34 > e.touches[0].pageY) {
                // Go up
                addUpdate();
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
            const setOverlayPosition = () => {
                const {top, left, width} = contentRef.current.getBoundingClientRect();

                const actualWidth = 2.6 * 16 - 6.4; // for some reason, the width from getBoundingClientRect() is smaller than expected by 6.4 ¯\_(ツ)_/¯

                const leftCoord = left + width / 2 - actualWidth / 2;
                const topCoord = top + width / 2 - actualWidth / 2;

                overlayRef.current.style.top = `${topCoord}px`; // + 2.08 because its half of the 10% scale from hovering
                overlayRef.current.style.left = `${leftCoord}px`;
            }

            window.addEventListener("resize", setOverlayPosition);
            setOverlayPosition();
        }
    }, [overlayIsVisible]);

    useEffect(() => {
        if (!isLoading && !isNaN(entry?.value)){
            setPrevPercentage(entry?.value)
        }
    }, [entry?.value])

    return (
        <div
            className={styles.container}
            onClick={handleContainerClick}
        >
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
            <div
                className={`${styles.textContainer}`}
                ref={contentRef}
            >
                {task.type === 'Number' && <button
                    style={{
                        color: entryColor,
                        fontSize: addValue.toString().length > 1 ? `calc(100% - ${(addValue.toString().length - 1) * 3}px)` : "16px"
                    }}
                    onContextMenu={handleNumberRightClick}
                    onTouchStart={handleNumberTouchStart}
                    onTouchEnd={handleNumberTouchEnd}
                >
                    {isLoading ? "..." : `+${addValue}`}
                </button>}
                {task.type === 'Checkbox' &&
                    <div className={styles.checkBoxContainer}>

                        <IconButton
                            color={entry?.value > 0 ? 'green' : 'normal'}
                            selected={true}
                        >
                            <TbCheck />
                        </IconButton>
                    </div>
                }
            </div>
            {createPortal((
                <AnimatePresence>
                    {overlayIsVisible &&
                        <motion.div
                            className={styles.overlayContainer}
                            onClick={handleOverlayContainerClick}
                            onWheel={handleOverlayWheel}
                            onTouchStart={handleOverlayTouchStart}
                            onTouchEnd={handleOverlayTouchEnd}
                        >
                            <div className={styles.overlay} ref={overlayRef} onTouchMove={handleOverlayTouchMove}>
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
                                        className={`${styles.overlayContentChild} ${styles.overlayContentTop}`}
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
                                        className={`${styles.overlayContentChild} ${styles.overlayContentBottom}`}
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
            ), document.getElementById("app") ?? document.getElementById("root"))}
        </div>
    );
};

export default CurrentProgress;