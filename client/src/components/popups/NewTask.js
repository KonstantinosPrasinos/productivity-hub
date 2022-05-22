import { InputAdornment, Paper, TextField } from "@mui/material";
import { useTheme } from '@emotion/react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from "react";
import TextToggle from "../etc/TextToggle";
import { HexColorPicker } from "react-colorful";

const NewTask = () => {
  const theme = useTheme();
  const [date, setDate] = useState(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [previousCustomColor, setPreviousCustomColor] = useState(theme.palette.primary.main);

  const colors = ['#FC5C65', '#FD9644', '#FED330', '#26DE81', '#45AAF2', '#4B7BEC', '#A55EEA'];

  return (
    <Paper
      className="new-task-container"
      sx={{
        width: "50%",
        height: "75%",
        position: "fixed",
        borderRadius: "10px",
        flexDirection: "column",
        rowGap: "10px",
        display: "flex",
        padding: "2em",
      }}
    >
      <TextField
        variant="standard"
        placeholder="Add Title"
        InputProps={{ disableUnderline: true, style: { fontSize: "40px" } }}
        multiline
      />
      <div className="new-category-lasts">
        <div>Lasts for:</div>
        <div>
          <div>Forever</div>
          <div>
            <TextField variant="standard" label="Number" />
            <TextField variant="standard" label="Time" />
          </div>
        </div>
      </div>
      <div className="new-category-ends">
        <div>Ends at:</div>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date"
            value={date}
            onChange={(newDate) => {setDate(newDate); console.log(date)}}
            renderInput={(params) => <TextField variant="standard" {...params} />}
          />
        </LocalizationProvider>
      </div>
      <div className="new-category-goal">
        <TextField variant="standard" label="Number 0-100" type="number" InputProps={{endAdornment: <InputAdornment position="end">%</InputAdornment>}} />
        <div>of Children Tasks Completed</div>
      </div>
      <div className="new-category-priority">
        <TextField variant="standard" label="Number" type="number" />
      </div>
      <div className="new-category-tracked">
        <TextToggle option1="Yes" option2="No" />
      </div>
      <div className="new-category-color" style={{display: 'flex', flexDirection: 'row', columnGap: '0.75em', flexWrap: 'wrap'}}>
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
    </Paper>
  );
};

export default NewTask;
