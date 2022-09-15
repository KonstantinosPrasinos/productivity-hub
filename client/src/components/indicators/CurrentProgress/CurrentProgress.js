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

    const setupAnimations = (start, finish) => {
      const toAnimate = [];

      for (let i = start.index; i <= finish.index; i++) {
        let animationDuration;
        let localPercentage = 1;

        if (i === finish.index) {
          if (i === 1 || i === 4) {
            animationDuration = ((32 - finish.remaining) / 100) * maxDuration;
            localPercentage = (32 - finish.remaining) / 32;
          } else {
            animationDuration = ((9 - finish.remaining) / 100) * maxDuration;
            localPercentage = (9 - finish.remaining) / 9
          }
          
          
          console.log(animationDuration, finish.remaining)
        } else {
          if (i === 1 || i === 4) {
            animationDuration = 0.32 * maxDuration;
          } else {
            animationDuration = 0.09 * maxDuration;
          }
        }

        toAnimate.push({index: i, percentage: localPercentage, duration: animationDuration});
      }

      triggerAnimations(toAnimate);
    }
  
    const findRemaining = (percentage) => {
      if (percentage < 9) {
        return {index: 0, remaining: 9 - percentage, total: 9};
      } else if (percentage < 41) {
        return {index: 1, remaining: 32 - (percentage - 9), total: 32};
      } else if (percentage < 50) {
        return {index: 2, remaining: 9 - (percentage - 41), total: 9};
      } else if (percentage < 59) {
        return {index: 3, remaining: 9 - (percentage - 50), total: 9};
      } else if (percentage < 91) {
        return {index: 4, remaining: 32 - (percentage - 59), total: 32};
      } else if (percentage <= 100) {
        return {index: 5, remaining: 9 - (percentage - 91), total: 9};
      } else {
        return false;
      }
    }
  
    const triggerAnimations = (toAnimate) => {
      let currentDelay = 0;

      for (const element of toAnimate) {
        console.log(element);
        if (element.index === 1 || element.index === 4) {
          animationControls[element.index].start({scaleX: element.percentage, transition: {duration: element.duration, delay: currentDelay, style: "tween", ease: "linear"}});
        } else {
          animationControls[element.index].start({rotate: 270 + element.percentage * 90, transition: {duration: element.duration, delay: currentDelay, style: "tween", ease: "linear"}});
        }
        currentDelay += element.duration;
      }
    }

    // Don't forget case for prevPercentage == null

    if (prevPercentage !== percentage) {
      let remaining1 = findRemaining(prevPercentage);
      let remaining2 = findRemaining(percentage)
      console.log(remaining1, remaining2)
      setupAnimations(remaining1, remaining2);
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
