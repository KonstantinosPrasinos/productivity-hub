import styles from './Streak.module.scss';

const Streak = ({ streak }) => {

  const streakArray = streak.split("");

  return (
    <div className={`${styles.container} Horizontal-Flex-Container Space-Between`}>
      {streakArray.map((char, index) => (
          <div key={index} className={`${styles.streakOval} ${char === "1" ? styles.complete : ''}`} />
      ))}
    </div>
  );
};

export default Streak;
