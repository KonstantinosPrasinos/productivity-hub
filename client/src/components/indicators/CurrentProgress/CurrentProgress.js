import {motion} from "framer-motion";
import {useCallback, useEffect, useState} from "react";

import styles from "./CurrentProgress.module.scss";
import {useDispatch} from "react-redux";
import {setTaskCurrentEntry} from "../../../state/tasksSlice";
import CheckIcon from '@mui/icons-material/Check';
import IconButton from "../../buttons/IconButton/IconButton";
import {debounce} from "lodash";

const CurrentProgress = ({ task }) => {
  const dispatch = useDispatch();

  const [prevPercentage, setPrevPercentage] = useState(0.5);

  useEffect(() => {
    setPrevPercentage(getPercentage());
  }, [task.currentEntryValue])

  const handleCompleteClick = () => {
    dispatch(setTaskCurrentEntry({
      id: task._id,
      value: parseInt(task.currentEntryValue) === 0 ? 1 : 0
    }))
  }

  const getPercentage = () => {
    let percentage;

    if (task.type === 'Checkbox') {
      percentage = task.currentEntryValue;
    } else {
      percentage = task.currentEntryValue / task.goal.number;
    }

    return percentage;
  }

  const deboundeHandler = useCallback(debounce(handleCompleteClick, 300), []);

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
    <div className={`${styles.container} ${task.type === 'Checkbox' ? styles.typeCheckbox : ''}`}>
      <div className={`${styles.outlineContainer}`}>
        <motion.svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            initial="hidden"
            animate="visible"
        >
          <motion.circle
              key={task.currentEntryValue}
              cx="50%"
              cy="50%"
              r="calc(50% - 5px)"
              stroke="var(--green-color)"
              variants={circleVariants}
          />
        </motion.svg>
      </div>
      <div className={`${styles.textContainer}`}>
        <IconButton color={task.currentEntryValue === 0 ? 'normal' : 'green'} selected={true} onClick={deboundeHandler}>
          <CheckIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default CurrentProgress;