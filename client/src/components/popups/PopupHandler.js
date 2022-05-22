import { useDispatch, useSelector } from "react-redux";
import NewGroup from "./NewGroup";
import NewTask from "./NewTask";
import { setShownPopup } from "../../app/uiSlice";
import { useTheme } from "@emotion/react";

const PopupHandler = () => {
    const shownPopup = useSelector((state) => state.ui.shownPopup);
    const user = useSelector((state) => state.ui.user);

    const theme = useTheme();
    const dispatch = useDispatch();

    return (
        <span className="popup-handler-container">
            {/* needs redesign */}
            <div style={{position: 'fixed', width: '100%', height: '100%', background: theme.palette.background.default, zIndex: 10, opacity: shownPopup === 'login' ? 1 : 0.75, display: shownPopup === 'none' ? 'none' : 'block'}}>
                {shownPopup === 'task' && <NewTask onClick />}
                {shownPopup === 'group' && <NewGroup />}
            </div>
        </span>
    );
}
 
export default PopupHandler;