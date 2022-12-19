import {useContext, useEffect, useMemo, useState} from "react";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import PriorityIndicator from "../../components/indicators/PriorityIndicator/PriorityIndicator";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import ToggleButton from "../../components/buttons/ToggleButton/ToggleButton";
import Chip from "../../components/buttons/Chip/Chip";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import {useDispatch} from "react-redux";
import {setTask} from "../../state/tasksSlice";
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import {AlertsContext} from "../../context/AlertsContext";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import AddIcon from "@mui/icons-material/Add";
import CollapsibleContainer from "../../components/containers/CollapsibleContainer/CollapsibleContainer";
import SwitchContainer from "../../components/containers/SwitchContainer/SwitchContainer";
import TimePeriodInput from "../../components/inputs/TimeUnitInput/TimePeriodInput/TimePeriodInput";
import Divider from "../../components/utilities/Divider/Divider";
import {useGetTasks} from "../../hooks/get-hooks/useGetTasks";
import {useGetCategories} from "../../hooks/get-hooks/useGetCategories";
import {useGetGroups} from "../../hooks/get-hooks/useGetGroups";
import {useAddTask} from "../../hooks/add-hooks/useAddTask";
import {useGetSettings} from "../../hooks/get-hooks/useGetSettings";
import {findStartingDates} from "../../functions/findStartingDates";

const NewTask = ({index, length, id}) => {
    const {isLoading: categoriesLoading, data: categories} = useGetCategories();
    
    const getCategoryTitles = () => {
        const titles = ['None'];
        
        if (categoriesLoading) return titles
        
        titles.push(...categories?.map(category => category.title));
        
        return titles;
    }

    const categoryTitles = useMemo(getCategoryTitles, [categoriesLoading, categories])
    
    const {data: settings} = useGetSettings();

    const taskMutation = useAddTask();

    const [title, setTitle] = useState('');
    const [type, setType] = useState('Checkbox');
    const [step, setStep] = useState(settings.defaults.step);
    const [goalType, setGoalType] = useState('At least');
    const [goalNumber, setGoalNumber] = useState(settings.defaults.goal);
    const [selectedCategory, setCategory] = useState('None');
    const [priority, setPriority] = useState(settings.defaults.priority);
    const [repeats, setRepeats] = useState(false);
    const [longGoalType, setLongGoalType] = useState('None');
    const [longGoalNumber, setLongGoalNumber] = useState(settings.defaults.goal);
    const [expiresAt, setExpiresAt] = useState('Never');
    const [selectedGroup, setTimeGroup] = useState('');
    const [repeatEverySub, setRepeatEverySub] = useState('');
    const [repeatEvery, setRepeatEvery] = useState('');

    const [repeatNumber, setRepeatNumber] = useState(settings.defaults.priority);
    const [timePeriod, setTimePeriod] = useState('Weeks');
    const [timePeriod2, setTimePeriod2] = useState([]);

    const [repeatType, setRepeatType] = useState('Custom Rules')

    const {isLoading: groupsLoading, data: groups} = useGetGroups();

    const {isLoading, data: tasks} = useGetTasks();

    const dispatch = useDispatch();

    const alertsContext = useContext(AlertsContext);
    const miniPagesContext = useContext(MiniPagesContext);

    const causesOfExpiration = ['End of goal', 'Date', 'Never'];
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
                setExpiresAt(task.expiresAt);

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

        if (!categoriesLoading && !groupsLoading && checkAllInputs()) {
            const startingDates = findStartingDates(timePeriod, timePeriod2);

            const repeatProperties = {};

            if (repeats && selectedGroup) {
                console.log(selectedGroup);
                repeatProperties.repeatRate = selectedGroup.repeatRate ?? undefined;
            } else if (repeats && !selectedGroup) {
                repeatProperties.repeatRate = undefined;
                repeatProperties.repeats = false;
                alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "warning", message: "You didn't set any repeat properties, so the repeat property was set to false"}})
            }

            const categoryId = categories.find(category => category.title === selectedCategory)?._id;

            const task = {
                title,
                type,
                step: type === 'Number' ? (step ? step : settings.defaults.step) : undefined,
                goal: type === 'Number' ? {
                    type: goalType,
                    number: goalType === 'None' ? undefined : (goalNumber ? goalNumber : settings.defaults.goal)
                } : undefined,
                category: categoryId,
                priority: priority ? priority : settings.defaults.priority,
                repeats,
                longGoal: repeats ? {
                    type: longGoalType,
                    number: longGoalType === 'None' ? undefined : (longGoalNumber ? longGoalNumber : settings.defaults.goal)
                } : undefined,
                group: repeats ? selectedGroup._id : undefined,
                currentEntryValue: 0,
                streak: repeats ? "0000000" : undefined,
                ...repeatProperties,
                // expiresAt: {
                //     type: "Never",
                //     timePeriod: undefined
                // },
            }

            console.log(task);

            if (id) {
                dispatch(setTask(task));
            } else {
                taskMutation.mutate(task);
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
                className="Title Title-Input"
                placeholder="Add task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
            />
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
                    options={[...categoryTitles,
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            Add new
                            <AddIcon />
                        </div>]}
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
                </SwitchContainer>
            </CollapsibleContainer>
        </MiniPageContainer>
    );
};

export default NewTask;
