import CompleteTask from './CompleteTask'

const VisualStreak = ({ streak }) => {
  const chars = streak.split("");
  let date = new Date();
  date.setDate(date.getDate() - 6);

  const renderDate = () => {
    date.setDate(date.getDate() + 1);
    const options = { day: "numeric", month: "numeric" };
    return (
      <div className="streak-value-date">
        {date.toLocaleDateString(undefined, options)}
      </div>
    );
  };

  return (
    <div
      className="visual-streak"
      style={{ height: "3.5em", margin: "1em 0 1em 0", display: "inline-block"}}
    >
      {chars.map((char, index) => {
        return (
          <div
            className="streak-value"
            style={{
              width: "4em",
              height: "3em",
              display: "inline-block",
              position: "relative",
            }}
            key={index}
          >
            {index > 0 && char === "1" && chars[index - 1] === "1" && (
              <div
                className="streak-value-bar"
                style={{
                  position: "absolute",
                  display: "inline-block",
                  width: "1.25em",
                  height: "5px",
                  top: "calc(1.5em - 2.5px)",
                  background: "black",
                }}
              ></div>
            )}
            <div
              className={`streak-value-circle ${
                char === "1" ? "streak-value-completed" : ""
              }`}
              style={{
                height: "1.5em",
                width: "1.5em",
                borderRadius: "50%",
                border: "0.5em solid var(--accent-color-1)",
                boxSizing: "border-box",
                display: "inline-block",
                opacity: char === "1" ? "1" : "0.4",
                marginLeft: "1.25em",
                position: "absolute",
                top: "0.75em"
              }}
            ></div>
            {char === "1" && (chars[index + 1] === "1" || index === 5) && (
              <div
                className="streak-value-bar"
                style={{
                  position: "absolute",
                  display: "inline-block",
                  width: "1.25em",
                  height: "5px",
                  top: "calc(1.5em - 2.5px)",
                  right: 0,
                  background: "black",
                }}
              ></div>
            )}
            {/* {renderDate()} */}
          </div>
        );
      })}
      <CompleteTask></CompleteTask>
    </div>
  );
};

export default VisualStreak;
