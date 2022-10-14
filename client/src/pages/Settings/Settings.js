import styles from "./Settings.module.scss";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PaletteIcon from "@mui/icons-material/Palette";
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import InfoIcon from "@mui/icons-material/Info";
import {useEffect, useState} from "react";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import Chip from "../../components/buttons/Chip/Chip";
import EmailIcon from '@mui/icons-material/Email';
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import Button from "../../components/buttons/Button/Button";
import {useDispatch, useSelector} from "react-redux";
import IconButton from "../../components/buttons/IconButton/IconButton";
import TwitterIcon from '@mui/icons-material/Twitter';
import {setDefaultGoal, setDefaultPriority, setDefaultStep, setTheme} from "../../state/userSlice";

const Settings = () => {
  const {theme, defaults} = useSelector((state) => state?.user.settings);
  const email = useSelector((state) => state?.user.email);

  const [selectedTheme, setSelectedTheme] = useState(theme);

  const dispatch = useDispatch();

  const themeChips = ['Device', 'Light', 'Dark', 'Black'];

  useEffect(() => {
      if (theme !== selectedTheme) {
          dispatch(setTheme(selectedTheme));
      }
  }, [selectedTheme])

  const handleProjectClick = () => {
    window.open('https://github.com/KonstantinosPrasinos/productivity-hub');
  }

  const handleGithubClick = () => {
    window.open('https://github.com/KonstantinosPrasinos/');
  }

  const handleLinkedInClick = () => {
    window.open('https://www.linkedin.com/in/konstantinos-prasinos-ab2a201bb/')
  }

  const handleTwitterClick = () => {
    window.open('https://twitter.com/ConstantDeenos');
  }

  return (
    <div className={`Rounded-Container ${styles.container} Stack-Container`}>
      <div className={`Headline Horizontal-Flex-Container ${styles.header}`}><AccountCircleIcon />Account</div>
      <section className={'Stack-Container'}>
        <InputWrapper label={'Email'}>
          <TextBoxInput size={'max'} value={email} icon={<EmailIcon />}></TextBoxInput>
        </InputWrapper>
        <InputWrapper label={'Password'}>
          <Button filled={false} size={'small'}>Change your Password</Button>
        </InputWrapper>
        <InputWrapper label={'Your Data'}>
          <Button filled={false} size={'small'}>Download Data</Button>
        </InputWrapper>
        <InputWrapper label={'Account Removal'}>
          <Button filled={false} size={'small'}>Delete Account</Button>
        </InputWrapper>
      </section>
      <div className={`Headline Horizontal-Flex-Container ${styles.header}`}><PaletteIcon />Appearance</div>
      <section className={'Stack-Container'}>
        <InputWrapper label={'Theme'}>
          {themeChips.map(theme => <Chip key={theme} value={theme} selected={selectedTheme} setSelected={setSelectedTheme}>{theme}</Chip>)}
        </InputWrapper>
      </section>
      <div className={`Headline Horizontal-Flex-Container ${styles.header}`}><AutoFixNormalIcon />Defaults</div>
      <section className={'Stack-Container'}>
        <InputWrapper label={'Priority'}>
          <TextBoxInput type={'number'} value={defaults.priority} setValue={(e) => dispatch(setDefaultPriority(e))}></TextBoxInput>
        </InputWrapper>
        <InputWrapper label={'Number Task Step'}>
          <TextBoxInput type={'number'} value={defaults.step} setValue={(e) => dispatch(setDefaultStep(e))}></TextBoxInput>
        </InputWrapper>
        <InputWrapper label={'Goal Number'}>
          <TextBoxInput type={'number'} value={defaults.goal} setValue={(e) => dispatch(setDefaultGoal(e))}></TextBoxInput>
        </InputWrapper>
      </section>
      <div className={`Headline Horizontal-Flex-Container ${styles.header}`}><InfoIcon />About</div>
      <InputWrapper label={'App'} type={'vertical'}>
        Available as a Web App, on Android and on Windows.
        You can view the source code for this app on the github page below.
        <Button onClick={handleProjectClick}>Project Source Code<GitHubIcon /></Button>
      </InputWrapper>
      <InputWrapper label={'Creator'} type={'vertical'}>
        This app was created by Konstantinos Prasinos.
        <div className={'Horizontal-Flex-Container'}>
          <IconButton onClick={handleGithubClick}><GitHubIcon /></IconButton>
          <IconButton onClick={handleLinkedInClick}><LinkedInIcon /></IconButton>
          <IconButton onClick={handleTwitterClick}><TwitterIcon /></IconButton>
        </div>
      </InputWrapper>
    </div>
  );
};

export default Settings;
