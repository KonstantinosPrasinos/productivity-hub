import styles from "./settings.module.scss";
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

const Settings = () => {
  const location = useLocation();
  const [currentLocation, setCurrentLocation] = useState("account");
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

  return (
    <div className={styles.settingsContainer}>
      {(screenSizeContext.state !== 'small' || currentLocation === "/settings") && (
        <div className={styles.redirectContainer}>
          <RedirectButton
            icon={<AccountCircleIcon />}
            label={"Account"}
            location={"/settings/account"}
          />
          <RedirectButton
            icon={<NotificationsIcon />}
            label={"Notifications"}
            location={"/settings/notifications"}
          />
          <RedirectButton
            icon={<PaletteIcon />}
            label={"Appearance"}
            location={"/settings/appearance"}
          />
          <RedirectButton
            icon={<KeyIcon />}
            label={"Integrations"}
            location={"/settings/integrations"}
          />
          <RedirectButton
            icon={<LanguageIcon />}
            label={"Language"}
            location={"/settings/language"}
          />
          <RedirectButton
            icon={<InfoIcon />}
            label={"About"}
            location={"/settings/about"}
          />
        </div>
      )}
      {(screenSizeContext.state !== 'small' || currentLocation !== "/settings") && (
        <div className={styles.contentContainer}>
          {currentLocation}
          
        </div>
      )}
    </div>
  );
};

export default Settings;
