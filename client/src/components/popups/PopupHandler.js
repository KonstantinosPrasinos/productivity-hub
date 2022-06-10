import { useSelector } from "react-redux";
// import NewGroup from "./NewGroup";
// import NewTask from "./NewTask";
import { useTheme } from "@emotion/react";

const PopupHandler = () => {
    const shownPopup = useSelector((state) => state.ui.shownPopup);

    const theme = useTheme();

    return (
        <span className="popup-handler-container">
            {/* needs redesign */}
            {/* <div style={{position: 'fixed', width: '100%', height: '100%', background: theme.palette.background.default, zIndex: 10, opacity: 0.75, display: shownPopup === 'none' ? 'none' : 'block'}}>
                {shownPopup === 'task' && <NewTask />}
                {shownPopup === 'group' && <NewGroup />}
            </div> */}
        </span>
    );
}
 
export default PopupHandler;