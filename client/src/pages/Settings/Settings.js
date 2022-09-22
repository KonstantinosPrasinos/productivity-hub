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
import Account from "./Subpages/Account/Account";
import Notifications from "./Subpages/Notifications/Notification";
import Appearance from "./Subpages/Appearance/Appearance";
import Integrations from "./Subpages/Integrations/Integrations";
import About from "./Subpages/About/About";
import Language from "./Subpages/Language/Language";

const Settings = () => {
  const location = useLocation();
  const [currentLocation, setCurrentLocation] = useState('account');
  const screenSizeContext = useContext(ScreenSizeContext);

  useEffect(() => {
    setCurrentLocation(
      location.pathname.slice(
        location.pathname.indexOf("/", 1) + 1,
        location.pathname.length
      )
    );
  }, [location]);

  const [group, setGroup] = useState(["Option 1", "Option 2", "Option 3"]);
  const [selected, setSelected] = useState(0);

  const renderContent = () => {
    console.log(currentLocation);
    switch (currentLocation) {
      case 'account':
        return (<Account />)
      case 'notifications':
        return (<Notifications />)
      case 'appearance':
        return (<Appearance />)
      case 'integrations':
        return (<Integrations />)
      case 'language':
        return (<Language />)
      case 'about':
        return (<About />)
    }
  }

  return (
    <div className={styles.settingsContainer}>
      {(screenSizeContext.state !== 'small' || currentLocation === "/settings") && (
        <div className={styles.redirectContainer}>
          <RedirectButton
            label={"Account"}
            location={"/settings/account"}
          />
          <RedirectButton
            label={"Notifications"}
            location={"/settings/notifications"}
          />
          <RedirectButton
            label={"Appearance"}
            location={"/settings/appearance"}
          />
          <RedirectButton
            label={"Integrations"}
            location={"/settings/integrations"}
          />
          <RedirectButton
            label={"Language"}
            location={"/settings/language"}
          />
          <RedirectButton
            label={"About"}
            location={"/settings/about"}
          />
        </div>
      )}
      {(screenSizeContext.state !== 'small' || currentLocation !== "/settings") && (
        <div className={styles.contentContainer}>
          {renderContent()}

        </div>
      )}
    </div>
  );
};

export default Settings;
