import { useAnimation, motion } from "framer-motion";
import styled from "styled-components";
import { withTheme } from "@mui/styles";
import AddIcon from "@mui/icons-material/Add";
import { useRef, useState } from "react";

const placeholderCategory = [
  { name: "Workout", color: "#26DE81" },
  { name: "Studying", color: "#ff0000" },
];

const placeholderGroup = [{ name: "Monday" }];

const MainContainer = styled(motion.div)`
  width: 10em;
  height: 2.5em;
  background: white;
  border-radius: 2.5em;
  display: flex;
  align-items: center;
  z-index: 0;
  position: relative;
`;

const Title = withTheme(styled.span`
  width: 9em;
  display: inline-block;
  font-weight: bolder;
  color: ${(props) => props.theme.palette.text.default};
  font-size: 1.5em;
  z-index: 3;
  cursor: pointer;
  text-align: center;
`);

const PickerContainer = styled(motion.div)`
  height: 0;
  width: 10em;
  background-color: white;
  border-radius: 0 0 1.1em 1.1em;
  position: absolute;
  top: 1.25em;
  left: ${(props) => (props.position === "left" ? 0 : "")};
  right: ${(props) => (props.position === "right" ? 0 : "")};
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
`;

const Option = withTheme(styled.div`
  height: 2em;
  width: 7em;
  background-color: ${(props) => props.color || "white"};
  border: ${(props) => props.border ? `2px solid ${props.theme.palette.primary.main}` : ""};
  border-radius: 2em;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.5em;
  cursor: pointer;
`);

const ColorCircle = styled(motion.div)`
  font-size: 0.67em;
  display: inline-block;
  border-radius: 50%;
  background-color: ${(props) => props.color ? props.color : "white"};
  margin-left: 0;
  position: ${(props) => props.$centered ? "absolute" : "relative"};
  width: ${(props) => props.$centered ? "0.75em" : "0"};
  height: ${(props) => props.$centered ? "0.75em" : "0"};
  left: ${(props) => props.$centered ? "calc(40% - 0.375em)" : ""};
  z-index: ${(props) => props.$centered ? "2" : ""};
  margin-bottom: 0.0625em;
`;

const Separator = styled(motion.div)`
  display: inline-block;
  height: 1.5em;
  width: 0.2em;
  background-color: black;
  z-index: 3;
`;

const TitleText = styled.div`
  display: inline-block;
`;

const CategoryPicker = () => {
  const [categoryExtended, setCategoryExtended] = useState(true);
  const [groupExtended, setGroupExtended] = useState(false);
  const [containerExtended, setContainerExtended] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Category");
  const [selectedGroup, setSelectedGroup] = useState("Group");

  const colorControls = useAnimation();
  const containerControls = useAnimation();

  const containerRef = useRef();

  const pickerVariants = {
    open: { height: "10em" },
    closed: { height: 0 },
  };

  const selectCategory = (category) => {
    setSelectedCategory(category.name);
    setCategoryExtended(false);
    if (!containerExtended) {
      colorControls.start({width: "0.75em", height: "0.75em", marginLeft: "0.75em", transition: {delay: 0.3}})
    } else {
      colorControls.start({backgroundColor: category.color})
    }
    setContainerExtended(true);
    containerControls.start({width: "20.5em"});
  };

  const extendColor = () => {
    containerRef.current.style.overflow = "hidden";
    colorControls.start({width: 0, height: 0, marginLeft: 0, transition: {duration: 0.3}});
    containerControls.start({fontSize: 0.5})
  }

  const selectGroup = (group) => {
    setSelectedGroup(group);
    setGroupExtended(false);
    setCategoryExtended(false);
    extendColor();
  }

  return (
    <MainContainer
      animate={containerControls}
      ref={containerRef}
    >
      <Title onClick={() => setCategoryExtended((current) => !current)}>
        <TitleText>{selectedCategory}</TitleText>
        <ColorCircle color={"red"} animate={colorControls}/>
      </Title>
      {containerExtended && <Separator />}
      {containerExtended && (
        <Title onClick={() => setGroupExtended((current) => !current)}>
          {selectedGroup}
        </Title>
      )}
      <PickerContainer
        animate={categoryExtended ? "open" : "closed"}
        position="left"
        variants={pickerVariants}
      >
        <div style={{ marginTop: "1.25em", marginBottom: "1.25em" }}>
          {placeholderCategory.map((category) => (
            <Option
              key={category.name}
              color={category.color}
              onClick={() => selectCategory(category)}
            >
              {category.name}
            </Option>
          ))}
          <Option border>
            Add new <AddIcon />
          </Option>
        </div>
      </PickerContainer>
      <PickerContainer
        animate={groupExtended ? "open" : "closed"}
        position="right"
        variants={pickerVariants}
      >
        <div style={{ marginTop: "1.25em", marginBottom: "1.25em" }}>
          <Option border>None</Option>
          {placeholderGroup.map((group) => (
            <Option
              key={group.name}
              border
              onClick={() => selectGroup(group.name)}
            >
              {group.name}
            </Option>
          ))}
          <Option border>
            Add new <AddIcon />
          </Option>
        </div>
      </PickerContainer>
      {selectedGroup !== "Group" ? <ColorCircle color={"red"} $centered animate={{scale: 50}} transition={{duration: 0.3}}/> : ""}
    </MainContainer>
  );
};

export default CategoryPicker;
