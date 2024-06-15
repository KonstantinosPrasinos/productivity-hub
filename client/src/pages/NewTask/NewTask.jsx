import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import PriorityIndicator from "../../components/indicators/PriorityIndicator/PriorityIndicator";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import ToggleButton from "../../components/buttons/ToggleButton/ToggleButton";
import Chip from "../../components/buttons/Chip/Chip";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import { AlertsContext } from "../../context/AlertsContext";
import { MiniPagesContext } from "../../context/MiniPagesContext";
import { TbPlus } from "react-icons/tb";
import TimePeriodModal from "@/components/inputs/TimePeriodModal/TimePeriodModal";
import { useGetTasks } from "../../hooks/get-hooks/useGetTasks";
import { useGetCategories } from "../../hooks/get-hooks/useGetCategories";
import { useGetGroups } from "../../hooks/get-hooks/useGetGroups";
import { useAddTask } from "../../hooks/add-hooks/useAddTask";
import { useGetSettings } from "../../hooks/get-hooks/useGetSettings";
import { findStartingDates } from "../../functions/findStartingDates";
import { useChangeTask } from "../../hooks/change-hooks/useChangeTask";
import HeaderExtendContainer from "../../components/containers/HeaderExtendContainer/HeaderExtendContainer";
import styles from "./NewTask.module.scss";
import Button from "@/components/buttons/Button/Button";
import TimeInput from "@/components/inputs/TimeInput/TimeInput";
import CollapsibleContainer from "@/components/containers/CollapsibleContainer/CollapsibleContainer";

// const causesOfExpiration = ['End of goal', 'Date', 'Never'];
// const taskType = ['Checkbox', 'Number'];
const goalLimits = ["At most", "Exactly", "At least"];
const timePeriods = ["Days", "Weeks", "Months", "Years"];
const repeatTypes = ["Custom Rules", "Repeatable Category"];
const goalTypes = ["Streak", "Total"];

