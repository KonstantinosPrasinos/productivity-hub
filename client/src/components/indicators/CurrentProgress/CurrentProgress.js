import { useTheme } from '@mui/styles';
import { useAnimation, motion  } from "framer-motion";
import { useEffect, useState } from "react";

import styles from "./CurrentProgress.module.scss";

const CurrentProgress = ({ percentage }) => {
  const maxTimeCorner = 0.018;
  const maxTimeStraight =  0.064;

  // const topLeftControls = useAnimation();
  // const topControls = useAnimation();
  // const topRightControls = useAnimation();
  // const bottomRightControls = useAnimation();
  // const bottomControls = useAnimation();
  // const bottomLeftControls = useAnimation();

  const animationControls = [useAnimation(), useAnimation(), useAnimation(), useAnimation(), useAnimation(), useAnimation()];

  const [animationStack, setAnimationStack] = useState([]);
  const [prevPercentage, setPrevPercentage] = useState(0);

  const addToAnimationStack = (index, percentage) => {
    setAnimationStack([...animationStack, {index, percentage}]);
  }

  const removeFromAnimationStack = () => {
    setAnimationStack(animationStack.splice(animationStack.length - 1, 1));
  }

  const divideIntoChunks = (percentage) => {
    let remainingPercentage = percentage;

    //Checking for set cases
    if (percentage === 0) {
      return;
    } else if (percentage === 100) {
      for (let i = 0; i < 7; i++) {
        addToAnimationStack(i, 1);
      }
    }

    for (let i = 0; i < 7; i++) {
      if (i === 1 || i === 4) {
        //Straight lines
        if (remainingPercentage <= 32) {
          addToAnimationStack(i, remainingPercentage / 32);
          return;
        } else {
          addToAnimationStack(i, 1);
          remainingPercentage -= 32;
        }
      } else {
        //Edges
        if (remainingPercentage <= 9) {
          addToAnimationStack(i, remainingPercentage / 9);
          return;
        } else {
          addToAnimationStack(i, 1);
          remainingPercentage -= 9;
        }
      }
    }
  }

  

  useEffect(() => {
    const maxDuration = 0.5;
    let animationDirection = prevPercentage >= percentage ? -1 : 1;

    const setupAnimations = (start, finish) => {
      const toAnimate = [];

      // Note all the "animationDirection > 0" ternary statements are used to change the script in a way that supports the animation going backwards.
      // where the result of true indicates a forward direction and false indicates a backwards ddirection.  

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
      // where the result of true indicates a forward direction and false indicates a backwards ddirection.

      if (percentage < 9) {
        return {index: 0, remaining: animationDirection > 0 ? 9 - percentage : percentage, total: 9};
      } else if (percentage < 41) {
        return {index: 1, remaining: animationDirection > 0 ? 32 - (percentage - 9) : percentage - 9, total: 32};
      } else if (percentage < 50) {
        return {index: 2, remaining: animationDirection > 0 ? 9 - (percentage - 41) : percentage - 41, total: 9};
      } else if (percentage < 59) {
        return {index: 3, remaining: animationDirection > 0 ? 9 - (percentage - 50) : percentage - 50, total: 9};
      } else if (percentage < 91) {
        return {index: 4, remaining: animationDirection > 0 ? 32 - (percentage - 59) : percentage - 59, total: 32};
      } else if (percentage <= 100) {
        return {index: 5, remaining: animationDirection > 0 ? 9 - (percentage - 91) : percentage - 91, total: 9};
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

    if (prevPercentage !== percentage) {
      // The following ternary statement is used to check for percentages of under 0 or over 100 and round to 0 and 100 respectively
      setupAnimations(findRemaining(prevPercentage), findRemaining(percentage > 100 ? 100 : (percentage < 0 ? 0 : percentage)));
      setPrevPercentage(percentage);
    }

  }, [percentage, prevPercentage, animationControls])

  return (
    <div className={`${styles.container}`}>
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
        <motion.div className={`${styles.straightBarContainer} ${styles.top}`} initial={{scaleX: 0}} animate={animationControls[1]}></motion.div>
        <motion.div className={`${styles.straightBarContainer} ${styles.bottom}`} initial={{scaleX: 0}} animate={animationControls[4]}></motion.div>

      </div>
      <div className={`${styles.textContainer}`}>100 / 100 | +5</div>
    </div>
  );
};

export default CurrentProgress;
