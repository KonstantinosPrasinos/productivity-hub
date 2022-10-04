import styles from "./Settings.module.scss";
import RedirectButton from "../../components/buttons/RedirectButton/RedirectButton";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaletteIcon from "@mui/icons-material/Palette";
import KeyIcon from "@mui/icons-material/Key";
import LanguageIcon from "@mui/icons-material/Language";
import InfoIcon from "@mui/icons-material/Info";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ScreenSizeContext } from "../../context/ScreenSizeContext";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import TextButton from "../../components/buttons/TextButton/TextButton";
import Divider from "../../components/utilities/Divider/Divider";
import Chip from "../../components/buttons/Chip/Chip";
import {ThemeContext} from "../../context/ThemeContext";

const Settings = () => {
  const location = useLocation();
  const [currentLocation, setCurrentLocation] = useState('account');
  const screenSizeContext = useContext(ScreenSizeContext);
  const themeContext = useContext(ThemeContext);

  const [selectedTheme, setSelectedTheme] = useState('light');

  const themeChips = ['Light', 'Dark', 'Black'];

  useEffect(() => {
    console.log(selectedTheme)
    themeContext.dispatch({type: "SET_THEME", payload: selectedTheme});
  }, [selectedTheme]);

  useEffect(() => {
    setCurrentLocation(
      location.pathname.slice(
        location.pathname.indexOf("/", 1) + 1,
        location.pathname.length
      )
    );
  }, [location]);

  return (
    <div className={`Rounded-Container ${styles.container}`}>
      {/*{(screenSizeContext.state !== 'small' || currentLocation === "/settings") && (*/}
      {/*  <div className={styles.redirectContainer}>*/}
      {/*    <RedirectButton*/}
      {/*      label={"Account"}*/}
      {/*      location={"/settings/account"}*/}
      {/*    />*/}
      {/*    <RedirectButton*/}
      {/*      label={"Notifications"}*/}
      {/*      location={"/settings/notifications"}*/}
      {/*    />*/}
      {/*    <RedirectButton*/}
      {/*      label={"Appearance"}*/}
      {/*      location={"/settings/appearance"}*/}
      {/*    />*/}
      {/*    <RedirectButton*/}
      {/*      label={"Integrations"}*/}
      {/*      location={"/settings/integrations"}*/}
      {/*    />*/}
      {/*    <RedirectButton*/}
      {/*      label={"Language"}*/}
      {/*      location={"/settings/language"}*/}
      {/*    />*/}
      {/*    <RedirectButton*/}
      {/*      label={"About"}*/}
      {/*      location={"/settings/about"}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*)}*/}
      <div className={`Stack-Container ${styles.contentContainer}`}>
        <div className={styles.segment}>
          <div className={'Title'}>Account</div>
          <div className={`Horizontal-Flex-Container ${styles.accountContainer}`}>
            <AccountCircleIcon sx={{fontSize: '4em'}} />
            <div className={styles.email}>konstantinos.prasinos@gmail.com</div>
          </div>
          <InputWrapper type={'vertical'} label={'Manage Account'}>
            <TextButton to={'/change-email'}>Change Email</TextButton>
            <TextButton to={'/reset-password'}>Reset Password</TextButton>
            <TextButton type={'important'} to={'/delete-account'}>Delete Account</TextButton>
          </InputWrapper>
          <InputWrapper type={'vertical'} label={'Task Data'}>
            <TextButton to={'/download-data'}>Download your task data</TextButton>
          </InputWrapper>
        </div>
        <Divider />
        {/*<div className={styles.segment}>*/}
        {/*  <div className={'Title'}>Notifications</div>*/}
        {/*</div>*/}
        <div className={styles.segment}>
          <div className={'Title'}>Appearance</div>
          <div className={'Horizontal-Flex-Container'}>
            <InputWrapper label={'Theme'}>
              {themeChips.map((chip, index) => (
                  <Chip
                      selected={selectedTheme}
                      setSelected={setSelectedTheme}
                      value={chip.toLowerCase()}
                      key={index}
                  >
                    {chip}
                  </Chip>
              ))}
            </InputWrapper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
