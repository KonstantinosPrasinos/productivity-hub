import {motion} from "framer-motion";
import {useEffect, useMemo, useState} from "react";

import styles from "./CurrentProgress.module.scss";
import CheckIcon from '@mui/icons-material/Check';
import IconButton from "../../buttons/IconButton/IconButton";
import {useChangeEntryValue} from "../../../hooks/change-hooks/useChangeEntryValue";
import {useGetTaskCurrentEntry} from "../../../hooks/get-hooks/useGetTaskCurrentEntry";

const CurrentProgress = ({task}) => {
    const {mutate: setTaskCurrentEntry} = useChangeEntryValue(task.title);
    const {data: entry, isLoading} = useGetTaskCurrentEntry(task._id, task.currentEntryId);

    useEffect(() => {
        if (!isNaN(entry?.value)){
            setPrevPercentage(entry.value)
        }
    }, [entry?.value])

    const handleCheckboxClick = () => {
        if (!isLoading) {
            setPrevPercentage(getPercentage());

            const number = entry.value === 0 ? 1 : 0
            setTaskCurrentEntry({taskId: task._id, entryId: entry?._id, value: number});
        }
    }

    const handleNumberClick = () => {
        if (isLoading) return;

        setPrevPercentage(getPercentage());
        setTaskCurrentEntry({taskId: task._id, entryId: entry._id, value: entry?.value + task.step});
    }

    const getPercentage = () => {
        if (isLoading) return 0;
        let percentage;

        if (task.type === 'Checkbox') {
            percentage = entry.value;
        } else {
            percentage = entry.value / task.goal.number;
        }

        return percentage;
    }

    const [prevPercentage, setPrevPercentage] = useState(getPercentage());

    const circleVariants = {
        hidden: {pathLength: prevPercentage, opacity: getPercentage() > 0 ? 1 : 0},
        visible: () => {
            let percentage = getPercentage();
            const duration = Math.min(0.4, Math.abs(percentage - prevPercentage) * 2);

            return {
                pathLength: percentage, opacity: percentage > 0 ? 1 : 0, transition: {
                    pathLength: {type: "spring", duration: duration, bounce: 0}, opacity: {duration: 0.01}
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

    return (<div className={styles.container}>
            <div className={`${styles.outlineContainer}`}>
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
            </div>
            <div className={`${styles.textContainer}`}>
                {task.type === 'Number' && <button
                    style={{
                        color: entryColor,
                        fontSize: `${18 - task.step.toString().length * 2}px`
                    }}
                    onClick={handleNumberClick}
                >
                    {isLoading ? "..." : `+${task.step}`}
                </button>}
                {task.type === 'Checkbox' && <IconButton color={entry?.value > 0 ? 'green' : 'normal'} selected={true}
                                                         onClick={handleCheckboxClick}>
                    <CheckIcon/>
                </IconButton>}
            </div>
        </div>);
};

export default CurrentProgress;