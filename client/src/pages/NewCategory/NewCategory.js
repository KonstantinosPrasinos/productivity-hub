import InputWrapper from '../../components/utilities/InputWrapper/InputWrapper';
import ToggleButton from '../../components/buttons/ToggleButton/ToggleButton';
import TextBoxInput from '../../components/inputs/TextBoxInput/TextBoxInput';
import styles from './NewCategory.module.scss';
import {useContext, useState} from 'react';
import FilledButton from "../../components/buttons/FilledButton/FilledButton";
import IconButton from "../../components/buttons/IconButton/IconButton";
import CloseIcon from '@mui/icons-material/Close';
import PriorityIndicator from "../../components/indicators/PriorityIndicator/PriorityIndicator";
import ColorInput from "../../components/inputs/ColorInput/ColorInput";
import {ScreenSizeContext} from "../../context/ScreenSizeContext";

const NewCategory = () => {
    const [isRepeatableContainer, setIsRepeatableContainer] = useState(true);
    const [selectedColor, setSelectedColor] = useState('red');

    const screenSizeContext = useContext(ScreenSizeContext);

    return (<div className={`${screenSizeContext.state === 'small' ? 'Stack-Container' : 'Horizontal-Flex-Container'} Rounded-Container Symmetrical ${styles.container} Page`}>
        <div className={`Stack-Container ${styles.leftSide}`}>
            <input type="text" className="Title Title-Input" placeholder="Add category name" />
            <InputWrapper label="Color"><ColorInput selected={selectedColor} setSelected={setSelectedColor} /></InputWrapper>
            <InputWrapper label="Act as repeatable container">
                <ToggleButton isToggled={isRepeatableContainer} setIsToggled={setIsRepeatableContainer}></ToggleButton>
            </InputWrapper>
        </div>
        <div className={`Stack-Container ${styles.rightSide} ${!isRepeatableContainer ? styles.isDisabled : ''}`}>
            <InputWrapper label="Priority"><TextBoxInput isDisabled={!isRepeatableContainer} type="number"></TextBoxInput><PriorityIndicator /></InputWrapper>
            <InputWrapper label="Ends at"><TextBoxInput isDisabled={!isRepeatableContainer} type="number"></TextBoxInput></InputWrapper>
            <InputWrapper label="Entry goal"><TextBoxInput isDisabled={!isRepeatableContainer}></TextBoxInput><TextBoxInput isDisabled={!isRepeatableContainer} type="number"></TextBoxInput></InputWrapper>
            <InputWrapper label="Long term goal"><TextBoxInput isDisabled={!isRepeatableContainer}></TextBoxInput><TextBoxInput isDisabled={!isRepeatableContainer} type="number"></TextBoxInput></InputWrapper>
        </div>

        <div className={`Stack-Container ${styles.staticButtons}`}>
            {
                screenSizeContext.state === 'big' && <div className={styles.exitButton}><IconButton><CloseIcon /></IconButton></div>
            }

            <div className={styles.saveButton}>
                <FilledButton >Save</FilledButton>
            </div>
        </div>
    </div>);
}
 
export default NewCategory;