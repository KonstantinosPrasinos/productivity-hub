import { InputAdornment, Paper, TextField } from "@mui/material";
import { useTheme } from '@emotion/react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from "react";
import TextToggle from "../etc/TextToggle";
import { HexColorPicker } from "react-colorful";
import styled from 'styled-components';

const NewTask = () => {
  const theme = useTheme();
  const [date, setDate] = useState(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [previousCustomColor, setPreviousCustomColor] = useState(theme.palette.primary.main);

  const colors = ['#FC5C65', '#FD9644', '#FED330', '#26DE81', '#45AAF2', '#4B7BEC', '#A55EEA'];

  const NewTaskContainer = styled(Paper)`
    @media (max-width: 768px) {
      width: 100%;
      height: 100%;
    }
    @media (min-width: 768px) {
      width: 50%;
      height: 100%;
    }
    border-radius: 10px;
    flex-direction: column;
    row-gap: 1em;
    display: flex;
    padding: 2em;
    overflow-y: auto;
  `;

  const MenuCategory = styled.div`
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 10% 90%;
    row-gap: 0.5em;
  `;

  const CategoryTitle = styled.div`
    opacity: 0.35;
    font-weight: bold
  `;

  const CategoryContent = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 1em;
  `;

  return (
    <NewTaskContainer
      className="new-task-container"
    >
      <TextField
        variant="standard"
        placeholder="Add Title"
        InputProps={{ disableUnderline: true, style: { fontSize: "40px" } }}
        multiline
      />
      {/* <MenuCategory className="new-category-lasts">
        <CategoryTitle>Lasts for:</CategoryTitle>
        <CategoryContent>
          <BlockButton text={"Forever"}></BlockButton>
          <div>
            <TextField variant="standard" placeholder="Number" />
            <TextField variant="standard" placeholder="Time" />
          </div>
        </CategoryContent>
      </MenuCategory> */}
      <MenuCategory className="new-category-ends">
        <CategoryTitle>Ends at:</CategoryTitle>
        <CategoryContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              placeholder="Date"
              value={date}
              onChange={(newDate) => {setDate(newDate)}}
              renderInput={(params) => <TextField variant="standard" {...params} />}
            />
          </LocalizationProvider>
        </CategoryContent>
      </MenuCategory>
      <MenuCategory className="new-category-goal">
        <CategoryTitle>Per Entry Goal:</CategoryTitle>
        <CategoryContent>
          <TextField variant="standard" placeholder="Number 0-100" type="number" InputProps={{endAdornment: <InputAdornment position="end">%</InputAdornment>}} />
          <CategoryContent><div>of Children Tasks Completed</div></CategoryContent>
        </CategoryContent>
      </MenuCategory>
      <MenuCategory className="new-category-priority">
        <CategoryTitle>Priority</CategoryTitle>
          <CategoryContent><TextField variant="standard" placeholder="Number" type="number" /><div>Highest: 50 | Lowest: 0</div></CategoryContent>
      </MenuCategory>
      <MenuCategory className="new-category-tracked">
        <CategoryTitle>Should be tracked in the home widget:</CategoryTitle>
        <CategoryContent><TextToggle option1="Yes" option2="No" /></CategoryContent>
      </MenuCategory>
      <div className="new-category-color" style={{display: 'flex', flexDirection: 'row', columnGap: '0.5em', flexWrap: 'wrap'}}>
        {colors.map((color, index) => {
          return (
            <div 
              className="color-pick-radio-container"
              key={color}
              style={{
                width: '2em',
                height: '2em',
                display: 'inline-block',
                background: index === selectedColorIndex ? color : '',
                position: 'relative',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
              onClick={() => {setSelectedColorIndex(index); setSelectedColor(color);}}
            >
              <span
                style={{
                  width: '1.5em',
                  height: '1.5em',
                  outline: `0.24em solid ${theme.palette.background.paper}`,
                  background: color,
                  display: 'block',
                  position: 'absolute',
                  borderRadius: '50%',
                  top: 'calc(50% - 0.75em)',
                  left: 'calc(50% - 0.75em)'
                }}
                />
            </div> 
          )
        })}
        <div
          className="custom-color-picker-button"
          style={{
            borderRadius: '1em',
            height: '2em',
            width: '7em',
            background: theme.palette.primary.main,
            color: theme.palette.background.paper,
            lineHeight: '2em',
            position: 'relative',
            paddingLeft: '0.75em',
            cursor: 'pointer',
            display: 'inline-block'
          }}
          onClick={() => setSelectedColorIndex(7)}
        >
          Custom
          <span 
            style={{
              height: '1.5em',
              width: '1.5em',
              display: 'inline-block',
              borderRadius: '50%',
              border: `0.1em solid ${theme.palette.background.paper}`,
              position: 'absolute',
              top: '0.3em',
              marginLeft: '0.75em',
              background: selectedColorIndex === 7 ? selectedColor : previousCustomColor
            }}
          ></span>
        </div>
        {selectedColorIndex === 7 && <HexColorPicker onChange={(color) => setSelectedColor(color)} onBlur={() => {setPreviousCustomColor(selectedColor); setSelectedColorIndex(-1);}} />}
      </div>
    </NewTaskContainer>
  );
};

export default NewTask;
