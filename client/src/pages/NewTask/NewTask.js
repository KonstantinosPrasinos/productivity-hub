import {useContext, useEffect, useState} from "react";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import PriorityIndicator from "../../components/indicators/PriorityIndicator/PriorityIndicator";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import ToggleButton from "../../components/buttons/ToggleButton/ToggleButton";
import Chip from "../../components/buttons/Chip/Chip";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import {useDispatch, useSelector} from "react-redux";
import {v4 as uuidv4} from 'uuid';
import {addTask} from "../../state/tasksSlice";
import {AnimatePresence, motion} from 'framer-motion';
import MiniPageContainer from "../../components/utilities/MiniPagesContainer/MiniPageContainer";
import {AlertsContext} from "../../context/AlertsContext";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import AddIcon from "@mui/icons-material/Add";

const NewTask = ({index, length}) => {
    const categories = useSelector((state) => state.categories.categories);
    const categoryNames = categories.map(category => category.name);

    const groups = useSelector((state) => state.groups.groups);
    const groupNames = groups.filter(group => group.parentCategory).map(group => group.name);

    const tasks = useSelector((state) => state.tasks.tasks);
    const {defaults} = useSelector((state) => state.user.settings);
    const dispatch = useDispatch();

    const alertsContext = useContext(AlertsContext);
    const miniPagesContext = useContext(MiniPagesContext);

    const causesOfExpiration = ['End of goal', 'Date', 'Never'];
    const taskType = ['Checkbox', 'Number'];
    const goalTypes = ['None', 'At most', 'Exactly', 'At least'];
    const timePeriods = ['Day', 'Week', 'Month', 'Year'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const [name, setName] = useState('');
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

    const handleSave = () => {
        let idIsValid = true;
        let id;

        do {
            id = uuidv4();
            idIsValid = !tasks.find(task => task.id === id);
        } while (idIsValid === false);

        const checkAllInputs = () => {
            if (name) {
                return true
            }
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You must input a name for the task"}})
            return false;
        }

        if (checkAllInputs()) {
            const task = {
                id,
                name,
                type,
                step: type === 'Number' ? (step ? step : defaults.defaultStep) : null,
                goal: type === 'Number' ? {
                    goalType,
                    number: goalType === 'None' ? null : (goalNumber ? goalNumber : defaults.defaultGoal)
                } : null,
                category,
                priority: priority ? priority : defaults.defaultPriority,
                repeats,
                longGoal: repeats ? {
                    goalType: longGoalType,
                    number: longGoalType === 'None' ? null : (longGoalNumber ? longGoalNumber : defaults.defaultGoal)
                } : null,
                expiresAt: repeats ? expiresAt : null,
                timeGroup: repeats ? (timeGroup ? groups.find(group => group.name === timeGroup).id : null) : null,
                repeatEvery: repeats ? {
                    repeatEvery,
                    repeatEverySub
                } : null,
                lastEntryDate: null,
                previousEntry: null,
                shortHistory: '000000'
            }

            dispatch(addTask(task));
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
                placeholder="Add task name"
                value={name}
                onChange={(e) => setName(e.target.value)}/>
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
            <AnimatePresence>
                {type === 'Number' && <motion.div className={'Collapsible-Container'} initial={{height: 0}} animate={{height: 'auto'}} exit={{height: 0}}>
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
                        <TextBoxInput type="number" placeholder="Number" value={goalNumber}
                                      setValue={setGoalNumber}/>
                    </InputWrapper>
                </motion.div>}
            </AnimatePresence>

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
            <InputWrapper label={"Repeat every"}>
                <DropDownInput
                    placeholder={'Time period'}
                    options={timePeriods}
                    selected={repeatEvery}
                    setSelected={setRepeatEvery}
                />
                <DropDownInput
                    placeholder={'Subdivision'}
                    options={days}
                    selected={repeatEverySub}
                    setSelected={setRepeatEverySub}
                />
            </InputWrapper>
            <div className='Label'>Or</div>
            <InputWrapper label={"Select a category time group"}>
                <DropDownInput
                    placeholder={'Time group'}
                    options={groupNames}
                    selected={timeGroup}
                    setSelected={setTimeGroup}
                />
            </InputWrapper>
        </MiniPageContainer>
    );
};

export default NewTask;
