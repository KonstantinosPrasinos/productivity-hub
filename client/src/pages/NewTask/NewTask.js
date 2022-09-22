import InputPage from "../../components/utilities/InputPage/InputPage";
import {useState} from "react";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import PriorityIndicator from "../../components/indicators/PriorityIndicator/PriorityIndicator";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import ToggleButton from "../../components/buttons/ToggleButton/ToggleButton";
import Chip from "../../components/buttons/Chip/Chip";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";

const NewTask = () => {
    const [repeats, setRepeats] = useState(false);
    const [selectedType, setSelectedType] = useState(0);
    const taskType = ['Number', 'Checkbox', 'Time']; //Add pomodoro for v2.0

    return (
        <InputPage
            leftSide={
            <div className={'Stack-Container'}>
                <input type="text" className="Title Title-Input" placeholder="Add task name" />
                <InputWrapper label="Type">
                    <div className={`Horizontal-Flex-Container`}>
                        {taskType.map((task, index) => (
                            <Chip
                                selected={selectedType}
                                setSelected={setSelectedType}
                                index={index}
                                key={index}
                            >
                                {task}
                            </Chip>
                            ))
                        }
                    </div>
                </InputWrapper>
                <InputWrapper label="Priority"><TextBoxInput isDisabled={!repeats} type="number"></TextBoxInput><PriorityIndicator /></InputWrapper>
                <InputWrapper label="Repeats">
                    <ToggleButton isToggled={repeats} setIsToggled={setRepeats}></ToggleButton>
                </InputWrapper>
            </div>
            }
            rightSide={
            <div className={'Stack-Container'}>
                <InputWrapper label="Long term goal">
                    <TextBoxInput isDisabled={!repeats}></TextBoxInput>
                    <TextBoxInput isDisabled={!repeats} type="number"></TextBoxInput>
                </InputWrapper>
                <InputWrapper label="Repeat every">
                    <TextBoxInput isDisabled={!repeats}></TextBoxInput>
                    <DropDownInput placeholder={'Week'} options={['Day', 'Week', 'Month', 'Year']}></DropDownInput>
                </InputWrapper>
                <div className='Label'>Or</div>
                <InputWrapper label="Select a category time group">
                    <DropDownInput isDisabled={!repeats} placeholder={'Category'} options={['Category1', 'Category2', 'Category3', 'Category4']}></DropDownInput>
                    <DropDownInput isDisabled={!repeats} placeholder={'Time Group'} options={['Group1', 'Group2', 'Group3', 'Group4']}></DropDownInput>
                </InputWrapper>
                <InputWrapper label="Ends at">
                    <TextBoxInput isDisabled={!repeats} type="number"></TextBoxInput>
                </InputWrapper>
            </div>
            }
            toggleState={repeats}
        ></InputPage>
    );
};

export default NewTask;
