import InputWrapper from '../../utilities/InputWrapper/InputWrapper';
import ToggleButton from '../../buttons/ToggleButton/ToggleButton';
import TextBoxInput from '../../inputs/TextBoxInput/TextBoxInput';
import styles from './NewCategory.module.scss';
import { useState } from 'react';
import FilledButton from "../../buttons/FilledButton/FilledButton";
import IconButton from "../../buttons/IconButton/IconButton";
import CloseIcon from '@mui/icons-material/Close';

const NewCategory = () => {
    const [extended, setExtended] = useState(true);

    return (<div className={`Horizontal-Flex-Container Rounded-Container Symmetrical ${styles.container}`}>
        <div className={`Stack-Container ${styles.leftSide}`}>
            <input type="text" className="Title Title-Input" placeholder="Add category name" />
            <InputWrapper label="Color"></InputWrapper>
            <InputWrapper label="Act as repeatable container"><ToggleButton></ToggleButton></InputWrapper>
        </div>
        {extended &&
            <div className={`Stack-Container ${styles.rightSide}`}>
                <InputWrapper label="Priority"><TextBoxInput type="number"></TextBoxInput></InputWrapper>
                <InputWrapper label="Ends at"><TextBoxInput type="number"></TextBoxInput></InputWrapper>
                <InputWrapper label="Entry goal"><TextBoxInput></TextBoxInput><TextBoxInput type="number"></TextBoxInput></InputWrapper>
                <InputWrapper label="Long term goal"><TextBoxInput></TextBoxInput><TextBoxInput type="number"></TextBoxInput></InputWrapper>
            </div>
        }

        <div className={`Stack-Container ${styles.staticButtons}`}>
            <IconButton><CloseIcon /></IconButton>
            <FilledButton>Save</FilledButton>
        </div>
    </div>);
}
 
export default NewCategory;