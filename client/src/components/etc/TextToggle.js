import { useTheme } from "@emotion/react";
import styled from '@emotion/styled';
import { useState } from "react";

const TextToggle = ({option1, option2, callback}) => {
    const [selectedOption, setSelectedOption] = useState(0);

    const theme = useTheme();

    const longestStringLength = option1.length > option2.length ? option1.length : option2.length;
    
    const ToggleOption = styled.span(
        {
            border: '2px solid',
            borderRadius: '10px',
            padding: '0 0.5em 0 0.5m',
            borderColor: theme.palette.primary.main,
            fontWeight: 'bold',
            cursor: 'pointer',
            width: `${longestStringLength+1}em`,
            height: '2em',
            lineHeight: '1.75em',
            verticalAlign: 'middle',
            textAlign: 'center',
            display: 'inline-block'
        },
        props => ({
            borderRadius: props.index === 0 ? '10px 0 0 10px' : '0 10px 10px 0',
            color: selectedOption === props.index ? theme.palette.background.paper : theme.palette.primary.main,
            background: selectedOption === props.index ? theme.palette.primary.main : theme.palette.background.paper
        })
    )

    return (
        <div className="text-toggle">
            <ToggleOption className="toggle-option" index={0} onClick={() => {setSelectedOption(0); callback(option1)}}>{option1}</ToggleOption>
            <ToggleOption className="toggle-option" index={1} onClick={() => {setSelectedOption(1); callback(option2)}}>{option2} </ToggleOption>
        </div>
    );
}
 
export default TextToggle;