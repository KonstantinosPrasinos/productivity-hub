import { useContext, useState } from "react";

import Chip from "../../components/buttons/Chip/Chip";
import Button from "../../components/buttons/Button/Button";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";

import Skeleton from "../../components/utilities/Skeleton/Skeleton";
import { AlertsContext } from "../../context/AlertsContext";
import Streak from "../../components/indicators/Streak/Streak";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import ColorInput from "../../components/inputs/ColorInput/ColorInput";
import CurrentProgress from "../../components/indicators/CurrentProgress/CurrentProgress";
import Alert from "../../components/utilities/Alert/Alert";
import styles from "./Playground.module.scss";
import TimePeriodModal from "@/components/inputs/TimePeriodModal/TimePeriodModal";
import TextButton from "../../components/buttons/TextButton/TextButton";
import ToggleButton from "../../components/buttons/ToggleButton/ToggleButton";
import IconButton from "../../components/buttons/IconButton/IconButton";
import {TbHome} from "react-icons/tb";
import HeaderExtendContainer from "../../components/containers/HeaderExtendContainer/HeaderExtendContainer";
import {AnimatePresence, motion} from "framer-motion";
import TimeInput from "../../components/inputs/TimeInput/TimeInput";
import TextSwitchContainer from "../../components/containers/TextSwitchContainer/TextSwitchContainer";

