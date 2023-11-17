import {useContext, useEffect, useMemo, useState} from "react";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import PriorityIndicator from "../../components/indicators/PriorityIndicator/PriorityIndicator";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import ToggleButton from "../../components/buttons/ToggleButton/ToggleButton";
import Chip from "../../components/buttons/Chip/Chip";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import {AlertsContext} from "../../context/AlertsContext";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import {TbChevronDown, TbPlus} from "react-icons/tb";
import TimePeriodModal from "@/components/inputs/TimePeriodModal/TimePeriodModal";
import {useGetTasks} from "../../hooks/get-hooks/useGetTasks";
import {useGetCategories} from "../../hooks/get-hooks/useGetCategories";
import {useGetGroups} from "../../hooks/get-hooks/useGetGroups";
import {useAddTask} from "../../hooks/add-hooks/useAddTask";
import {useGetSettings} from "../../hooks/get-hooks/useGetSettings";
import {findStartingDates} from "../../functions/findStartingDates";
import {useChangeTask} from "../../hooks/change-hooks/useChangeTask";
import HeaderExtendContainer from "../../components/containers/HeaderExtendContainer/HeaderExtendContainer";
import IconButton from "../../components/buttons/IconButton/IconButton";
import {motion} from "framer-motion";
import styles from "./NewTask.module.scss";
import TextSwitchContainer from "../../components/containers/TextSwitchContainer/TextSwitchContainer";
import {capitalizeFirstCharacter} from "../../functions/capitalizeFirstCharacter";
import Button from "@/components/buttons/Button/Button";
import TimeInput from "@/components/inputs/TimeInput/TimeInput";

