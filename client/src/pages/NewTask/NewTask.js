import {useContext, useEffect, useState} from "react";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import PriorityIndicator from "../../components/indicators/PriorityIndicator/PriorityIndicator";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import ToggleButton from "../../components/buttons/ToggleButton/ToggleButton";
import Chip from "../../components/buttons/Chip/Chip";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import {useDispatch, useSelector} from "react-redux";
import {v4 as uuidv4} from 'uuid';
import {addTask, setTask} from "../../state/tasksSlice";
import MiniPageContainer from "../../components/utilities/MiniPagesContainer/MiniPageContainer";
import {AlertsContext} from "../../context/AlertsContext";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import AddIcon from "@mui/icons-material/Add";
import CollapsibleContainer from "../../components/utilities/CollapsibleContainer/CollapsibleContainer";
import {setHighestPriority, setLowestPriority} from "../../state/userSlice";
import SwitchContainer from "../../components/utilities/SwitchContainer/SwitchContainer";
import TimePeriodInput from "../../components/inputs/TimeUnitInput/TimePeriodInput/TimePeriodInput";
import Divider from "../../components/utilities/Divider/Divider";

const NewTask = ({index, length, id}) => {
    const categories = useSelector((state) => state?.categories.categories);
    const categoryNames = categories.map(category => category.title);
    const {defaults} = useSelector((state) => state?.user.settings);

    const [title, setTitle] = useState('');
    const [type, setType] = useState('Checkbox');
    const [step, setStep] = useState(defaults.defaultStep);
    const [goalType, setGoalType] = useState('At least');
    const [goalNumber, setGoalNumber] = useState(defaults.defaultGoal);
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState(defaults.defaultPriority);
    const [repeats, setRepeats] = useState(false);
    const [longGoalType, setLongGoalType] = useState('None');
    const [longGoalNumber, setLongGoalNumber] = useState(defaults.defaultGoal);
    const [expiresAt, setExpiresAt] = useState('Never');
    const [timeGroup, setTimeGroup] = useState('');
    const [repeatEverySub, setRepeatEverySub] = useState('');
    const [repeatEvery, setRepeatEvery] = useState('');

    const [repeatNumber, setRepeatNumber] = useState(defaults.defaultPriority);
    const [timePeriod, setTimePeriod] = useState('Weeks');
    const [timePeriod2, setTimePeriod2] = useState([]);

    const [repeatType, setRepeatType] = useState('Custom Rules')

    const groups = useSelector((state) => state?.groups.groups);
    const groupTitles = ['None', ...groups.filter(group => group.parent === category).map(group => group.title)];

    const tasks = useSelector((state) => state?.tasks.tasks);
    const {low, high} = useSelector((state) => state?.user.priorityBounds);

    const dispatch = useDispatch();

    const alertsContext = useContext(AlertsContext);
    const miniPagesContext = useContext(MiniPagesContext);

    const causesOfExpiration = ['End of goal', 'Date', 'Never'];
    const taskType = ['Checkbox', 'Number'];
    const goalTypes = ['None', 'At most', 'Exactly', 'At least'];
    const timePeriods = ['Days', 'Weeks', 'Months', 'Years'];
    const repeatTypes = ['Custom Rules', 'Time Group'];

    useEffect(() => {
        if (id) {
            const task = tasks.find(task => task.id === id);
            console.log(task);

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
                setExpiresAt(task.expiresAt);

                if (task.timeGroup) {
                    setRepeatType('Time Group');
                    setTimeGroup(groups.find(group => group.id === timeGroup).title)
                } else {
                    setRepeatType(task.repeatRate.number);
                    setTimePeriod(task.repeatRate.bigTimePeriod);
                    setTimePeriod2(task.repeatRate.smallTimePeriod);
                }
            }
        }
    }, [])

    useEffect(() => {
        if (timeGroup) {
            setRepeatEvery('');
            setRepeatEverySub('');
        }
    }, [timeGroup])

    useEffect(() => {
        if (repeatEvery || repeatEverySub) {
            setTimeGroup('');
        }
    }, [repeatEvery, repeatEverySub])

    useEffect(() => {
        setTimePeriod2([]);
    }, [timePeriod])

    const handleSave = () => {

        let localId;

        if (id) {
            localId = id;
        } else {
            let idIsValid = true;

            do {
                localId = uuidv4();
                idIsValid = !tasks.find(task => task.id === localId);
            } while (idIsValid === false);
        }


        const checkAllInputs = () => {
            if (title) {
                return true
            }
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You must input a title for the task"}})
            return false;
        }

        if (checkAllInputs()) {
            if (priority < low) {
                dispatch(setLowestPriority(priority));
            }
            if (priority > high) {
                dispatch(setHighestPriority(priority));
            }

            let startingDates = [];
            timePeriod2.forEach(smallTimePeriod => {
                let startingDate = new Date();

                switch (timePeriod) {
                    case 'Days':
                        break;
                    case 'Weeks':
                        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

                        const weekDaysDifference = days.findIndex(day => day === smallTimePeriod) + 1 - startingDate.getDay();
                        startingDate.setDate(startingDate.getDate() + weekDaysDifference);
                        break;
                    case 'Months':
                        startingDate.setDate(smallTimePeriod?.getDate());
                        break;
                    case 'Years':
                        startingDate.setTime(smallTimePeriod?.getTime());
                        break;
                }
                startingDate.setHours(0, 0, 0, 0);
                startingDates.push(startingDate.getTime());
            });

            const task = {
                id: localId,
                title,
                type,
                step: type === 'Number' ? (step ? step : defaults.defaultStep) : null,
                goal: type === 'Number' ? {
                    type: goalType,
                    number: goalType === 'None' ? null : (goalNumber ? goalNumber : defaults.defaultGoal)
                } : null,
                category: category ? category : null,
                priority: priority ? priority : defaults.defaultPriority,
                repeats,
                longGoal: repeats ? {
                    goalType: longGoalType,
                    number: longGoalType === 'None' ? null : (longGoalNumber ? longGoalNumber : defaults.defaultGoal)
                } : null,
                expiresAt: repeats ? expiresAt : null,
                timeGroup: repeats && timeGroup ? groups.find(group => group.title === timeGroup).id : null,
                repeatRate: repeats && !timeGroup ? {
                    number: repeatNumber,
                    bigTimePeriod: timePeriod,
                    smallTimePeriod: timePeriod2,
                    startingDate: startingDates
                } : null,
                lastEntryDate: null,
                previousEntry: 0,
                shortHistory: '000000'
            }

            if (id) {
                dispatch(setTask(task));

            } else {
                dispatch(addTask(task));
            }

            miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''})
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
                className="Title Title-Input"
                placeholder="Add task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}/>
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
            <CollapsibleContainer isVisible={type === 'Number'}>
                <InputWrapper label="Step">
                    <TextBoxInput type="number" placeholder="Step" value={step} setValue={setStep}/>
                </InputWrapper>
                <InputWrapper label={"Goal"}>
                    <DropDownInput
                        placeholder={'Type'}
                        options={goalTypes}
                        selected={goalType}
                        setSelected={setGoalType}
                    />
                    <TextBoxInput type="number" placeholder="Number" value={goalNumber} setValue={setGoalNumber}/>
                </InputWrapper>
            </CollapsibleContainer>
            <InputWrapper label={"Category"}>
                <DropDownInput
                    placeholder={'Category'}
                    options={[...categoryNames,
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            Add new
                            <AddIcon />
                        </div>]}
                    selected={category}
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
            <CollapsibleContainer isVisible={repeats}>
                <InputWrapper label={"Long term goal"}>
                    <DropDownInput
                        placeholder={'Type'}
                        options={goalTypes}
                        selected={longGoalType}
                        setSelected={setLongGoalType}
                    />
                    <TextBoxInput type="number" placeholder="Number" value={longGoalNumber}
                                  setValue={setLongGoalNumber}/>
                </InputWrapper>
                <InputWrapper label={"Expires at"}>
                    <DropDownInput
                        placeholder={'Never'}
                        options={causesOfExpiration}
                        selected={expiresAt}
                        setSelected={setExpiresAt}
                    />
                </InputWrapper>
                <Divider />
                <InputWrapper label="Repeat with">
                    <div className={`Horizontal-Flex-Container`}>
                        {repeatTypes.map((type, index) => (
                            <Chip
                                selected={repeatType}
                                setSelected={setRepeatType}
                                value={type}
                                key={index}
                            >
                                {type}
                            </Chip>
                        ))
                        }
                    </div>
                </InputWrapper>
                <SwitchContainer selectedTab={repeatType === 'Custom Rules' ? 0 : 1}>
                    <>
                        <InputWrapper label={'Repeat every'}>
                            <TextBoxInput type="number" placeholder="Number" value={repeatNumber} setValue={setRepeatNumber}/>
                        </InputWrapper>
                        <InputWrapper label={'Time period'}>
                            <DropDownInput placeholder={'Weeks'} options={timePeriods} selected={timePeriod} setSelected={setTimePeriod}></DropDownInput>
                        </InputWrapper>
                        {timePeriod !== 'Days' && <InputWrapper label={'On'}>
                            <TimePeriodInput timePeriod={timePeriod} timePeriod2={timePeriod2} setTimePeriod2={setTimePeriod2} />
                        </InputWrapper>}
                    </>
                    <InputWrapper label={"Select a category time group"}>
                        <DropDownInput
                            placeholder={'Time group'}
                            options={groupTitles}
                            selected={timeGroup}
                            setSelected={setTimeGroup}
                        />
                    </InputWrapper>
                </SwitchContainer>
            </CollapsibleContainer>
        </MiniPageContainer>
    );
};

export default NewTask;
