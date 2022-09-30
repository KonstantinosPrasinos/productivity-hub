import InputWrapper from '../../components/utilities/InputWrapper/InputWrapper';
import TextBoxInput from '../../components/inputs/TextBoxInput/TextBoxInput';
import {useContext, useState} from 'react';
import ColorInput from "../../components/inputs/ColorInput/ColorInput";
import MiniPageContainer from "../../components/utilities/MiniPagesContainer/MiniPageContainer";
import {AlertsContext} from "../../context/AlertsContext";
import {addCategory} from "../../state/categoriesSlice";
import {useDispatch} from "react-redux";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import IconButton from "../../components/buttons/IconButton/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DropDownInput from "../../components/inputs/DropDownInput/DropDownInput";
import {DayPicker} from "react-day-picker";
import 'react-day-picker/dist/style.css';

const NewCategory = ({index, length}) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('Red');
    const [timeGroups, setTimeGroups] = useState([]);

    const [timeGroupNumber, setTimeGroupNumber] = useState(1);
    const [timePeriod, setTimePeriod] = useState('Weeks');
    const [timePeriod2, setTimePeriod2] = useState();

    const timePeriods = ['Days', 'Weeks', 'Months', 'Years']

    const [creatingTimeGroup, setCreatingTimeGroup] = useState(false);

    const alertsContext = useContext(AlertsContext);
    const miniPagesContext = useContext(MiniPagesContext);
    const dispatch = useDispatch();

    const handleSave = () => {
        const checkAllInputs = () => {
            if (name) return true
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "You must input a title for the category"}})
            return false;
        }

        if (checkAllInputs()) {
            const category = {
                name,
                color,
                timeGroups
            }

            dispatch(addCategory(category));
            miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''})
        }
    }

    const renderTimePeriodInput = () => {
        switch (timePeriod) {
            case 'Days':
                return;
            case 'Weeks':
                // return (<WeekDayInput selected={timePeriod2} setSelected={setTimePeriod2}></WeekDayInput>)
            case 'Months':
                return (<DayPicker mode="single" selected={timePeriod2} onSelect={setTimePeriod2} />)
        }
    }

    return (
        <MiniPageContainer
            onClickSave={handleSave}
            index={index}
            length={length}
        >
            <input type="text" className="Title Title-Input" placeholder="Add category name" value={name} onChange={(e) => setName(e.target.value)}/>
            <InputWrapper label="Color">
                <ColorInput selected={color} setSelected={setColor}/>
            </InputWrapper>
            <InputWrapper label="Time Groups">
                <IconButton border={true} onClick={() => setCreatingTimeGroup(state => !state)}>
                    <AddIcon/>
                </IconButton>
            </InputWrapper>
            {creatingTimeGroup &&
                <div>
                    <InputWrapper label={'Repeat every'}>
                        <TextBoxInput type="number" placeholder="Number" value={timeGroupNumber} setValue={setTimeGroupNumber}/>
                    </InputWrapper>
                    <InputWrapper label={'Time period'}>
                        <DropDownInput placeholder={'Weeks'} options={timePeriods} selected={timePeriod} setSelected={setTimePeriod}></DropDownInput>
                    </InputWrapper>
                    <InputWrapper label={'On'}>
                        {renderTimePeriodInput()}
                    </InputWrapper>
                </div>
            }
        </MiniPageContainer>);
}

export default NewCategory;