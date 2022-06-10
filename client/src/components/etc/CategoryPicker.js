import { useAnimation, motion } from "framer-motion";
import Collapse from "@mui/material/Collapse";
import styled, { useTheme } from "styled-components";
import { withTheme } from "@mui/styles";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";

const placeholderCategory = [
  { name: "Workout", color: "#26DE81" },
  { name: "Studying", color: "red" },
];

const MainContainer = styled(motion.div)`
  width: 10em;
  height: 2.5em;
  background-color: white;
  border-radius: 2.5em;
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 0;
`;

const Title = withTheme(styled.span`
  font-weight: bolder;
  color: ${(props) => props.theme.palette.text.default};
  font-size: 1.5em;
  z-index: 2;
`);

const PickerContainer = styled(motion.div)`
  height: 0;
  width: 10em;
  background-color: white;
  border-radius: 0 0 1.1em 1.1em;
  position: absolute;
  top: 1.25em;
  left: 0;
  z-index: 1;
  /* padding-top: 1.25em; */
  /* padding-bottom: 1.25em; */
  display: flex;
  flex-direction: column;
  align-items: center;
  /* overflow-y: auto; */
  overflow: hidden;
`;

const Option = withTheme(styled.div`
  height: 2em;
  width: 7em;
  background-color: ${(props) => props.color || "white"};
  border: ${(props) =>
    props.border ? `2px solid ${props.theme.palette.primary.main}` : ""};
  border-radius: 2em;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.5em;
  cursor: pointer;
`);

const CategoryPicker = () => {
  const [categoryExtended, setCategoryExtended] = useState(true);
  const [containerExtended, setContainerExtended] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Category");
  const [selectedGroup, setSelectedGroup] = useState("Group");

  const categoryVariants = {
      open: {height: "10em"},
      closed: {height: 0}
  }

  const containerVariants = {
      open: {width: "20em"},
      closed: {width: "10em"}
  }

  return (
    <div style={{ position: "relative" }}>
      <MainContainer onClick={() => setCategoryExtended((current) => !current)} animate={containerExtended ? "open" : "false"} variants={containerVariants}>
        <Title>{selectedCategory}</Title>
        <Title>{selectedGroup}</Title>
      </MainContainer>
      <PickerContainer animate={categoryExtended ? "open" : "closed"} variants={categoryVariants}>
        <div style={{marginTop: "1.25em", marginBottom: "1.25em"}}>
        {placeholderCategory.map((category) => (
          <Option key={category.name} color={category.color} onClick={() => setSelectedCategory(category.name)}>
            {category.name}
          </Option>
        ))}
        <Option border>
          Add new <AddIcon />
        </Option>
        </div>
      </PickerContainer>
    </div>
  );
};

export default CategoryPicker;