const NewTask = ({ index, length, id }) => {
  const { isLoading: categoriesLoading, data: categories } = useGetCategories();
  const { isLoading: groupsLoading, data: groups } = useGetGroups();
  const { isLoading, data: tasks } = useGetTasks();
  const { data: settings } = useGetSettings();

  const { mutate: addTask } = useAddTask();
  const { mutate: changeTask } = useChangeTask();

  const alertsContext = useContext(AlertsContext);
  const miniPagesContext = useContext(MiniPagesContext);

  const titleRef = useRef();
  const descriptionRef = useRef();

  const [isNumberTask, setIsNumberTask] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState(settings.defaults.step);
  const [hasGoal, setHasGoal] = useState(false);
  const [goalLimit, setGoalLimit] = useState("At least");
  const [goalNumber, setGoalNumber] = useState(settings.defaults.goal);
  const [category, setCategory] = useState("None");
  const [priority, setPriority] = useState(settings.defaults.priority);
  const [repeats, setRepeats] = useState(false);
  const [hasLongGoal, setHasLongGoal] = useState(false);
  const [longGoalLimit, setLongGoalLimit] = useState("At least");
  const [longGoalNumber, setLongGoalNumber] = useState(settings.defaults.goal);
  const [longGoalType, setLongGoalType] = useState("Streak");
  // const [expiresAt, setExpiresAt] = useState('Never');
  const [timeGroup, setTimeGroup] = useState({ title: "None", _id: undefined });
  const [hasTime, setHasTime] = useState(false);
  const [startHour, setStartHour] = useState("00");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("23");
  const [endMinute, setEndMinute] = useState("59");
  const [repeatNumber, setRepeatNumber] = useState(settings.defaults.priority);
  const [timePeriod, setTimePeriod] = useState("Weeks");
  const [timePeriod2, setTimePeriod2] = useState([]);
  const [repeatType, setRepeatType] = useState("Custom Rules");
  const [dateModalIsVisible, setDateModalIsVisible] = useState(false);

  const repeatCategories = useMemo(() => {
    if (categoriesLoading) return [];
    return categories.filter((category) => !isNaN(category.repeatRate?.number));
  }, [categories, categoriesLoading]);

  const nonRepeatCategories = useMemo(() => {
    if (categoriesLoading) return [];
    return categories.filter((category) => isNaN(category.repeatRate?.number));
  }, [categories]);

  const categorySubcategories = useMemo(() => {
    if (categoriesLoading || groupsLoading || !category?._id)
      return [{ title: "None", _id: null }];
    return groups.filter((group) => group.parent === category._id);
  }, [category, groups, groupsLoading]);

  const handleKeyDown = (e) => {
    if (e.code === "Enter") {
      handleSave();
    }
  };

  const findMatchingGroups = () => {
    const tempGroups = [{ title: "None", _id: undefined }];

    if (groupsLoading) return tempGroups;

    tempGroups.push(...groups.filter((group) => group.parent === category._id));

    return tempGroups;
  };

  const categoryGroups = useMemo(findMatchingGroups, [
    groupsLoading,
    categories,
    category,
  ]);

  useEffect(() => {
    // Fill in all the fields if editing task
    if (id && !isLoading) {
      const task = tasks.find((task) => task._id === id);

      setTitle(task.title);

      // To add parity with older tasks
      if (task.description) {
        handleDescriptionChange({ target: { value: task.description } });
      }

      if (task.type === "Number") {
        setIsNumberTask(true);
        setStep(task.step);
        if (task?.goal?.type) {
          setHasGoal(true);
          setGoalLimit(task.goal.type);
          setGoalNumber(task.goal.number);
        }
      }

      if (task.category) {
        setCategory(
          categories.find((tempCategory) => tempCategory._id === task.category)
        );

        if (task.group) {
          const group = groups.find((group) => group._id === task.group);

          setTimeGroup(group);
        }
      }

      setPriority(task.priority);
      setRepeats(task.repeats);

      if (task.repeats) {
        if (task.longGoal?.type) {
          setHasLongGoal(true);
          setLongGoalLimit(task.longGoal.type);
          setLongGoalNumber(task.longGoal.number);
        }

        if (task.group) {
          setRepeatType("Repeatable Category");
          setTimeGroup(groups.find((group) => group._id === task.group));
        } else {
          setRepeatNumber(task.repeatRate.number);
          setTimePeriod(task.repeatRate.bigTimePeriod);
          setTimePeriod2(task.repeatRate.smallTimePeriod);
          if (task.repeatRate.time?.start) {
            setHasTime(true);
            setStartHour(task.repeatRate.time.start.substring(0, 2));
            setStartMinute(task.repeatRate.time.start.substring(2));
            setEndHour(task.repeatRate.time.end.substring(0, 2));
            setEndMinute(task.repeatRate.time.end.substring(2));
          }
        }
      }
    }

    // Focus the title textbox
    if (titleRef.current) {
      titleRef.current?.focus();
    }
  }, [isLoading]);

  const handleSave = async () => {
    // The rules for if the task can be created are:
    // a) title always required
    // b) priority, type, category and repeats are also technically required, but they are pre-filled
    // c) if the task type is set to Number then goal type, goal number and step are also required
    // d) if repeat is set to true then long term goal type and number are required
    // e) if repeat is set to true then the user can input a time group of the category selected (if selected) or custom rules.
    //    In both cases repeat rate is required. In the case of the group it is copied from the group.
    //    This is done so that if the user decides to delete the group, they can keep their repeat data.

    // First check that all the categories and groups have loaded. Also do the first check.
    if (categoriesLoading || groupsLoading) {
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          title: "Categories loading",
          message: "Please wait until the categories are done loading.",
        },
      });
      return;
    }

    if (!title) {
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          title: "Task Title is Missing",
          message: "Tasks must have a title. Please enter a title to continue.",
        },
      });
      return;
    }

    if (description.length > 500) {
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          title: "Description too big",
          message: "The maximum length for the description is 500 characters.",
        },
      });
      return;
    }

    let repeatParameters = undefined;

    if (repeats) {
      if (repeatType === "Custom Rules") {
        if (repeatNumber.toString().length === 0) {
          alertsContext.dispatch({
            type: "ADD_ALERT",
            payload: {
              type: "error",
              title: "Repeat Number is Missing",
              message:
                "For the task to repeat using custom rules, you need to input a repeat number.",
            },
          });
          return;
        }

        if (timePeriod2.length === 0) {
          alertsContext.dispatch({
            type: "ADD_ALERT",
            payload: {
              type: "error",
              title: "No repeat days selected",
              message: "You must select at least one day to repeat on",
            },
          });
          return;
        }

        repeatParameters = {
          number: repeatNumber,
          bigTimePeriod: timePeriod,
          smallTimePeriod: timePeriod2,
          startingDate: findStartingDates(timePeriod, timePeriod2),
        };

        if (hasTime) {
          repeatParameters.time = {
            start: startHour.concat(startMinute),
            end: endHour.concat(endMinute),
          };
        }

        if (hasLongGoal) {
          if (longGoalNumber.toString().length === 0) {
            alertsContext.dispatch({
              type: "ADD_ALERT",
              payload: {
                type: "error",
                title: "Long Term Goal Number is Missing",
                message:
                  "For the task to have a long term goal, you need to input a goal number.",
              },
            });
            return;
          }

          repeatParameters.longGoal = {
            limit: longGoalLimit,
            type: longGoalType,
            number: longGoalNumber,
          };
        }
      } else {
        // Repeatable Category
        if (category === "None") {
          alertsContext.dispatch({
            type: "ADD_ALERT",
            payload: {
              type: "error",
              title: "Repeat Category is Missing",
              message:
                "For the task to repeat using a repeat category, you need to select a category.",
            },
          });
          return;
        }

        // For some reason if I do repeatRate: category.repeatRate and then change something on the repeatRate, the category mutates ㄟ( ▔, ▔ )ㄏ
        repeatParameters = {
          repeatRate: {
            startingDate: [...category.repeatRate.startingDate],
            number: category.repeatRate.number,
            bigTimePeriod: category.repeatRate.bigTimePeriod,
          },
          longGoal: category.goal,
        };

        if (timeGroup._id) {
          repeatParameters.repeatRate.smallTimePeriod =
            timeGroup.repeatRate.smallTimePeriod;
          repeatParameters.repeatRate.startingDate =
            timeGroup.repeatRate.startingDate;
        }
      }
    }

    const typeParameters = {
      type: "Checkbox",
    };

    if (isNumberTask) {
      typeParameters.type = "Number";
      typeParameters.step = step;

      if (hasGoal) {
        typeParameters.goal = {
          limit: goalLimit,
          number: goalNumber,
        };
      }
    }

    const task = {
      title,
      priority,
      repeats,
      description: description.length > 0 ? description : undefined,
      category: category._id,
      group: timeGroup?._id ? timeGroup._id : undefined,
      ...typeParameters,
      ...repeatParameters,
    };

    if (id) {
      // Editing task
      await changeTask({ ...task, _id: id });
    } else {
      // Creating task
      await addTask(task);
    }

    miniPagesContext.dispatch({ type: "REMOVE_PAGE", payload: "" });
  };

  const toggleDateModal = () => {
    setDateModalIsVisible((current) => !current);
  };

  const handleDescriptionChange = (event) => {
    const textarea = descriptionRef.current;

    setDescription(event.target.value);

    textarea.value = event.target.value;

    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + 1.8 + "px";
  };

  const handleSetCategory = (tempCategory) => {
    if (tempCategory !== category) {
      setCategory(tempCategory);
      setTimeGroup({ title: "None", _id: null });
    }
  };

  return (
    <>
      <MiniPageContainer
        onClickSave={handleSave}
        index={index}
        length={length}
        collapsedFocusedElement={titleRef}
      >
        <input
          type="text"
          className="Title-Large"
          placeholder="Add task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={titleRef}
        />
        <InputWrapper label="Description">
          <textarea
            className={styles.descriptionTextArea}
            wrap="hard"
            maxLength={500}
            value={description}
            onChange={handleDescriptionChange}
            rows={1}
            placeholder="Add task description"
            ref={descriptionRef}
          />
          <div className={styles.descriptionLengthCounter}>
            {description.length} / 500
          </div>
        </InputWrapper>
        <InputWrapper label="Priority">
          <TextBoxInput
            type="number"
            placeholder="Priority"
            value={priority}
            setValue={setPriority}
          />
          <PriorityIndicator />
        </InputWrapper>
        <InputWrapper
          label={"Category / Subcategory"}
          tooltipMessage={"Only categories that don't repeat show up here"}
        >
          <DropDownInput
            placeholder={"None"}
            selected={category?.title}
            isDisabled={repeats && repeatType === "Repeatable Category"}
          >
            <button
              onClick={() => handleSetCategory("None")}
              className={styles.dropDownOption}
            >
              None
            </button>
            {...nonRepeatCategories.map((tempCategory) => (
              <button
                className={styles.categoryOption}
                key={tempCategory.title}
                onClick={() => handleSetCategory(tempCategory)}
              >
                <div
                  className={`${styles.categoryChipColor} ${tempCategory.color}`}
                ></div>
                <span>{tempCategory.title}</span>
              </button>
            ))}
            <button
              className={styles.dropDownOption}
              onClick={() =>
                miniPagesContext.dispatch({
                  type: "ADD_PAGE",
                  payload: { type: "new-category" },
                })
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              Add new
              <TbPlus />
            </button>
          </DropDownInput>
          <DropDownInput
            placeholder={"None"}
            selected={timeGroup?.title}
            isDisabled={
              (repeats && repeatType === "Repeatable Category") ||
              !category?._id
            }
          >
            <button
              onClick={() => setTimeGroup({ title: "None", _id: null })}
              className={styles.dropDownOption}
            >
              None
            </button>
            {...categorySubcategories.map((tempSubcategory) => (
              <button
                className={styles.categoryOption}
                key={tempSubcategory._id}
                onClick={() => setTimeGroup(tempSubcategory)}
              >
                {/* <div
                  className={`${styles.categoryChipColor} ${tempSubcategory.color}`}
                ></div> */}
                <span>{tempSubcategory.title}</span>
              </button>
            ))}
          </DropDownInput>
        </InputWrapper>
        <HeaderExtendContainer
          header={
            <div className={"Horizontal-Flex-Container Space-Between"}>
              <div className={"Title-Small"}>Turn into number task</div>
              <ToggleButton
                isToggled={isNumberTask}
                setIsToggled={setIsNumberTask}
              ></ToggleButton>
            </div>
          }
          extendOnClick={false}
          extendedInherited={isNumberTask}
          hasPointer={false}
        >
          <InputWrapper
            label="Step"
            tooltipMessage={"How much the number increases every time"}
          >
            <TextBoxInput
              type="number"
              placeholder="Step"
              value={step}
              setValue={setStep}
              minNumber={1}
              maxNumber={999}
            />
          </InputWrapper>
          <HeaderExtendContainer
            header={
              <div className={"Horizontal-Flex-Container Space-Between"}>
                <div className={"Title-Small"}>Add a goal</div>
                <ToggleButton isToggled={hasGoal} setIsToggled={setHasGoal} />
              </div>
            }
            extendOnClick={false}
            extendedInherited={hasGoal}
            hasPointer={false}
            hasOutline={false}
          >
            <InputWrapper>
              <DropDownInput
                placeholder={"Limit"}
                options={goalLimits}
                selected={goalLimit}
                isDisabled={!hasGoal}
              >
                {goalLimits.map((tempGoalLimit) => (
                  <button
                    className={styles.dropDownOption}
                    onClick={() => setGoalLimit(tempGoalLimit)}
                    key={tempGoalLimit}
                  >
                    {tempGoalLimit}
                  </button>
                ))}
              </DropDownInput>
              <TextBoxInput
                type="number"
                placeholder="Number"
                value={goalNumber}
                setValue={setGoalNumber}
                isDisabled={!hasGoal}
                minNumber={1}
              />
            </InputWrapper>
          </HeaderExtendContainer>
        </HeaderExtendContainer>
        <HeaderExtendContainer
          header={
            <div className={"Horizontal-Flex-Container Space-Between"}>
              <div className={"Title-Small"}>Make it repeat</div>
              <ToggleButton
                isToggled={repeats}
                setIsToggled={setRepeats}
              ></ToggleButton>
            </div>
          }
          extendOnClick={false}
          extendedInherited={repeats}
          hasPointer={false}
        >
          <InputWrapper label={"Repeat using"}>
            {repeatTypes.map((item) => (
              <Chip
                key={item}
                value={item}
                selected={repeatType}
                setSelected={setRepeatType}
              >
                {item}
              </Chip>
            ))}
          </InputWrapper>
          <CollapsibleContainer
            hasBorder={false}
            isVisible={repeatType === "Custom Rules"}
          >
            <InputWrapper label={"Repeat every"}>
              <TextBoxInput
                type="number"
                placeholder="Number"
                value={repeatNumber}
                setValue={setRepeatNumber}
                minNumber={1}
              />
              <DropDownInput placeholder={"Weeks"} selected={timePeriod}>
                {timePeriods.map((tempTimePeriod) => (
                  <button
                    className={"DropDownOption"}
                    onClick={() => setTimePeriod(tempTimePeriod)}
                    key={tempTimePeriod}
                  >
                    {tempTimePeriod}
                  </button>
                ))}
              </DropDownInput>
            </InputWrapper>
            <InputWrapper
              label={"On"}
              tooltipMessage={'Required: repeat rate bigger than "day"'}
            >
              <Button
                onClick={toggleDateModal}
                disabled={timePeriod === "Days"}
                size={"small"}
              >
                Select dates
              </Button>
            </InputWrapper>
            <HeaderExtendContainer
              header={
                <div className={"Horizontal-Flex-Container Space-Between"}>
                  <div className={"Title-Small"}>Repeat time range</div>
                  <ToggleButton isToggled={hasTime} setIsToggled={setHasTime} />
                </div>
              }
              extendOnClick={false}
              extendedInherited={
                hasTime && repeats && repeatType === "Custom Rules"
              }
              hasPointer={false}
              hasOutline={false}
              isDisabled={!repeats || repeatType !== "Custom Rules"}
            >
              <InputWrapper>
                <TimeInput
                  hour={startHour}
                  setHour={setStartHour}
                  minute={startMinute}
                  setMinute={setStartMinute}
                  isDisabled={!hasTime}
                />
                -
                <TimeInput
                  hour={endHour}
                  setHour={setEndHour}
                  minute={endMinute}
                  setMinute={setEndMinute}
                  isDisabled={!hasTime}
                />
              </InputWrapper>
            </HeaderExtendContainer>
            <HeaderExtendContainer
              header={
                <div className={"Horizontal-Flex-Container Space-Between"}>
                  <div className={"Title-Small"}>Add a long term goal</div>
                  <ToggleButton
                    isToggled={hasLongGoal}
                    setIsToggled={setHasLongGoal}
                  ></ToggleButton>
                </div>
              }
              extendOnClick={false}
              extendedInherited={
                hasLongGoal && repeats && repeatType === "Custom Rules"
              }
              hasPointer={false}
              hasOutline={false}
              isDisabled={!repeats || repeatType !== "Custom Rules"}
            >
              <InputWrapper>
                <DropDownInput
                  placeholder={"Type"}
                  selected={longGoalType}
                  isDisabled={!hasLongGoal}
                  widthBasedOnChildren={true}
                >
                  {goalTypes.map((tempGoalType) => (
                    <button
                      className={styles.dropDownOption}
                      onClick={() => setLongGoalType(tempGoalType)}
                      key={tempGoalType}
                    >
                      {tempGoalType}
                    </button>
                  ))}
                </DropDownInput>
                <DropDownInput
                  placeholder={"Limit"}
                  selected={longGoalLimit}
                  isDisabled={!hasLongGoal}
                  widthBasedOnChildren={true}
                >
                  {goalLimits.map((tempGoalLimit) => (
                    <button
                      className={styles.dropDownOption}
                      onClick={() => setLongGoalLimit(tempGoalLimit)}
                      key={tempGoalLimit}
                    >
                      {tempGoalLimit}
                    </button>
                  ))}
                </DropDownInput>
                <TextBoxInput
                  type="number"
                  placeholder="Number"
                  value={longGoalNumber}
                  setValue={setLongGoalNumber}
                  isDisabled={!hasLongGoal}
                  minNumber={1}
                />
              </InputWrapper>
            </HeaderExtendContainer>
          </CollapsibleContainer>
          <CollapsibleContainer
            hasBorder={false}
            isVisible={repeatType === "Repeatable Category"}
          >
            <InputWrapper label={"Repeatable Category / Subcategory"}>
              <DropDownInput placeholder={"None"} selected={category?.title}>
                <button
                  onClick={() => handleSetCategory("None")}
                  className={styles.dropDownOption}
                >
                  None
                </button>
                {...repeatCategories.map((tempCategory) => (
                  <button
                    className={styles.dropDownOption}
                    key={tempCategory.title}
                    onClick={() => handleSetCategory(tempCategory)}
                  >
                    {tempCategory.title}
                  </button>
                ))}
                <button
                  className={styles.dropDownOption}
                  onClick={() =>
                    miniPagesContext.dispatch({
                      type: "ADD_PAGE",
                      payload: { type: "new-category" },
                    })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Add new
                  <TbPlus />
                </button>
              </DropDownInput>
              <DropDownInput
                placeholder={"None"}
                isDisabled={
                  repeatType !== "Repeatable Category" ||
                  category === "None" ||
                  categoryGroups.length === 1
                }
                setSelected={setTimeGroup}
                selected={timeGroup?.title}
              >
                {categoryGroups.map((tempTimeGroup, index) => (
                  <button
                    className={styles.dropDownOption}
                    key={index}
                    onClick={() => setTimeGroup(tempTimeGroup)}
                  >
                    {tempTimeGroup.title}
                  </button>
                ))}
              </DropDownInput>
            </InputWrapper>
          </CollapsibleContainer>
        </HeaderExtendContainer>
      </MiniPageContainer>
      {dateModalIsVisible && (
        <TimePeriodModal
          timePeriod={timePeriod}
          timePeriod2={timePeriod2}
          setTimePeriod2={setTimePeriod2}
          dismountFunction={toggleDateModal}
        />
      )}
    </>
  );
};

export default NewTask;
