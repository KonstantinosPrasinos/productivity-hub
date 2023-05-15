import {AnimatePresence, motion} from "framer-motion";
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
            percentage = entry?.value / task.goal.number;
        }

        return percentage;
    }

    const {mutate: setTaskCurrentEntry} = useChangeEntryValue(task.title);
    const {data: entry, isLoading} = useGetTaskCurrentEntry(task._id, task.currentEntryId);
    const [prevPercentage, setPrevPercentage] = useState(getPercentage());
    const [overlayIsVisible, setOverlayIsVisible] = useState(false);
    const [addValue, setAddValue] = useState(task.type === "Number" ? task.step : 1);

    useEffect(() => {
        if (!isLoading && !isNaN(entry?.value)){
            setPrevPercentage(entry?.value)
        }
    }, [entry?.value])



    const handleCheckboxClick = () => {
        if (!isLoading) {
            setPrevPercentage(getPercentage());

            const number = parseInt(entry.value) === 0 ? 1 : 0
            setTaskCurrentEntry({taskId: task._id, entryId: entry?._id, value: number});
        }
    }

    const handleNumberRightClick = (event) => {
        event.stopPropagation();
        event.preventDefault();
        setOverlayIsVisible(current => !current);
        return false;
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

    const entryColor = useMemo(getEntryColor, [entry?.value]);
    const contentRef = useRef();
    const overlayRef = useRef();

    useEffect(() => {
        if (overlayIsVisible) {
            const {top, left} = contentRef.current.getBoundingClientRect()
            overlayRef.current.style.top = `calc(${top}px - 2.025em)`;
            overlayRef.current.style.left = `calc(${left}px - 0.3125em)`;
        }
    }, [overlayIsVisible]);

    const handleOverlayContainerClick = (e) => {
        e.stopPropagation();
        setOverlayIsVisible(false);
    }

    const [animationDirection, setAnimationDirection] = useState(0);

    const handleOverlayWheel = (e) => {
        if (e.deltaY < 0) {
            if (addValue > 1) {
                setAddValue(current => current - 1);
            }
            setAnimationDirection(-1);
        } else {
            setAddValue(current => current + 1);
            setAnimationDirection(1);
        }
    }

    const handleTopOverlayClick = (e) => {
        e.stopPropagation();
        if (addValue - 1 > 0) {
            setAddValue(current => current - 1);
            handleNumberClick(e);
            setOverlayIsVisible(false);
        }
    }

    const handleMiddleOverlayClick = (e) => {
        e.stopPropagation();
        handleNumberClick(e);
        setOverlayIsVisible(false);
    }

    const handleBottomOverlayClick = (e) => {
        e.stopPropagation();
        setAddValue(current => current + 1);
        handleNumberClick(e);
        setOverlayIsVisible(false);
    }

    return (
        <div className={styles.container}>
            <div className={`${styles.outlineContainer}`}>
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
            </div>
            <div className={`${styles.textContainer}`} ref={contentRef}>
                {task.type === 'Number' && <button
                    style={{
                        color: entryColor,
                        fontSize: `${18 - addValue.toString().length * 2}px`
                    }}
                    onClick={handleNumberClick}
                    onContextMenu={handleNumberRightClick}
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
                    <div
                        className={styles.overlayContainer}
                        onClick={handleOverlayContainerClick}
                        onWheel={handleOverlayWheel}
                    >
                        <motion.div
                            className={styles.overlay}
                            ref={overlayRef}
                            initial={{opacity: 0, scaleY: 0.32, scaleX: 0.55}}
                            animate={{opacity: 1, scaleY: 1, scaleX: 1}}
                            exit={{opacity: 0, scaleY: 0.32, scaleX: 0.55}}
                        >
                            <motion.div
                                key={addValue - 2}
                                initial={animationDirection > 0 ? {y: "1em"} : {y: "-1em"}}
                                animate={{y: 0}}
                                onClick={handleTopOverlayClick}
                            >
                                {addValue - 1 > 0 ? addValue - 1 : ""}
                            </motion.div>
                            <motion.div
                                key={addValue}
                                initial={animationDirection > 0 ? {y: "1em"} : {y: "-1em"}}
                                animate={{y: 0}}
                                onClick={handleMiddleOverlayClick}
                            >
                                {addValue}
                            </motion.div>
                            <motion.div
                                key={addValue + 2}
                                initial={animationDirection > 0 ? {y: "1em"} : {y: "-1em"}}
                                animate={{y: 0}}
                                onClick={handleBottomOverlayClick}
                            >
                                {addValue + 1}
                            </motion.div>
                        </motion.div>
                    </div>
                }
            </AnimatePresence>
        </div>
    );
};

export default CurrentProgress;