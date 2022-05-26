import { useTheme } from "@emotion/react";
import { useAnimation, motion  } from "framer-motion";
import { useEffect, useState } from "react";

const CompleteTask = ({ percentage }) => {
  const theme = useTheme();

  const topLeftControls = useAnimation();
  const topControls = useAnimation();
  const topRightControls = useAnimation();
  const bottomRightControls = useAnimation();
  const bottomControls = useAnimation();
  const bottomLeftControls = useAnimation();

  const [currentSizes, setCurrentSizes] = useState([0, 0, 0, 0, 0, 0]);

  let maxDuration = 0.15;

  useEffect(() => {
    const animated = [
      { controls: topLeftControls, max: 2.5 },
      { controls: topControls, max: 10},
      { controls: topRightControls, max: 2.5},
      { controls: bottomRightControls, max: 2.5},
      { controls: bottomControls, max: 10 },
      { controls: bottomLeftControls, max: 2.5 }
    ];
    async function prevNextCatchUp(index, sizesCopy) {
      //For collapsing extended
      for (let i = 5; i > index; i--) {
        if (sizesCopy[i] > 0) {
          if (animated[i].max === 2.5) {
            await animated[i].controls.start({height: 0, width: 0, transition: { duration: (sizesCopy[i] / animated[i].max) * maxDuration / 2, style: "tween", ease: "linear"}});
          } else {
            await animated[i].controls.start({width: 0, transition: { duration: (sizesCopy[i] / animated[i].max) * maxDuration , style: "tween", ease: "linear"}});
          }
          sizesCopy[i] = 0;
        }
      }

      //For extending collapsed
      for (let i = 0; i < index; i++) {
        if (animated[i].max !== sizesCopy[i]) {
          if (animated[i].max === 2.5) {
            const duration = sizesCopy[i] === 0 ? 1 : Math.min(sizesCopy[i] > 0 ? (animated[i].max / sizesCopy[i]) : animated[i].max, 1);
            await animated[i].controls.start({height: `${animated[i].max}em`, width: `${animated[i].max}em`, transition: { duration: duration * maxDuration / 2, style: "tween", ease: "linear"}});
          } else {
            const duration = sizesCopy[i] === 0 ? 1 : Math.min(sizesCopy[i] > 0 ? (animated[i].max / sizesCopy[i]) : animated[i].max, 1);
            await animated[i].controls.start({width: `${animated[i].max}em`, transition: { duration: duration * maxDuration , style: "tween", ease: "linear"}});
          }
          sizesCopy[i] = animated[i].max;
        }
      }
    }

    async function syncPercentage() {
      let sizesCopy = [...currentSizes];
      if (percentage <= 12.5) {
        let size = ((percentage < 0 ? 0 : percentage) / 12.5) * 2.5;

        await prevNextCatchUp(0, sizesCopy);
        await topLeftControls.start({width: `${size}em`, height: `${size}em`, transition: {duration: (size / animated[0].max) * maxDuration / 2}});
        sizesCopy[0] = size;
        setCurrentSizes(sizesCopy);
      } else if (percentage <= 37.5) {
        let size = ((percentage - 12.5) / 25) * 10;

        await prevNextCatchUp(1, sizesCopy);
        await topControls.start({ width: `${size}em`, transition: {duration: (size / animated[1].max) * maxDuration }});
        sizesCopy[1] = size;
        setCurrentSizes(sizesCopy);
      } else if (percentage <= 50) {
        let size = ((percentage - 37.5) / 12.5) * 2.5;

        await prevNextCatchUp(2, sizesCopy);
        await topRightControls.start({ width: `${size}em`, height: `${size}em`, transition: {duration: (size / animated[2].max) * maxDuration / 2}});
        sizesCopy[2] = size;
        setCurrentSizes(sizesCopy);
      } else if (percentage <= 62.5) {
        let size = ((percentage - 50) / 12.5) * 2.5;

        await prevNextCatchUp(3, sizesCopy);
        await bottomRightControls.start({ width: `${size}em`, height: `${size}em`, transition: {duration: (size / animated[3].max) * maxDuration / 2}});
        sizesCopy[3] = size;
        setCurrentSizes(sizesCopy);
      } else if (percentage <= 87.5) {
        let size = ((percentage - 62.5) / 25) * 10;

        await prevNextCatchUp(4, sizesCopy);
        await bottomControls.start({ width: `${size}em`, transition: {duration: (size / animated[4].max) * maxDuration }});
        sizesCopy[4] = size;
        setCurrentSizes(sizesCopy);
      } else if (percentage > 87.5) {
        let size =(((percentage > 100 ? 100 : percentage) - 87.5) / 12.5) * 2.5;

        await prevNextCatchUp(5, sizesCopy);
        await bottomLeftControls.start({ width: `${size}em`, height: `${size}em`, transition: {duration: (size / animated[5].max) * maxDuration / 2}});
        sizesCopy[5] = size;
        setCurrentSizes(sizesCopy);
      }
    }
    syncPercentage();
  }, [percentage, topLeftControls, topControls, topRightControls, bottomRightControls, bottomControls, bottomLeftControls, currentSizes, maxDuration]);

  return (
    <div
      style={{
        display: "block",
        height: "3em",
        width: "10.2em",
        background: "white",
        position: "relative",
        borderRadius: "1.5em",
        overflow: "hidden",
      }}
    >
      <div>
        <motion.div
          className="complete-task-top-left-bar"
          style={{
            position: "absolute",
            background: theme.palette.success.main,
            bottom: "2.5em",
            left: 0,
          }}
          initial={{ width: 0, height: 0 }}
          animate={topLeftControls}
          transition={{ style: "tween", ease: "linear" }}
        ></motion.div>
        <motion.div
          className="complete-task-top-bar"
          style={{
            position: "absolute",
            background: theme.palette.success.main,
            height: "2.5em",
            top: 0,
            left: "2.5em",
          }}
          initial={{ width: 0 }}
          animate={topControls}
          transition={{ style: "tween", ease: "linear" }}
        ></motion.div>
        <motion.div
          className="complete-task-top-right-bar"
          style={{
            position: "absolute",
            background: theme.palette.success.main,
            top: 0,
            left: "12.5em",
          }}
          initial={{ width: 0, height: 0 }}
          animate={topRightControls}
          transition={{ style: "tween", ease: "linear" }}
        ></motion.div>
        <motion.div
          className="complete-task-bottom-right-bar"
          style={{
            position: "absolute",
            background: theme.palette.success.main,
            top: "2.5em",
            right: 0,
          }}
          initial={{ width: 0, height: 0 }}
          animate={bottomRightControls}
          transition={{ style: "tween", ease: "linear" }}
        ></motion.div>
        <motion.div
          className="complete-task-bottom-bar"
          style={{
            position: "absolute",
            background: theme.palette.success.main,
            height: "2.5em",
            bottom: 0,
            right: "2.5em",
          }}
          initial={{ width: 0 }}
          animate={bottomControls}
          transition={{ style: "tween", ease: "linear" }}
        ></motion.div>
        <motion.div
          className="complete-task-bottom-left-bar"
          style={{
            position: "absolute",
            background: theme.palette.success.main,
            bottom: 0,
            right: "12.5em",
          }}
          initial={{ width: 0, height: 0 }}
          animate={bottomLeftControls}
          transition={{ style: "tween", ease: "linear" }}
        ></motion.div>
      </div>
      <div
        className="complete-task-content"
        style={{
          position: "absolute",
          background: theme.palette.primary.main,
          borderRadius: "1.5em",
          height: "2.5em",
          width: "9.7em",
          top: "0.25em",
          left: "0.25em",
        }}
      ></div>
    </div>
  );
};

export default CompleteTask;