const NewTask = ({index, length, id}) => {
    const {isLoading: categoriesLoading, data: categories} = useGetCategories();

    const {data: settings} = useGetSettings();

    const {mutate: addTask} = useAddTask();
    const {mutate: changeTask} = useChangeTask();


    const [title, setTitle] = useState('');
    const [type, setType] = useState('Checkbox');
    const [step, setStep] = useState(settings.defaults.step);
    const [hasGoal, setHasGoal] = useState(false);
    const [goalLimit, setGoalLimit] = useState('At least');
    const [goalNumber, setGoalNumber] = useState(settings.defaults.goal);
    const [category, setCategory] = useState('None');
    const [priority, setPriority] = useState(settings.defaults.priority);
    const [repeats, setRepeats] = useState(false);

    const [hasLongGoal, setHasLongGoal] = useState(false);
    const [longGoalLimit, setLongGoalLimit] = useState('At least');
    const [longGoalNumber, setLongGoalNumber] = useState(settings.defaults.goal);
    const [longGoalType, setLongGoalType] = useState("Streak");

    // const [expiresAt, setExpiresAt] = useState('Never');
    const [timeGroup, setTimeGroup] = useState({title: "None", _id: undefined});
    const [hasTime, setHasTime] = useState(false);
    const [startHour, setStartHour] = useState('00');
    const [startMinute, setStartMinute] = useState('00');
    const [endHour, setEndHour] = useState('23');
    const [endMinute, setEndMinute] = useState('59');

    const [repeatNumber, setRepeatNumber] = useState(settings.defaults.priority);
    const [timePeriod, setTimePeriod] = useState('Weeks');
    const [timePeriod2, setTimePeriod2] = useState([]);

    const [repeatType, setRepeatType] = useState('Custom Rules')

    const {isLoading: groupsLoading, data: groups} = useGetGroups();

    const {isLoading, data: tasks} = useGetTasks();

    const alertsContext = useContext(AlertsContext);
    const miniPagesContext = useContext(MiniPagesContext);

    const [extendedSection, setExtendedSection] = useState(0);
    const [dateModalIsVisible, setDateModalIsVisible] = useState(false);

    // const causesOfExpiration = ['End of goal', 'Date', 'Never'];
    const taskType = ['Checkbox', 'Number'];
    const goalLimits = ['At most', 'Exactly', 'At least'];
    const timePeriods = ['Days', 'Weeks', 'Months', 'Years'];
    const repeatTypes = ['Custom Rules', 'Time Group'];
    const goalTypes = ['Streak', 'Total completed', 'Total number'];

    const handleKeyDown = (e) => {
        if (e.code === 'Enter') {
            handleSave();
        }
    }

    const handleSetType = (e) => {
        if (e.type === "Checkbox" && goalTypes.indexOf(longGoalType) > 1) {
            setLongGoalType("Streak");
        }
        setType(e);
    }

    const findMatchingGroups = () => {
        const tempGroups = [{title: "None", _id: undefined}];

        if (groupsLoading) return tempGroups;

        tempGroups.push(...groups.filter(group => group.parent === category._id));

        return tempGroups;
    }

    const categoryGroups = useMemo(findMatchingGroups, [groupsLoading, categories, category]);

    useEffect(() => {
        if (id && !isLoading) {
            const task = tasks.find(task => task._id === id);

            setTitle(task.title);
            setType(task.type);

            if (task.type === 'Number') {
                setStep(task.step);
                if (task?.goal.type) {
                    setHasGoal(true);
                    setGoalLimit(task.goal.type);
                    setGoalNumber(task.goal.number);
                }
            }

            if (task.category) {
                setCategory(categories.find(tempCategory => tempCategory._id === task.category));
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
                    setRepeatType('Time Group');
                    setTimeGroup(groups.find(group => group._id === task.group));
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
    }, [isLoading]);

    const handleSave = async () => {
        const checkAllInputs = () => {
            if (title) {
                return true
            }
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You must input a title for the task"}})
            return false;
        }

        // The rules for if the task can be created are:
        // a) title always required
        // b) priority, type, category and repeats are also technically required, but they are pre-filled
        // c) if the task type is set to Number then goal type, goal number and step are also required
        // d) if repeat is set to true then long term goal type and number are required
        // e) if repeat is set to true then the user can input a time group of the category selected (if selected) or custom rules.
        //    In both cases repeat rate is required. In the case of the group it is copied from the group.
        //    This is done so that if the user decides to delete the group, they can keep their repeat data.

        // First check that all the categories and groups have loaded. Also do the first check.
        if (!categoriesLoading && !groupsLoading && checkAllInputs()) {
            let repeatProperties = {};

            if (!repeats) {
                repeatProperties = undefined;
            } else {
                if (repeatType === "Time Group") {
                    if (timeGroup.title !== "None") {
                        // Inherit groups repeat rate and goal
                        if (timeGroup) repeatProperties = {
                            repeatRate: timeGroup.repeatRate,
                            longGoal: timeGroup.goal,
                            group: timeGroup._id
                        };
                    } else {
                        alertsContext.dispatch({
                            type: "ADD_ALERT",
                            payload: {
                                type: "warning",
                                message: "You need to select a time group, select the custom rules options or toggle the repeats option to false."
                            }
                        })
                        return;
                    }
                } else {
                    // Repeat type is set to custom rules
                    const repeatRate = {
                        number: repeatNumber,
                        bigTimePeriod: timePeriod
                    };

                    if (timePeriod === "Days" ) {
                        repeatRate.smallTimePeriod = [];
                        repeatRate.startingDate = [(new Date()).setUTCHours(0, 0, 0, 0)];
                    }  else if (timePeriod2.length > 0) {
                      repeatRate.smallTimePeriod = timePeriod2;
                      repeatRate.startingDate = findStartingDates(timePeriod, timePeriod2);
                    } else {
                        alertsContext.dispatch({
                            type: "ADD_ALERT",
                            payload: {
                                type: "error",
                                message: "You need to enter at least one value into the \"On\" field."
                            }
                        })
                        return;
                    }

                    if (hasTime) {
                        if (
                            endHour !== "00" &&
                            (
                                (parseInt(startHour) < parseInt(endHour)) ||
                                (
                                    parseInt(startHour) === parseInt(endHour) &&
                                    parseInt(startMinute) < parseInt(endMinute)
                                )
                            )
                        ) {
                            repeatRate.time = {
                                start: startHour.concat(startMinute),
                                end: endHour.concat(endMinute)
                            }
                        } else {
                            alertsContext.dispatch({
                                type: "ADD_ALERT",
                                payload: {
                                    type: "error",
                                    message: "The \"from\" time must be before the \"after\" time."
                                }
                            })
                            return;
                        }
                    }

                    repeatProperties.repeatRate = repeatRate;
                }
            }

            const task = {
                title,
                type,
                priority,
                repeats,
                ...repeatProperties
            }

            if (category !== "None") {
                task.category = category._id;
            }

            if (task.type === "Number") {
                task.step = step;
                if (hasGoal) {
                    task.goal = {
                        type: goalLimit,
                        number: goalNumber,
                    }
                }
            }

            if (hasLongGoal) {
                task.longGoal = {
                    type: longGoalType,
                    limit: longGoalLimit,
                    number: longGoalNumber,
                }
            }

            if (id) {
                await changeTask({...task, _id: id});
            } else {
                await addTask(task);
            }

            miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''});
        }
    }

    const toggleDateModal = () => {
        setDateModalIsVisible(current => !current);
    }

    return (
        <>
            <MiniPageContainer
                onClickSave={handleSave}
                index={index}
                length={length}
            >
                <input
                    type="text"
                    className="Title-Large"
                    placeholder="Add task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <HeaderExtendContainer
                    header={(
                        <div className={"Horizontal-Flex-Container Space-Between"}>
                            <div className={styles.headerLeftSide}>
                                <div className={"Title-Medium"}>General options</div>
                                <motion.div className={`Label-Small ${styles.titleMedium}`}>
                                    <div>
                                        Type: <TextSwitchContainer>{type}</TextSwitchContainer>
                                    </div>
                                    <div>
                                        Category: <TextSwitchContainer>{category?.title ?? category}</TextSwitchContainer>
                                    </div>
                                    <div>
                                        Priority: <TextSwitchContainer>{priority}</TextSwitchContainer>
                                    </div>
                                </motion.div>
                            </div>
                            <IconButton>
                                <motion.div
                                    className={"Title-Large"}
                                    key={extendedSection === 0}
                                    initial={{rotate: extendedSection === 0 ? 0 : 180}}
                                    animate={{rotate: !(extendedSection === 0) ? 0 : 180}}
                                >
                                    <TbChevronDown />
                                </motion.div>
                            </IconButton>
                        </div>
                    )}
                    setExtendedInherited={() => {setExtendedSection(extendedSection === 0 ? null : 0)}}
                    extendedInherited={extendedSection === 0}
                >
                    <InputWrapper label="Type">
                        <div className={`Horizontal-Flex-Container`}>
                            {taskType.map((task, index) => (
                                <Chip
                                    selected={type}
                                    setSelected={handleSetType}
                                    value={task}
                                    key={index}
                                >
                                    {task}
                                </Chip>
                            ))
                            }
                        </div>
                    </InputWrapper>
                    <InputWrapper label={"Category"}>
                        <DropDownInput
                            placeholder={'None'}
                            selected={category?.title}
                        >
                            <button
                                onClick={() => setCategory("None")}
                                className={styles.dropDownOption}
                            >
                                None
                            </button>
                            {...categories.map(tempCategory => (
                                <button
                                    className={styles.dropDownOption}
                                    key={tempCategory.title}
                                    onClick={() => setCategory(tempCategory)}
                                >
                                    {tempCategory.title}
                                </button>
                            ))}
                            <button
                                className={styles.dropDownOption}
                                onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'new-category'}})}
                                style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}
                            >
                                Add new
                                <TbPlus />
                            </button>
                        </DropDownInput>
                    </InputWrapper>
                    <InputWrapper label="Priority">
                        <TextBoxInput type="number" placeholder="Priority" value={priority} setValue={setPriority}/>
                        <PriorityIndicator/>
                    </InputWrapper>
                </HeaderExtendContainer>
                <HeaderExtendContainer
                    header={(
                        <div className={"Horizontal-Flex-Container Space-Between"}>
                            <div className={styles.headerLeftSide}>
                                <div className={"Title-Medium"}>Number type options</div>
                                <motion.div className={`Label-Small ${styles.titleMedium}`}>
                                    <div>
                                        Goal type: <TextSwitchContainer>{hasGoal ? goalLimit : "None"}</TextSwitchContainer>
                                    </div>
                                    <div>
                                        Step: <TextSwitchContainer>{step}</TextSwitchContainer>
                                    </div>
                                    <div>
                                        Goal number: <TextSwitchContainer>{hasGoal ? goalNumber : "None"}</TextSwitchContainer>
                                    </div>
                                </motion.div>
                            </div>
                            <motion.div
                                className={"Title-Large"}
                                key={extendedSection === 1}
                                initial={{rotate: extendedSection === 1 ? 0 : 180}}
                                animate={{rotate: !(extendedSection === 1) ? 0 : 180}}
                            >
                                <TbChevronDown />
                            </motion.div>
                        </div>
                    )}
                    setExtendedInherited={() => {setExtendedSection(extendedSection === 1 ? null : 1)}}
                    extendedInherited={extendedSection === 1}
                    isDisabled={type !== 'Number'}
                >
                    <InputWrapper label="Step">
                        <TextBoxInput type="number" placeholder="Step" value={step} setValue={setStep} minNumber={1} maxNumber={999} />
                    </InputWrapper>
                    <InputWrapper label={"Has goal"}>
                        <ToggleButton isToggled={hasGoal} setIsToggled={setHasGoal} />
                    </InputWrapper>
                    <InputWrapper label={"Goal"}>
                        <DropDownInput
                            placeholder={'Type'}
                            options={goalLimits}
                            selected={goalLimit}
                            isDisabled={!hasGoal}
                        >
                            {goalLimits.map(tempGoalLimit => (
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
                <HeaderExtendContainer
                    header={(
                        <div className={"Horizontal-Flex-Container Space-Between"}>
                            <div className={styles.headerLeftSide}>
                                <div className={"Title-Medium"}>Repeat options</div>
                                <motion.div className={`Label-Small ${styles.titleMedium}`}>
                                    <div>
                                        Repeats: <TextSwitchContainer>{capitalizeFirstCharacter(repeats.toString())}</TextSwitchContainer>
                                    </div>
                                    <div>
                                        Method: <TextSwitchContainer>{repeatType === "Custom Rules" ? "Custom" : timeGroup.title}</TextSwitchContainer>
                                    </div>
                                    <div>
                                        Goal number: <TextSwitchContainer>{hasLongGoal ? longGoalNumber : "None"}</TextSwitchContainer>
                                    </div>
                                </motion.div>
                            </div>
                            <IconButton>
                                <motion.div
                                    className={"Title-Large"}
                                    key={extendedSection === 2}
                                    initial={{rotate: extendedSection === 2 ? 0 : 180}}
                                    animate={{rotate: !(extendedSection === 2) ? 0 : 180}}
                                >
                                    <TbChevronDown />
                                </motion.div>
                            </IconButton>
                        </div>
                    )}
                    setExtendedInherited={() => {setExtendedSection(extendedSection === 2 ? null : 2)}}
                    extendedInherited={extendedSection === 2}
                >
                    <InputWrapper label="Repeats">
                        <ToggleButton isToggled={repeats} setIsToggled={setRepeats}></ToggleButton>
                    </InputWrapper>
                    <InputWrapper label={"Repeat using"}>
                        {repeatTypes.map(item => (
                            <Chip
                                key={item}
                                value={item}
                                selected={repeatType}
                                setSelected={setRepeatType}
                                disabled={!repeats}
                            >
                                {item}
                            </Chip>
                        ))}
                    </InputWrapper>
                    <InputWrapper label={"Select a category time group"}>
                        <DropDownInput
                            placeholder={"None"}
                            isDisabled={repeatType !== "Time Group"} setSelected={setTimeGroup} selected={timeGroup?.title}
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
                </HeaderExtendContainer>
                <HeaderExtendContainer
                    header={(
                        <div className={"Horizontal-Flex-Container Space-Between"}>
                            <div className={styles.headerLeftSide}>
                                <div className={"Title-Medium"}>Custom rules for repeat</div>
                                <motion.div className={`Label-Small ${styles.titleMedium}`}>
                                    <div>
                                        Number: <TextSwitchContainer>{repeatNumber}</TextSwitchContainer>
                                    </div>
                                    <div>
                                        Time:
                                        <TextSwitchContainer>
                                            {!hasTime && "None"}
                                            {hasTime && <>
                                                {startHour}:{startMinute} - {endHour}:{endMinute}
                                            </>}
                                        </TextSwitchContainer>
                                    </div>
                                    <div>
                                        Time period: <TextSwitchContainer>{timePeriod}</TextSwitchContainer>
                                    </div>
                                    <div>
                                        On:
                                        <TextSwitchContainer>
                                            {timePeriod === "Days" ? "Option doesn't apply" : timePeriod2.length}
                                        </TextSwitchContainer>
                                        <TextSwitchContainer>
                                            {timePeriod !== "Days" && "days"}
                                        </TextSwitchContainer>
                                    </div>
                                </motion.div>
                            </div>
                            <motion.div
                                className={"Title-Large"}
                                key={extendedSection === 3}
                                initial={{rotate: extendedSection === 3 ? 0 : 180}}
                                animate={{rotate: !(extendedSection === 3) ? 0 : 180}}
                            >
                                <TbChevronDown />
                            </motion.div>
                        </div>
                    )}
                    setExtendedInherited={() => {setExtendedSection(extendedSection === 3 ? null : 3)}}
                    extendedInherited={extendedSection === 3}
                    isDisabled={!repeats || repeatType !== "Custom Rules"}
                >
                    <InputWrapper label={"Repeat between certain times"}>
                        <ToggleButton isToggled={hasTime} setIsToggled={setHasTime} />
                    </InputWrapper>
                    <InputWrapper label={"From - To"}>
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
                    <InputWrapper label={'Repeat every'}>
                        <TextBoxInput type="number" placeholder="Number" value={repeatNumber} setValue={setRepeatNumber} minNumber={1}/>
                        <DropDownInput
                            placeholder={'Weeks'}
                            selected={timePeriod}
                        >
                            {timePeriods.map(tempTimePeriod => (
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
                    <InputWrapper label={'On'}>
                        <Button onClick={toggleDateModal}>Select dates</Button>
                    </InputWrapper>
                </HeaderExtendContainer>
                <HeaderExtendContainer
                    header={(
                        <div className={"Horizontal-Flex-Container Space-Between"}>
                            <div className={styles.headerLeftSide}>
                                <div className={"Title-Medium"}>Long term goal options</div>
                                <motion.div className={`Label-Small ${styles.titleMedium}`}>
                                    <div>
                                        Has goal: <TextSwitchContainer>{capitalizeFirstCharacter(hasLongGoal.toString())}</TextSwitchContainer>
                                    </div>
                                    <div>
                                        Goal type: <TextSwitchContainer>{hasLongGoal ? longGoalType : "None"}</TextSwitchContainer>
                                    </div>
                                    <div>
                                        Goal limit: <TextSwitchContainer>{hasLongGoal ? longGoalLimit : "None"}</TextSwitchContainer>
                                    </div>
                                    <div>
                                        Goal number: <TextSwitchContainer>{hasLongGoal ? longGoalNumber : "None"}</TextSwitchContainer>
                                    </div>
                                </motion.div>
                            </div>
                            <motion.div
                                className={"Title-Large"}
                                key={extendedSection === 4}
                                initial={{rotate: extendedSection === 4 ? 0 : 180}}
                                animate={{rotate: !(extendedSection === 4) ? 0 : 180}}
                            >
                                <TbChevronDown />
                            </motion.div>
                        </div>
                    )}
                    setExtendedInherited={() => {setExtendedSection(extendedSection === 4 ? null : 4)}}
                    extendedInherited={extendedSection === 4}
                    isDisabled={!repeats || repeatType === "Time Group"}
                >
                    <InputWrapper label={"Has long term goal"}>
                        <ToggleButton isToggled={hasLongGoal} setIsToggled={setHasLongGoal} />
                    </InputWrapper>
                    <InputWrapper label={"Type"}>
                        <DropDownInput
                            placeholder={'Type'}
                            selected={longGoalType}
                            isDisabled={!hasLongGoal}
                        >
                            {goalTypes.slice(0, type === "Number" ? 3 : 2).map(tempGoalLimit => (
                                <button
                                    className={styles.dropDownOption}
                                    onClick={() => setLongGoalLimit(tempGoalLimit)}
                                    key={tempGoalLimit}
                                >
                                    {tempGoalLimit}
                                </button>
                            ))}
                        </DropDownInput>
                    </InputWrapper>
                    <InputWrapper label={"Limit"}>
                        <DropDownInput
                            placeholder={'Limit'}
                            selected={longGoalLimit}
                            isDisabled={!hasLongGoal}
                        >
                            {goalLimits.map(tempGoalLimit => (
                                <button
                                    className={styles.dropDownOption}
                                    onClick={() => setLongGoalLimit(tempGoalLimit)}
                                    key={tempGoalLimit}
                                >
                                    {tempGoalLimit}
                                </button>
                            ))}
                        </DropDownInput>
                    </InputWrapper>
                    <InputWrapper label={"Number"}>
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
            </MiniPageContainer>
            {dateModalIsVisible && <TimePeriodModal timePeriod={timePeriod} timePeriod2={timePeriod2} setTimePeriod2={setTimePeriod2} dismountFunction={toggleDateModal} />}
        </>
    );
};

export default NewTask;
