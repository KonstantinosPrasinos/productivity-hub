import InputWrapper from '../../components/utilities/InputWrapper/InputWrapper';
import ToggleButton from '../../components/buttons/ToggleButton/ToggleButton';
import TextBoxInput from '../../components/inputs/TextBoxInput/TextBoxInput';
import {useState} from 'react';
import PriorityIndicator from "../../components/indicators/PriorityIndicator/PriorityIndicator";
import ColorInput from "../../components/inputs/ColorInput/ColorInput";
import MiniPageContainer from "../../components/utilities/MiniPagesContainer/MiniPageContainer";

const NewCategory = ({index, length}) => {
    const [isRepeatableContainer, setIsRepeatableContainer] = useState(true);
    const [selectedColor, setSelectedColor] = useState('red');

    const handleSave = () => {

    }

    return (
        <MiniPageContainer
            onClickSave={handleSave}
            index={index}
            length={length}
        >
            <input type="text" className="Title Title-Input" placeholder="Add category name"/>
            <InputWrapper label="Color">
                <ColorInput selected={selectedColor} setSelected={setSelectedColor}/>
            </InputWrapper>
            <InputWrapper label="Act as repeatable container">
                <ToggleButton isToggled={isRepeatableContainer} setIsToggled={setIsRepeatableContainer} />
            </InputWrapper>
            <InputWrapper label="Priority">
                <TextBoxInput isDisabled={!isRepeatableContainer} type="number" />
                <PriorityIndicator/>
            </InputWrapper>
            <InputWrapper label="Ends at">
                <TextBoxInput isDisabled={!isRepeatableContainer} type="number" />
            </InputWrapper>
            <InputWrapper label="Entry goal">
                <TextBoxInput isDisabled={!isRepeatableContainer} />
                <TextBoxInput isDisabled={!isRepeatableContainer} type="number" />
            </InputWrapper>
            <InputWrapper label="Long term goal">
                <TextBoxInput isDisabled={!isRepeatableContainer} />
                <TextBoxInput isDisabled={!isRepeatableContainer} type="number" />
            </InputWrapper>
        </MiniPageContainer>);
}

export default NewCategory;