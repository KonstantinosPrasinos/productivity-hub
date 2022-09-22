import InputWrapper from '../../components/utilities/InputWrapper/InputWrapper';
import ToggleButton from '../../components/buttons/ToggleButton/ToggleButton';
import TextBoxInput from '../../components/inputs/TextBoxInput/TextBoxInput';
import {useState} from 'react';
import PriorityIndicator from "../../components/indicators/PriorityIndicator/PriorityIndicator";
import ColorInput from "../../components/inputs/ColorInput/ColorInput";
import InputPage from "../../components/utilities/InputPage/InputPage";

const NewCategory = () => {
    const [isRepeatableContainer, setIsRepeatableContainer] = useState(true);
    const [selectedColor, setSelectedColor] = useState('red');

    return (<InputPage
        leftSide={
        <div className={'Stack-Container'}>
            <input type="text" className="Title Title-Input" placeholder="Add category name" />
            <InputWrapper label="Color"><ColorInput selected={selectedColor} setSelected={setSelectedColor} /></InputWrapper>
            <InputWrapper label="Act as repeatable container">
                <ToggleButton isToggled={isRepeatableContainer} setIsToggled={setIsRepeatableContainer}></ToggleButton>
            </InputWrapper>
        </div>
        }
        rightSide={
        <div className={'Stack-Container'}>
            <InputWrapper label="Priority"><TextBoxInput isDisabled={!isRepeatableContainer} type="number"></TextBoxInput><PriorityIndicator /></InputWrapper>
            <InputWrapper label="Ends at"><TextBoxInput isDisabled={!isRepeatableContainer} type="number"></TextBoxInput></InputWrapper>
            <InputWrapper label="Entry goal"><TextBoxInput isDisabled={!isRepeatableContainer}></TextBoxInput><TextBoxInput isDisabled={!isRepeatableContainer} type="number"></TextBoxInput></InputWrapper>
            <InputWrapper label="Long term goal"><TextBoxInput isDisabled={!isRepeatableContainer}></TextBoxInput><TextBoxInput isDisabled={!isRepeatableContainer} type="number"></TextBoxInput></InputWrapper>
        </div>
        }
        toggleState={isRepeatableContainer}
    ></InputPage>);
}
 
export default NewCategory;