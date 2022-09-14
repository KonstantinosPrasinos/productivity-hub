import { useState } from "react";

import styles from "./Playground.module.scss";

import Chip from "../../components/buttons/Chip/Chip";
import FilledButton from "../../components/buttons/FilledButton/FilledButton";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import RedirectButton from "../../components/buttons/RedirectButton/RedirectButton";

import InfoIcon from "@mui/icons-material/Info";
import Skeleton from "../../components/indicators/Skeleton/Skeleton";

const Playground = () => {
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
            {" "}
            {chip}{" "}
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
      <RedirectButton
            icon={<InfoIcon />}
            label={"About"}
            location={"/settings/about"}
          />
        <Skeleton width="100px" height="100px" borderRadius="8px"></Skeleton>
    </div>
  );
};

export default Playground;
