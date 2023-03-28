import {useContext, useEffect, useMemo, useRef, useState} from "react";
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
import TimePeriodInput from "../../components/inputs/TimeUnitInput/TimePeriodInput/TimePeriodInput";
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

const NewTask = ({index, length, id}) => {
    const {isLoading: categoriesLoading, data: categories} = useGetCategories();

    const categoryOptions = useMemo(() => {
        const titles = ['None'];

        if (categoriesLoading) return titles

        titles.push(...categories?.map(category => category.title));

        titles.push(<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            Add new
            <TbPlus />
        </div>)

        return titles;
    }, [categoriesLoading, categories])
    
    const {data: settings} = useGetSettings();

    const {mutate: addTask} = useAddTask();
    const {mutate: changeTask} = useChangeTask();


    const [title, setTitle] = useState('');
    const [type, setType] = useState('Checkbox');
    const [step, setStep] = useState(settings.defaults.step);
    const [hasGoal, setHasGoal] = useState(false);
    const [goalType, setGoalType] = useState('At least');
    const [goalNumber, setGoalNumber] = useState(settings.defaults.goal);
    const [selectedCategory, setCategory] = useState('None');
    const [priority, setPriority] = useState(settings.defaults.priority);
    const [repeats, setRepeats] = useState(false);
    const [hasLongGoal, setHasLongGoal] = useState(false);
    const [longGoalType, setLongGoalType] = useState('None');
    const [longGoalNumber, setLongGoalNumber] = useState(settings.defaults.goal);
    // const [expiresAt, setExpiresAt] = useState('Never');
    const [selectedGroup, setTimeGroup] = useState('');
    const [repeatEverySub, setRepeatEverySub] = useState('');
    const [repeatEvery, setRepeatEvery] = useState('');

    const [repeatNumber, setRepeatNumber] = useState(settings.defaults.priority);
    const [timePeriod, setTimePeriod] = useState('Weeks');
    const [timePeriod2, setTimePeriod2] = useState([]);

    const [repeatType, setRepeatType] = useState('Custom Rules')

    const {isLoading: groupsLoading, data: groups} = useGetGroups();

    const {isLoading, data: tasks} = useGetTasks();

    const alertsContext = useContext(AlertsContext);
    const miniPagesContext = useContext(MiniPagesContext);

    const [extendedSection, setExtendedSection] = useState(0);

    // const causesOfExpiration = ['End of goal', 'Date', 'Never'];
    const taskType = ['Checkbox', 'Number'];
    const goalTypes = ['None', 'At most', 'Exactly', 'At least'];
    const timePeriods = ['Days', 'Weeks', 'Months', 'Years'];
    const repeatTypes = ['Custom Rules', 'Time Group'];

    const handleKeyDown = (e) => {
        if (e.code === 'Enter') {
            handleSave();
        }
    }

    const findMatchingGroups = () => {
        const tempGroups = [{title: "None", _id: undefined}];

        if (groupsLoading) return tempGroups;

        const categoryId = categories?.find(localCategory => localCategory.title === selectedCategory)?._id

        tempGroups.push(...groups.filter(group => group.parent === categoryId));

        return tempGroups;
    }

    const categoryGroups = useMemo(findMatchingGroups, [groupsLoading, categories, selectedCategory]);

    useEffect(() => {
        if (id && !isLoading) {
            const task = tasks.find(task => task._id === id);

            setTitle(task.title);
            setType(task.type);

            if (task.type === 'Number') {
                setStep(task.step);
                setGoalType(task.goal.type);
                setGoalNumber(task.goal.number);
            }

            setCategory(task.category);
            setPriority(task.priority);
            setRepeats(task.repeats);

            if (task.repeats) {
                setLongGoalType(task.longGoal.type);
                setLongGoalNumber(task.longGoal.number);
                // setExpiresAt(task.expiresAt);

                if (task.group) {
                    setRepeatType('Time Group');
                    setTimeGroup(groups.find(group => group.id === selectedGroup).title)
                } else {
                    setRepeatType(task.repeatRate.number);
                    setTimePeriod(task.repeatRate.bigTimePeriod);
                    setTimePeriod2(task.repeatRate.smallTimePeriod);
                }
            }
        }
    }, [isLoading]);

    useEffect(() => {
        if (selectedGroup) {
            setRepeatEvery('');
            setRepeatEverySub('');
        }
    }, [selectedGroup])

    useEffect(() => {
        if (repeatEvery || repeatEverySub) {
            setTimeGroup('');
        }
    }, [repeatEvery, repeatEverySub])

    useEffect(() => {
        setTimePeriod2([]);
    }, [timePeriod])

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
                    if (selectedGroup) {
                        if (selectedGroup) repeatProperties = {
                            repeatRate: selectedGroup.repeatRate,
                            group: selectedGroup
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

                    if (timePeriod2) {
                        repeatRate.smallTimePeriod = timePeriod2;
                        repeatRate.startingDate = findStartingDates(timePeriod, timePeriod2);
                    } else {
                        alertsContext.dispatch({
                            type: "ADD_ALERT",
                            payload: {
                                type: "warning",
                                message: "You need to enter at least one value into the \"On\" field."
                            }
                        })
                        return;
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

            if (selectedCategory !== "None") {
                task.category = categories.find(category => category.title === selectedCategory)?._id;
            }

            if (task.type === "Number") {
                task.step = step;
                if (hasGoal) {
                    task.goal = {
                        type: goalType,
                        number: goalNumber,
                    }
                }
            }

            if (hasLongGoal) {
                task.longGoal = {
                    type: longGoalType,
                    number: longGoalNumber,
                }
            }

            if (id) {
                changeTask(task)
            } else {
                console.log(task);
                addTask(task);
            }

            miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''});
        }
    }

    return (
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
                        <div className={"Stack-Container"}>
                            <div className={"Title-Medium"}>General options</div>
                            <div className={`Label-Small ${styles.titleMedium}`}>Type: {type}, Category: None, Priority: 10</div>
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
                                setSelected={setType}
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
                        placeholder={'Category'}
                        options={categoryOptions}
                        selected={selectedCategory}
                        setSelected={setCategory}
                    />
                </InputWrapper>
                <InputWrapper label="Priority">
                    <TextBoxInput type="number" placeholder="Priority" value={priority} setValue={setPriority}/>
                    <PriorityIndicator/>
                </InputWrapper>
                <InputWrapper label="Repeats">
                    <ToggleButton isToggled={repeats} setIsToggled={setRepeats}></ToggleButton>
                </InputWrapper>
            </HeaderExtendContainer>
            <HeaderExtendContainer
                header={(
                    <div className={"Horizontal-Flex-Container Space-Between"}>
                        <div className={"Stack-Container"}>
                            <div className={"Title-Medium"}>Number type options</div>
                            <div className={`Label-Small ${styles.titleMedium}`}>
                                {type === 'Number' && `Goal: at least 10, Step 1`}
                                {type !== 'Number' && 'In order to enable set the task type to Number'}
                            </div>
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
                    <TextBoxInput type="number" placeholder="Step" value={step} setValue={setStep} />
                </InputWrapper>
                <InputWrapper label={"Has goal"}>
                    <ToggleButton isToggled={hasGoal} setIsToggled={setHasGoal} />
                </InputWrapper>
                <InputWrapper label={"Goal"}>
                    <DropDownInput
                        placeholder={'Type'}
                        options={goalTypes}
                        selected={goalType}
                        setSelected={setGoalType}
                        isDisabled={!hasGoal}
                    />
                    <TextBoxInput
                        type="number"
                        placeholder="Number"
                        value={goalNumber}
                        setValue={setGoalNumber}
                        isDisabled={!hasGoal}
                    />
                </InputWrapper>
            </HeaderExtendContainer>
            <HeaderExtendContainer
                header={(
                    <div className={"Horizontal-Flex-Container Space-Between"}>
                        <div className={"Stack-Container"}>
                            <div className={"Title-Medium"}>Repeat options</div>
                            <div className={`Label-Small ${styles.titleMedium}`}>
                                {!repeats && "In order to enable, toggle repeats"}
                                {repeats && `Long term goal: At least 1`}
                            </div>
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
                isDisabled={!repeats}
            >
                <InputWrapper label={"Has long term goal"}>
                    <ToggleButton isToggled={hasLongGoal} setIsToggled={setHasLongGoal} />
                </InputWrapper>
                <InputWrapper label={"Long term goal"}>
                    <DropDownInput
                        placeholder={'Type'}
                        options={goalTypes}
                        selected={longGoalType}
                        setSelected={setLongGoalType}
                        isDisabled={!hasLongGoal}
                    />
                    <TextBoxInput
                        type="number"
                        placeholder="Number"
                        value={longGoalNumber}
                        setValue={setLongGoalNumber}
                        isDisabled={!hasLongGoal}
                    />
                </InputWrapper>
                <InputWrapper label={"Repeat using"}>
                    {repeatTypes.map(item => (
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
                <InputWrapper label={"Select a category time group"}>
                    {categoryGroups.map((group, index) => (
                        <Chip
                            key={index}
                            value={group}
                            selected={selectedGroup}
                            setSelected={setTimeGroup}
                        >
                            {group.title}
                        </Chip>
                    ))}
                </InputWrapper>
            </HeaderExtendContainer>
            <HeaderExtendContainer
                header={(
                    <div className={"Horizontal-Flex-Container Space-Between"}>
                        <div className={"Stack-Container"}>
                            <div className={"Title-Medium"}>Custom rules for repeat</div>
                            <div className={`Label-Small ${styles.titleMedium}`}>
                                {(!repeats || repeatType !== "Custom Rules") && "In order to enable, toggle repeats and custom rules"}
                                {(repeats && repeatType === "Custom Rules") && `Repeat every: 1 Week on Mondays`}
                            </div>
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
                <InputWrapper label={'Repeat every'}>
                    <TextBoxInput type="number" placeholder="Number" value={repeatNumber} setValue={setRepeatNumber}/>
                </InputWrapper>
                <InputWrapper label={'Time period'}>
                    <DropDownInput placeholder={'Weeks'} options={timePeriods} selected={timePeriod} setSelected={setTimePeriod}></DropDownInput>
                </InputWrapper>
                {timePeriod !== 'Days' &&
                    <InputWrapper label={'On'}>
                        <TimePeriodInput timePeriod={timePeriod} timePeriod2={timePeriod2} setTimePeriod2={setTimePeriod2} />
                    </InputWrapper>
                }
            </HeaderExtendContainer>
        </MiniPageContainer>
    );
};

export default NewTask;
