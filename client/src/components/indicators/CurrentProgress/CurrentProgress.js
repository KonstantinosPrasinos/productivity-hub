import { useAnimation, motion  } from "framer-motion";
import {useCallback, useEffect, useMemo, useState} from "react";

import styles from "./CurrentProgress.module.scss";
import {useDispatch} from "react-redux";
import {setTaskPreviousEntry} from "../../../state/tasksSlice";
import CheckIcon from '@mui/icons-material/Check';
import IconButton from "../../buttons/IconButton/IconButton";
import {debounce} from "lodash";

const CurrentProgress = ({ task }) => {
  const topLeftControls = useAnimation();
  const topRightControls = useAnimation();
  const bottomRightControls = useAnimation();
  const bottomLeftControls = useAnimation();

  const dispatch = useDispatch();

  const animationControls = useMemo(() => {return [topLeftControls, topRightControls, bottomRightControls, bottomLeftControls]}, [topLeftControls, topRightControls, bottomRightControls, bottomLeftControls]);
  const [prevPercentage, setPrevPercentage] = useState(0);

  useEffect(() => {
    const maxDuration = 0.4;
    let percentage;

    if (task.type === 'Number') {
      percentage = Math.round( task.currentEntryValue / task.goal.number * 100);
    } else {
      percentage = task.currentEntryValue;
    }

    let animationDirection = prevPercentage >= percentage ? -1 : 1;

    const setupAnimations = (start, finish) => {
      const toAnimate = [];

      // Note all the "animationDirection > 0" ternary statements are used to change the script in a way that supports the animation going backwards.
      // where the result of true indicates a forward direction and false indicates a backwards direction.

      for (let i = start.index; animationDirection > 0 ? i <= finish.index : i >= finish.index; animationDirection > 0 ? i++ : i--) {
        let animationDuration;
        let localPercentage = animationDirection > 0 ? 1 : 0;

        if (i === finish.index) {
          animationDuration = animationDirection > 0 ? ((9 - finish.remaining) / 100) * maxDuration : (finish.remaining / 100) * maxDuration;
          localPercentage = animationDirection > 0 ? (9 - finish.remaining) / 9 : finish.remaining / 9;
        } else {
          animationDuration = 0.09 * maxDuration;
        }

        toAnimate.push({index: i, percentage: localPercentage, duration: animationDuration})
      }

      triggerAnimations(toAnimate);
    }

    const findRemaining = (percentage) => {

      // Note all the "animationDirection > 0" ternary statements are used to change the script in a way that supports the animation going backwards.
      // where the result of true indicates a forward direction and false indicates a backwards direction.

      if (percentage < 25) {
        return {index: 0, remaining: animationDirection > 0 ? 25 - percentage : percentage};
      } else if (percentage < 50) {
        return {index: 1, remaining: animationDirection > 0 ? 25 - (percentage - 25) : percentage - 25};
      } else if (percentage < 75) {
        return {index: 2, remaining: animationDirection > 0 ? 25 - (percentage - 50) : percentage - 50};
      } else if (percentage <= 100) {
        return {index: 3, remaining: animationDirection > 0 ? 25 - (percentage - 75) : percentage - 75};
      } else {
        return false;
      }
    }
  
    const triggerAnimations = (toAnimate) => {
      let currentDelay = 0;

      for (const element of toAnimate) {
        if (element.index === 1 || element.index === 4) {
          animationControls[element.index].start({scaleX: element.percentage, transition: {duration: element.duration, delay: currentDelay, style: "tween", ease: "linear"}});
        } else {
          animationControls[element.index].start({rotate: 270 + element.percentage * 90, transition: {duration: element.duration, delay: currentDelay, style: "tween", ease: "linear"}});
        }
        currentDelay += element.duration;
      }
    }

    const triggerAnimationsCheckbox = () => {
      let rotation = 90;
      const animationControlsCopy = animationControls.filter((_, index) => {return index !== 1 && index !== 4});

      if (prevPercentage === 1 ) {
        rotation = 0;
        animationControlsCopy.reverse();
      }

      for (const index in animationControlsCopy) {
        animationControlsCopy[index].start({rotate: 270 + rotation, transition: {duration: maxDuration / 4, delay: index * maxDuration / 4, style: "tween", ease: "linear"}});
      }
    }

    if (task.type === 'Number') {
      if (prevPercentage !== percentage) {
        // The following ternary statement is used to check for percentages of under 0 or over 100 and round to 0 and 100 respectively
        setupAnimations(findRemaining(prevPercentage), findRemaining(percentage > 100 ? 100 : (percentage < 0 ? 0 : percentage)));
        setPrevPercentage(percentage);
      }
    } else {

      if (prevPercentage !== percentage) {
        triggerAnimationsCheckbox();
        setPrevPercentage(percentage);
      }
    }

  }, [prevPercentage, animationControls, task])

  const handleCompleteClick = () => {console.log('testing');
    dispatch(setTaskPreviousEntry({
      id: task._id,
      value: parseInt(task.currentEntryValue) === 0 ? 1 : 0
    }))
  }

  const deboundeHandler = useCallback(debounce(handleCompleteClick, 300), []);

  return (
    <div className={`${styles.container} ${task.type === 'Checkbox' ? styles.typeCheckbox : ''}`}>
      <div className={`${styles.outlineContainer}`}>

        {/* Corners */}
        <div className={`${styles.circularBarContainer} ${styles.topLeft}`}>
          <motion.div className={`${styles.circularBar} ${styles.topLeft}` } initial={{rotate: 270}} animate={animationControls[0]}></motion.div>
        </div>
        <div className={`${styles.circularBarContainer} ${styles.topRight}`}>
          <motion.div className={`${styles.circularBar} ${styles.topRight}`} initial={{rotate: 270}} animate={animationControls[2]}></motion.div>
        </div>
        <div className={`${styles.circularBarContainer} ${styles.bottomRight}`}>
          <motion.div className={`${styles.circularBar} ${styles.bottomRight}`} initial={{rotate: 270}} animate={animationControls[3]}></motion.div>
        </div>
        <div className={`${styles.circularBarContainer} ${styles.bottomLeft}`}>
          <motion.div className={`${styles.circularBar} ${styles.bottomLeft}`} initial={{rotate: 270}} animate={animationControls[5]}></motion.div>
        </div>

        {/*/!* Edges *!/*/}
        {/*{task.type === 'Number' && <motion.div className={`${styles.straightBarContainer} ${styles.top}`} initial={{scaleX: 0}} animate={animationControls[1]} />}*/}
        {/*{task.type === 'Number' && <motion.div className={`${styles.straightBarContainer} ${styles.bottom}`} initial={{scaleX: 0}} animate={animationControls[4]} />}*/}

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