const Playground = () => {
  const alertsContext = useContext(AlertsContext);
  const [selected, setSelected] = useState(0);
  const [isToggled, setIsToggled] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const chipGroup = ["Option 1", "Option 2", "Option 3"];
  const [textSwitch, setTextSwitch] = useState(9);

  const [textValue, setTextValue] = useState("");
  const [numberValue, setNumberValue] = useState(0);
  const [calendarValue, setCalendarValue] = useState("");
  const [hourValue, setHourValue] = useState(20);
  const [minuteValue, setMinuteValue] = useState(20)

  const testingTask = {
      type: 'Number',
      goal: {
          number: 100
      },
      previousEntries: {
          mostRecent: 10,
      },
      _id: "22",
      step: 10
  }

  const handleChangeText = () => {
      setTextSwitch(current => current + 1)
  }


  return (
    <div className={styles.container}>
        <InputWrapper label={"Alerts"} type={"vertical"}>
            {/*<Alert type={"error"} message={"This is an error"}></Alert>*/}
            {/*<Alert type={"warning"} message={"This is a warning"}></Alert>*/}
            {/*<Alert type={"success"} message={"This is a success"}></Alert>*/}
            {/*<Alert type={"info"} message={"This is an info"}></Alert>*/}
            <Button
                onClick={() => {
                    alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "warning", message: "Hello there, this is a warning"}})
                }}
            >
                Add warning alert
            </Button>
        </InputWrapper>

        <InputWrapper label={"Text Inputs"}>
            <InputWrapper label={"Text (Default)"}>
                <TextBoxInput type={"text"} value={textValue} setValue={setTextValue} /> {/* Default */}
            </InputWrapper>
            <InputWrapper label={"Password"}>
                <TextBoxInput type={"password"} value={textValue} setValue={setTextValue} />
            </InputWrapper>
            <InputWrapper label={"Number"}>
                <TextBoxInput type={"number"} value={numberValue} setValue={setNumberValue} />
            </InputWrapper>
            <InputWrapper label={"Calendar"}>
                <TextBoxInput type={"calendar"} value={calendarValue} setValue={setCalendarValue} />
            </InputWrapper>
        </InputWrapper>
        <InputWrapper label={"Text Input Sizes"}>
            <InputWrapper label={"Size Small"}>
                <TextBoxInput size={"small"} />
            </InputWrapper>
            <InputWrapper label={"Size Medium (Default)"}>
                <TextBoxInput size={"medium"} /> {/* Default */}
            </InputWrapper>
            <InputWrapper label={"Size Large"}>
                <TextBoxInput size={"large"} />
            </InputWrapper>
            <InputWrapper label={"Size Max (Fills the containers width)"}>
                <TextBoxInput size={"max"} />
            </InputWrapper>
        </InputWrapper>
        <InputWrapper label={"Text Input Styles"}>
            <InputWrapper label={"Invalid True"}>
                <TextBoxInput invalid={true} />
            </InputWrapper>
            <InputWrapper label={"Align Left (Default)"}>
                <TextBoxInput alignment={"left"} /> {/* Default */}
            </InputWrapper>
            <InputWrapper label={"Align Center"}>
                <TextBoxInput alignment={"center"} />
            </InputWrapper>
            <InputWrapper label={"Align Right"}>
                <TextBoxInput alignment={"right"} />
            </InputWrapper>
        </InputWrapper>

        {/*<InputWrapper label={"Color Input"}>*/}
        {/*    <ColorInput />*/}
        {/*</InputWrapper>*/}

        {/*<InputWrapper label={"Drop Down Input"}>*/}
        {/*    <DropDownInput options={["Option1", "Option2", "Option3"]}></DropDownInput>*/}
        {/*</InputWrapper>*/}

        {/*<InputWrapper label={"Time Period Input"}>*/}
        {/*    <div className={styles.alignTopContainer}>*/}
        {/*        <InputWrapper label={"In a week"}>*/}
        {/*            <TimePeriodModal timePeriod={"Weeks"} />*/}
        {/*        </InputWrapper>*/}
        {/*        <InputWrapper label={"In a month"}>*/}
        {/*            <TimePeriodModal timePeriod={"Months"} />*/}
        {/*        </InputWrapper>*/}
        {/*        <InputWrapper label={"In a year"}>*/}
        {/*            <TimePeriodModal timePeriod={"Years"} />*/}
        {/*        </InputWrapper>*/}
        {/*    </div>*/}
        {/*</InputWrapper>*/}

        <InputWrapper label={"Normal Button Styles"}>
            <div className={styles.alignTopContainer}>
                <InputWrapper label={"Default (size: medium, filled: true, type: round)"}>
                    <Button onClick={() => console.log("clicked")}>Button</Button>
                </InputWrapper>
                <InputWrapper label={"Size Small"}>
                    <Button size={"small"}>Button</Button>
                </InputWrapper>
                <InputWrapper label={"Size Large"}>
                    <Button size={"large"}>Button</Button>
                </InputWrapper>
                <InputWrapper label={"Type Square"}>
                    <Button type={"square"}>Button</Button>
                </InputWrapper>
                <InputWrapper label={"Filled False"}>
                    <Button filled={false}>Button</Button>
                </InputWrapper>
                <InputWrapper label={"Width Max (Fills the containers width)"}>
                    <Button width={"max"}>Button</Button>
                </InputWrapper>
            </div>
        </InputWrapper>

        <InputWrapper label={"Etc Buttons"}>
            <InputWrapper label={"Text Button"}>
                <TextButton>Click me!</TextButton>
            </InputWrapper>
            <InputWrapper label={"Toggle Button"}>
                <ToggleButton isToggled={isToggled} setIsToggled={setIsToggled}>Click me</ToggleButton>
            </InputWrapper>
            <InputWrapper label={"Icon Button"}>
                <IconButton>
                    <TbHome />
                </IconButton>
            </InputWrapper>
        </InputWrapper>
        <InputWrapper label={"Chips"}>
            {chipGroup.map((value, index) => (
                <Chip key={index} selected={selected} value={value} setSelected={setSelected}>{value}</Chip>
            ))}
        </InputWrapper>

        <InputWrapper label={"Header Extension Container"}>
            <HeaderExtendContainer header={<div>header</div>}>
                <div>Hello</div>
            </HeaderExtendContainer>
        </InputWrapper>
        <TimeInput hour={hourValue} setHour={setHourValue} minute={minuteValue} setMinute={setMinuteValue} />
        <InputWrapper label={"Text switch container"}>
            <TextSwitchContainer>
                {textSwitch}
            </TextSwitchContainer>
            <button onClick={handleChangeText}>Click me to change text</button>
        </InputWrapper>

      {/*<Button onClick={() => console.log("Clicked!")}>*/}
      {/*  Click me*/}
      {/*</Button>*/}
      {/*<div className="Title">Task Name</div>*/}
      {/*<span className="Label">This is a headline:</span>*/}
      {/*<DropDownInput options={["Option 1", "Option 2", "Option 3"]}>*/}
      {/*  Number*/}
      {/*</DropDownInput>*/}
      {/*<input*/}
      {/*  type="text"*/}
      {/*  className="Title Title-Input"*/}
      {/*  placeholder="Add Title"*/}
      {/*/>*/}
      {/*<TextBoxInput placeholder={"Number"}></TextBoxInput>*/}
      {/*<TextBoxInput placeholder={"Number"} type={"number"}></TextBoxInput>*/}
      {/*<TextBoxInput placeholder={"Number"} icon={<EmailIcon />}></TextBoxInput>*/}
      {/* <RedirectButton
            icon={<InfoIcon />}
            label={"About"}
            location={"/settings/about"}
          /> */}
        {/*<div className="Horizontal-Flex-Container">*/}
        {/*    <Skeleton width="100px" height="100px" borderRadius="100px"></Skeleton>*/}
        {/*    <div className="Stack-Container">*/}
        {/*        <Skeleton width="500px" height="10px" borderRadius="8px"></Skeleton>*/}
        {/*        <Skeleton width="500px" height="10px" borderRadius="8px"></Skeleton>*/}
        {/*        <Skeleton width="500px" height="10px" borderRadius="8px"></Skeleton>*/}
        {/*        <Skeleton width="500px" height="10px" borderRadius="8px"></Skeleton>*/}
        {/*        <Skeleton width="500px" height="10px" borderRadius="8px"></Skeleton>*/}
        {/*    </div>*/}
        {/*</div>*/}
        {/*<button onClick={() => {alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Hello there this is a warning"}})}}>Add error</button>*/}
        {/*<button onClick={() => {setPercentage(percentage + 5)}}>Increase percentage by 5</button>*/}
        {/*<button onClick={() => {setPercentage(percentage - 5)}}>Decrease percentage by 5</button>*/}
        {/*<Streak streak={"0101110"}></Streak>*/}
        {/*<CurrentProgress task={testingTask}></CurrentProgress>*/}
        {/*<InputWrapper label="Ends at:"><TextBoxInput placeholder={"Number"}></TextBoxInput></InputWrapper>*/}
        {/*<ColorInput selected={'red'} setSelected={() => {}}></ColorInput>*/}
        {/*<Task tasks={[{title: 'Workout', streak: '100110'}, {title: 'Workout', streak: '100110'}]}></Task>*/}
    </div>
  );
};

export default Playground;
