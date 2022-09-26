import InputPage from "../../components/utilities/InputPage/InputPage";
import {useEffect, useState} from "react";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import PriorityIndicator from "../../components/indicators/PriorityIndicator/PriorityIndicator";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import ToggleButton from "../../components/buttons/ToggleButton/ToggleButton";
import Chip from "../../components/buttons/Chip/Chip";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import {useDispatch, useSelector} from "react-redux";
import {v4 as uuidv4} from 'uuid';
import {addTask} from "../../state/tasksSlice";

const NewTask = () => {
    const categories = useSelector((state) => state.categories.categories);
    const categoryNames = categories.map(category => category.name);

    const groups = useSelector((state) => state.groups.groups);
    const groupNames = groups.filter(group => group.parentCategory).map(group => group.name);

    const tasks = useSelector((state) => state.tasks.tasks);
    const {defaults} = useSelector((state) => state.user.settings);
    const dispatch = useDispatch();

    const causesOfExpiration = ['End of goal', 'Date', 'Never'];
    const taskType = ['Number', 'Checkbox'];
    const goalTypes = ['At most', 'Exactly', 'At least'];
    const timePeriods = ['Day', 'Week', 'Month', 'Year'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const [name, setName] = useState('');
    const [type, setType] = useState('Number');
    const [step, setStep] = useState('');
    const [goalType, setGoalType] = useState('At least');
    const [goalNumber, setGoalNumber] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');
    const [repeats, setRepeats] = useState(false);
    const [longGoalType, setLongGoalType] = useState('At least');
    const [longGoalNumber, setLongGoalNumber] = useState('');
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
            if (id && name && type) {
                return true
            }

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
                    number: goalNumber ? goalNumber : defaults.defaultGoal
                } : null,
                category,
                priority: priority ? priority : defaults.defaultPriority,
                repeats,
                longGoal: repeats ? {
                    goalType: longGoalType,
                    number: longGoalNumber ? longGoalNumber : defaults.defaultGoal
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
        }
    }

    return (
        <InputPage
            leftSide={
                <div className={'Stack-Container'}>
                    <input type="text" className="Title Title-Input" placeholder="Add task name" value={name}
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
                    <div className={'Collapsible-Container'}>
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
                    </div>
                    <InputWrapper label={"Category"}>
                        <DropDownInput
                            placeholder={'Category'}
                            options={categoryNames}
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
                </div>
            }
            rightSide={
                <div className={'Stack-Container'}>
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


                </div>
            }
            toggleState={repeats}
            handleSave={handleSave}
        ></InputPage>
    );
};

export default NewTask;
