import { useScreenSize } from "@/hooks/useScreenSize";
import DesktopNavBar from "./DesktopNavBar/DesktopNavBar";
import MobileNavBar from "./MobileNavBar/MobileNavBar";

const NavBar = () => {
  const { screenSize } = useScreenSize();

  if (screenSize !== "small") return <DesktopNavBar />
  else return <MobileNavBar />
}

export default NavBar;