// import CompleteTask from './CompleteTask'
import styles from './VisualStreak.module.scss';

import CurrentProgress from "../CurrentProgress/CurrentProgress";
import { useState } from 'react';

const VisualStreak = ({ task }) => {

  const [hoveredDate, setHoveredDate] = useState(null);

  const chars = task.shortHistory.split("");
  let date = new Date();
  date.setDate(date.getDate() - 7);

  const renderDate = (index) => {
    date.setDate(date.getDate() + 1);
    const options = { day: "numeric", month: "numeric" };
    return (
      <div className={`${styles.date} ${index === hoveredDate ? styles.hovered : ''}`}>
        {date.toLocaleDateString(undefined, options)}
      </div>
    );
  };

  return (
    <div className={`${styles.container} Horizontal-Flex-Container`}>
      {chars.map((char, index) => 
        <div 
          key={index}
          className={`
            ${styles.streakIndicator}
            ${index === 0 ? styles.isFirst : ''}
            ${char === '1' && index > 0 && chars[index - 1] === '1' ? styles.hasBefore : ''}
            ${char === '1' && ((index < chars.length && chars[index + 1] === '1') || index === chars.length - 1) ? styles.hasAfter : ''}
            ${char === '0' ? styles.unfilled : ''}
          `}
          onMouseEnter={() => setHoveredDate(index)}
          onMouseLeave={() => setHoveredDate(null)}
        >
          {renderDate(index)}
        </div>
      )}
      <CurrentProgress task={task}></CurrentProgress>
    </div>
  );
};

export default VisualStreak;
