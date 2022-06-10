import { useTheme } from "@emotion/react";
import { useState } from "react";
import styled from 'styled-components';

const BlockButton = ({text}) => {
    const [selected, setSelected] = useState(false);
    
    const theme = useTheme();

    const BlockButton = styled.div`
        display: inline-block;
        padding: 0.35em 1em 0.35em 1em;
        background: ${props => props.selected ? theme.palette.primary.main : ""};
        color: ${props => props.selected ? theme.palette.background.default : theme.palette.primary.main};
        cursor: pointer;
        border-radius: 10px;
        font-size: 1.25em;
    `;

    return (<BlockButton selected={selected} className="block-button" onClick={() => {setSelected(option => !option)}}>{text}</BlockButton>);
}
 
export default BlockButton;