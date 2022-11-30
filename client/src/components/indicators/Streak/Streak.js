import styles from './Streak.module.scss';

const Streak = ({ streak }) => {

  const streakArray = streak.split("");
  const progressArray = ['none', 'some', 'close', 'complete']

  return (
    <div className={`${styles.container} Horizontal-Flex-Container Space-Between`}>
      {streakArray.map((char, index) => (
          <div key={index} className={`${styles.streakOval} ${styles[progressArray[parseInt(char)]]}`} />
      ))}
    </div>
  );
};

export default Streak;
