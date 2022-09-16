// import CompleteTask from './CompleteTask'
import styles from './VisualStreak.module.scss';

import CurrentProgress from "../CurrentProgress/CurrentProgress";

const VisualStreak = ({ streak }) => {
  const chars = streak.split("");
  let date = new Date();
  date.setDate(date.getDate() - 7);

  const renderDate = () => {
    date.setDate(date.getDate() + 1);
    const options = { day: "numeric", month: "numeric" };
    return (
      <div className={styles.date}>
        {date.toLocaleDateString(undefined, options)}
      </div>
    );
  };

  return (
    <div className={`${styles.container} Horizontal-Flex-Container`}>
      {chars.map((char, index) => 
        <div key={index} className={`
            ${styles.streakIndicator}
            ${index === 0 ? styles.isFirst : ''}
            ${char === '1' && index > 0 && chars[index - 1] === '1' ? styles.hasBefore : ''}
            ${char === '1' && ((index < chars.length && chars[index + 1] === '1') || index === chars.length - 1) ? styles.hasAfter : ''}
            ${char === '0' ? styles.unfilled : ''}
          `}>
            {renderDate()}
          </div>
      )}
      <CurrentProgress current={50} total={100} setCurrent={() => {}} step={5}></CurrentProgress>
    </div>
  );
};

export default VisualStreak;
