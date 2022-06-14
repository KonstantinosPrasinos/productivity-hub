import { useAnimation, motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { withTheme } from "@mui/styles";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from '@mui/icons-material/Clear';
import { useRef, useState } from "react";
import IconButton from '@mui/material/IconButton';

const placeholderCategory = [
  { name: "Workout", color: "#26DE81" },
  { name: "Studying", color: "#ff0000" },
];

const placeholderGroup = [{ name: "Monday" }];

const MainContainer = styled(motion.div)`
  width: 2.5em;
  height: 2.5em;
  background: white;
  border-radius: 2.5em;
  display: flex;
  align-items: center;
  z-index: 0;
  position: relative;
  font-size: 1em;
`;

const Title = withTheme(styled(motion.span)`
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

const IconContainer = styled(IconButton)`
  position: absolute;
  display: inline-flex;
  z-index: 3;
`;

const CategoryPicker = () => {
  const [categoryExtended, setCategoryExtended] = useState(false);
  const [groupExtended, setGroupExtended] = useState(false);
  const [containerState, setContainerState] = useState(0); //0 is fully collapsed (only the add button), 1 is semi extended (only category), 2 is fully extended (category and group), 3 is 3/4 collapsed (both category and group but with no selection) and 4 is half collapsed (only category with no selection)
  const [selectedCategory, setSelectedCategory] = useState();
  const [selectedGroup, setSelectedGroup] = useState();

  const [delay, setDelay] = useState(0);
  const [containerDelay, setContainerDelay] = useState(0.15);

  const colorControls = useAnimation();
  const containerControls = useAnimation();

  const containerRef = useRef();

  const pickerVariants = {
    open: { height: "10em" },
    closed: { height: 0 },
  };

  const extendColor = () => {
    const zeroPercentContainer = () => {
      containerControls.start({width: "15em"});
    }

    containerRef.current.style.overflow = "hidden";
    colorControls.start({width: 0, height: 0, marginLeft: 0, transition: {duration: 0.3}});
    zeroPercentContainer();
  }

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setCategoryExtended(false);
    if (containerState === 1) {
      colorControls.start({width: "0.75em", height: "0.75em", marginLeft: "0.75em", transition: {delay: 0.3}});
      setContainerState(2);
      setGroupExtended(true);
    } else {
      colorControls.start({backgroundColor: category.color})
    }
    containerControls.start({width: "20.5em"});
  };

  const selectGroup = (group) => {
    if (group === "none") {
      setContainerState(4);
      containerControls.start({width: "10em"});
    } else {
      setContainerState(3);
    }
    setSelectedGroup(group);
    setGroupExtended(false);
    setCategoryExtended(false);
    extendColor();
  }

  const nullSelections = () => {
    setSelectedCategory(null);
    setSelectedGroup(null);
  }

  const handleContainerClick = () => {
    switch (containerState) {
      case 0:
        setDelay(0.1);
        setContainerState(1);
        setCategoryExtended(true);
        nullSelections();
        break;
      case 1:
        setContainerDelay(0.3);
        break;
      case 3:
        containerRef.current.style.overflow = "visible";
        setContainerState(2);
        setGroupExtended(true);
        break;
      case 4:
        containerRef.current.style.overflow = "visible";
        setDelay(0);
        setContainerState(1);
        setCategoryExtended(true);
      break;
      default:
        break;
    }
  }

  const handleNoneCategory = () => {
    selectCategory("none");
    setGroupExtended(false);
    nullSelections();
    setContainerState(0);
  }

  const containerVariants = {
    0: {width: "2.5em", transition: {delay: containerDelay, duration: 0.15}},
    1: {width: "10em"},
    2: {width: "20.5em"},
    3: {width: "17em"},
    4: {width: "10em"}
  }

  const titleVariants = {
    hidden: {scale: 0},
    visible: {scale: 1}
  }

  return (
    <MainContainer
      animate={containerState.toString()}
      variants={containerVariants}
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <AnimatePresence>{containerState === 0 && <IconContainer  sx={{fontSize: "inherit", height: "2.5em", width: "2.5em"}} component={motion.div} exit={{scale: 0, rotate: 180}} animate={{scale: 1, rotate: 0}} initial={{scale: 0, rotate: -180}}><AddIcon sx={{width: "2.5em", height: "2.5em", fontSize: "inherit", cursor: "pointer"}}/></IconContainer>}</AnimatePresence>
      {containerState > 0 && <Title onClick={() => setCategoryExtended((current) => !current)} initial="hidden" animate="visible" variants={titleVariants}>
        <TitleText>{selectedCategory ? selectedCategory.name : "Category"}</TitleText>
        <ColorCircle color={selectedCategory ? selectedCategory.color : "white"} animate={colorControls}/>
      </Title>}
      {containerState > 1 && containerState < 4 && <Separator />}
      {containerState > 1 && containerState < 4 && (
        <Title onClick={() => setGroupExtended((current) => !current)} initial="hidden" animate="visible" variants={titleVariants}>
          {selectedGroup ? selectedGroup.name : "Group"}
        </Title>
      )}
      <PickerContainer
        animate={categoryExtended ? "open" : "closed"}
        position="left"
        variants={pickerVariants}
        transition={{duration: containerState === 0 ? 0.15 : 0.3, delay: delay}}
      >
        <div style={{ marginTop: "1.25em", marginBottom: "1.25em" }}>
          <Option border onClick={() => handleNoneCategory()}>Cancel</Option>
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
        transition={{duration: containerState === 0 ? 0.15 : 0.3}}
      >
        <div style={{ marginTop: "1.25em", marginBottom: "1.25em" }}>
          <Option border onClick={() => selectGroup("none")}>None</Option>
          {placeholderGroup.map((group) => (
            <Option
              key={group.name}
              border
              onClick={() => selectGroup(group)}
            >
              {group.name}
            </Option>
          ))}
          <Option border>
            Add new <AddIcon />
          </Option>
        </div>
      </PickerContainer>
      {selectedGroup && selectedGroup !== "none" ? <ColorCircle color={selectedCategory ? selectedCategory.color : "white"} $centered animate={{scale: 50}} transition={{duration: 0.3}}/> : ""}
      {containerState > 2 && <IconButton sx={{zIndex: 3, padding: 0, marginRight: "0.5em"}} onClick={() => {setContainerState(0)}}><ClearIcon /></IconButton>}
    </MainContainer>
  );
};

export default CategoryPicker;
