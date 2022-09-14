import { useContext, useState } from "react";

import styles from "./Playground.module.scss";

import Chip from "../../components/buttons/Chip/Chip";
import FilledButton from "../../components/buttons/FilledButton/FilledButton";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import RedirectButton from "../../components/buttons/RedirectButton/RedirectButton";

import InfoIcon from "@mui/icons-material/Info";
import Skeleton from "../../components/indicators/Skeleton/Skeleton";
import Alert from "../../components/etc/Alert/Alert";
import AlertHandler from "../../components/utilities/AlertHandler/AlertHandler";
import { AlertsContext } from "../../context/AlertsContext";

const Playground = () => {
    const alertsContext = useContext(AlertsContext);
  const [selected, setSelected] = useState(0);
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
      <div className={styles.test}>
        <TextBoxInput placeholder={"Number"}></TextBoxInput>
        <TextBoxInput placeholder={"Number"} type={"number"}></TextBoxInput>
      </div>
      {/* <RedirectButton
            icon={<InfoIcon />}
            label={"About"}
            location={"/settings/about"}
          /> */}
        <Skeleton width="100px" height="100px" borderRadius="8px"></Skeleton>
        <Alert type={"error"} message={"You kinda suck"}></Alert>
        <Alert type={"warning"} message={"You kinda suck"}></Alert>
        <Alert type={"success"} message={"You kinda suck"}></Alert>
        <Alert type={"info"} message={"You kinda suck"}></Alert>
        <button onClick={() => {alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "warning", message: "Hello there this is a warning"}})}}>Add warning</button>
        <button onClick={() => {alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Hello there this is a warning"}})}}>Add error</button>
        <AlertHandler></AlertHandler>
    </div>
  );
};

export default Playground;
