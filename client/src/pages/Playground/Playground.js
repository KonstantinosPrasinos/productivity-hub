import { useContext, useState } from "react";

import styles from "./Playground.module.scss";

import Chip from "../../components/buttons/Chip/Chip";
import FilledButton from "../../components/buttons/FilledButton/FilledButton";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";

import Skeleton from "../../components/utilities/Skeleton/Skeleton";
import AlertHandler from "../../components/utilities/AlertHandler/AlertHandler";
import { AlertsContext } from "../../context/AlertsContext";
import CurrentProgress from "../../components/indicators/CurrentProgress/CurrentProgress";
import VisualStreak from "../../components/indicators/VisualStreak/VisualStreak";

import EmailIcon from '@mui/icons-material/Email';
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import PriorityIndicator from "../../components/indicators/PriorityIndicator/PriorityIndicator";
import ColorInput from "../../components/inputs/ColorInput/ColorInput";
import Task from "../../components/indicators/Task/Task";

const Playground = () => {
  const alertsContext = useContext(AlertsContext);
  const [selected, setSelected] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const chipGroup = ["Option 1", "Option 2", "Option 3"];

  return (
    <div className={styles.container}>
      <div>
        {chipGroup.map((chip, index) => (
          <Chip
            selected={selected}
            setSelected={setSelected}
            index={index}
            key={index}
          >
            {chip}
          </Chip>
        ))}
      </div>
      <FilledButton onClick={() => console.log("Clicked!")}>
        Click me
      </FilledButton>
      <div className="Title">Task Name</div>
      <span className="Label">This is a headline:</span>
      <DropDownInput options={["Option 1", "Option 2", "Option 3"]}>
        Number
      </DropDownInput>
      <input
        type="text"
        className="Title Title-Input"
        placeholder="Add Title"
      />
      <TextBoxInput placeholder={"Number"}></TextBoxInput>
      <TextBoxInput placeholder={"Number"} type={"number"}></TextBoxInput>
      <TextBoxInput placeholder={"Number"} icon={<EmailIcon />}></TextBoxInput>
      {/* <RedirectButton
            icon={<InfoIcon />}
            label={"About"}
            location={"/settings/about"}
          /> */}
        <div className="Horizontal-Flex-Container">
            <Skeleton width="100px" height="100px" borderRadius="100px"></Skeleton>
            <div className="Stack-Container">
                <Skeleton width="500px" height="10px" borderRadius="8px"></Skeleton>
                <Skeleton width="500px" height="10px" borderRadius="8px"></Skeleton>
                <Skeleton width="500px" height="10px" borderRadius="8px"></Skeleton>
                <Skeleton width="500px" height="10px" borderRadius="8px"></Skeleton>
                <Skeleton width="500px" height="10px" borderRadius="8px"></Skeleton>
            </div>
        </div>
        {/* <Alert type={"error"} message={"You kinda suck"}></Alert>
        <Alert type={"warning"} message={"You kinda suck"}></Alert>
        <Alert type={"success"} message={"You kinda suck"}></Alert>
        <Alert type={"info"} message={"You kinda suck"}></Alert> */}
        <button onClick={() => {alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "warning", message: "Hello there this is a warning"}})}}>Add warning</button>
        <button onClick={() => {alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Hello there this is a warning"}})}}>Add error</button>
        <button onClick={() => {setPercentage(percentage + 5)}}>Increase percentage by 5</button>
        <button onClick={() => {setPercentage(percentage - 5)}}>Decrease percentage by 5</button>
        <AlertHandler></AlertHandler>
        {/*<CurrentProgress current={percentage} total={100} setCurrent={setPercentage} step={5}></CurrentProgress>*/}
        <VisualStreak streak={"010111"}></VisualStreak>
        <InputWrapper label="Ends at:"><TextBoxInput placeholder={"Number"}></TextBoxInput></InputWrapper>
        <PriorityIndicator></PriorityIndicator>
        <ColorInput selected={'red'} setSelected={() => {}}></ColorInput>
        <Task tasks={[{title: 'Workout', streak: '100110'}, {title: 'Workout', streak: '100110'}]}></Task>
    </div>
  );
};

export default Playground;
