import {motion} from "framer-motion";
import {useEffect, useState} from "react";

import styles from "./CurrentProgress.module.scss";
import CheckIcon from '@mui/icons-material/Check';
import IconButton from "../../buttons/IconButton/IconButton";
import {useChangeEntry} from "../../../hooks/change-hooks/useChangeEntry";
import {useGetTaskCurrentEntry} from "../../../hooks/get-hooks/useGetTaskCurrentEntry";

const CurrentProgress = ({ task }) => {
  const [prevPercentage, setPrevPercentage] = useState(0.5);
  const {mutate: setTaskCurrentEntry} = useChangeEntry();
  const {data: entry, isLoading} = useGetTaskCurrentEntry(task._id, task.currentEntryId);

  useEffect(() => {
    if (isNaN(entry?.value)) return;

    setPrevPercentage(entry.value)
  }, [entry?.value])

  const handleCompleteClick = () => {
    if (!isLoading) {
      const number = entry.value === 0 ? 1 : 0
      setTaskCurrentEntry({entryId: entry?._id, taskId: task._id, value: number});
    }
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

  const circleVariants = {
    hidden: { pathLength: prevPercentage, opacity: getPercentage() > 0 ? 1 : 0 },
    visible: () => {
      let percentage = getPercentage();
      const duration = Math.min(1, Math.abs(percentage - prevPercentage) * 2);

      return {
        pathLength: percentage,
        opacity: percentage > 0 ? 1 : 0,
        transition: {
          pathLength: { type: "spring", duration: duration, bounce: 0 },
          opacity: {duration: 0.01}
        }
      };
    }
  };

  return (
    <div className={styles.container}>
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
        <IconButton color={entry?.value > 0 ? 'green' : 'normal'} selected={true} onClick={handleCompleteClick}>
          <CheckIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default CurrentProgress;