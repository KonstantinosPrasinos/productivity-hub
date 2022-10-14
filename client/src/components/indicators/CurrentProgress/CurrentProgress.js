import { useAnimation, motion  } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import styles from "./CurrentProgress.module.scss";
import {useDispatch} from "react-redux";
import {setTaskPreviousEntry} from "../../../state/tasksSlice";
import CheckIcon from '@mui/icons-material/Check';
import IconButton from "../../buttons/IconButton/IconButton";

const CurrentProgress = ({ task }) => {
  const topLeftControls = useAnimation();
  const topControls = useAnimation();
  const topRightControls = useAnimation();
  const bottomRightControls = useAnimation();
  const bottomControls = useAnimation();
  const bottomLeftControls = useAnimation();

  const dispatch = useDispatch();

  const animationControls = useMemo(() => {return [topLeftControls, topControls, topRightControls, bottomRightControls, bottomControls, bottomLeftControls]}, [topLeftControls, topControls, topRightControls, bottomRightControls, bottomControls, bottomLeftControls]);
  const [prevPercentage, setPrevPercentage] = useState(0);

  useEffect(() => {
    const maxDuration = 0.4;
    let percentage;

    if (task.type === 'Number') {
      percentage = Math.round( task.previousEntry / task.goal.number * 100);
    } else {
      percentage = task.previousEntry;
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
          if (i === 1 || i === 4) {
            animationDuration = animationDirection > 0 ? ((32 - finish.remaining) / 100) * maxDuration : (finish.remaining / 100) * maxDuration;
            localPercentage = animationDirection > 0 ? (32 - finish.remaining) / 32 : finish.remaining / 32;
          } else {
            animationDuration = animationDirection > 0 ? ((9 - finish.remaining) / 100) * maxDuration : (finish.remaining / 100) * maxDuration;
            localPercentage = animationDirection > 0 ? (9 - finish.remaining) / 9 : finish.remaining / 9;
          }
        } else {
          if (i === 1 || i === 4) {
            animationDuration = 0.32 * maxDuration;
          } else {
            animationDuration = 0.09 * maxDuration;
          }
        }

        toAnimate.push({index: i, percentage: localPercentage, duration: animationDuration})
      }

      triggerAnimations(toAnimate);
    }

    const findRemaining = (percentage) => {

      // Note all the "animationDirection > 0" ternary statements are used to change the script in a way that supports the animation going backwards.
      // where the result of true indicates a forward direction and false indicates a backwards direction.

      if (percentage < 9) {
        return {index: 0, remaining: animationDirection > 0 ? 9 - percentage : percentage, goal: 9};
      } else if (percentage < 41) {
        return {index: 1, remaining: animationDirection > 0 ? 32 - (percentage - 9) : percentage - 9, goal: 32};
      } else if (percentage < 50) {
        return {index: 2, remaining: animationDirection > 0 ? 9 - (percentage - 41) : percentage - 41, goal: 9};
      } else if (percentage < 59) {
        return {index: 3, remaining: animationDirection > 0 ? 9 - (percentage - 50) : percentage - 50, goal: 9};
      } else if (percentage < 91) {
        return {index: 4, remaining: animationDirection > 0 ? 32 - (percentage - 59) : percentage - 59, goal: 32};
      } else if (percentage <= 100) {
        return {index: 5, remaining: animationDirection > 0 ? 9 - (percentage - 91) : percentage - 91, goal: 9};
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
        // console.log(percentage, prevPercentage);
        triggerAnimationsCheckbox();
        // console.log(percentage);
        setPrevPercentage(percentage);
      }
    }

  }, [prevPercentage, animationControls, task])

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

        {/* Edges */}
        {task.type === 'Number' && <motion.div className={`${styles.straightBarContainer} ${styles.top}`} initial={{scaleX: 0}} animate={animationControls[1]} />}
        {task.type === 'Number' && <motion.div className={`${styles.straightBarContainer} ${styles.bottom}`} initial={{scaleX: 0}} animate={animationControls[4]} />}

      </div>
      {task.type === 'Number' && <div className={`${styles.textContainer}`}>
        <div>{task.previousEntry} / {task.goal.number} </div>
        <div>|</div>
        <div onClick={() => dispatch(setTaskPreviousEntry({
          id: task.id,
          value: parseInt(task.previousEntry) + task.step
        }))} className={`Button ${styles.button}`}>{task.step > 0 ? `+${task.step}` : task.step}</div>
      </div>}
      {task.type === 'Checkbox' && <div className={`${styles.textContainer} ${styles.typeCheckbox}`}>
        <IconButton color={task.previousEntry === 0 ? 'normal' : 'green'} selected={true} onClick={() => dispatch(setTaskPreviousEntry({
          id: task.id,
          value: parseInt(task.previousEntry) === 0 ? 1 : 0
        }))}>
          <CheckIcon />
        </IconButton>
      </div>}
    </div>
  );
};

export default CurrentProgress;

