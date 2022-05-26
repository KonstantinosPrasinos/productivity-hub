import { useTheme } from "@emotion/react";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

const BottomBar = () => {
    const theme = useTheme();
    const navigate = useNavigate()
;
    return (<div className="bottom-nav-bar" style={{width: "100%", height: "5em", display: "flex", alignItems: "end"}}>
        <div className="bottom-nav-bar-left" style={{borderRadius: "0 1em 0 0", height: "5em", width: "calc(50% - 3em)", background: theme.palette.background.paper, position: "relative"}}>
            <IconButton sx={{position: "absolute", left: "calc(50% - 1em)", top: "0.75em", padding: 0}} onClick={() => navigate('/')}><HomeRoundedIcon sx={{fontSize: "2em", color: theme.palette.primary.main}}/></IconButton>
        </div>
        <div className="bottom-nav-bar-center" style={{width: "6em", height: "75%", background: theme.palette.background.paper}}>
            <div className="bottom-nav-bar-outer-circle" style={{width: "6em", height: "6em", overflow: "hidden", background: theme.palette.background.default, position: "absolute", borderRadius: "3em", top: "-2.3em", boxSizing: "border-box", border: "0.5em solid", borderColor: theme.palette.background.default}}>
                <div className="bottom-nav-bar-inner-circle" style={{width: "6em", height: "6em", background: theme.palette.background.paper, position: "relative"}}>
                    <IconButton sx={{position: "absolute", left: "calc(50% - 1.25em)", top: "0.75em", padding: 0}} onClick={() => navigate('/tasks/new')}><AddIcon sx={{fontSize: "2em", color: theme.palette.primary.main}}/></IconButton>
                </div>
            </div>
        </div>
        <div className="bottom-nav-bar-right" style={{borderRadius: "1em 0 0 0", height: "5em", width: "calc(50% - 3em)", background: theme.palette.background.paper, position: "relative"}}>
            <IconButton sx={{position: "absolute", left: "calc(50% - 1em)", top: "0.75em", padding: 0}} onClick={() => navigate('/groups')}><CheckCircleIcon sx={{fontSize: "2em", color: theme.palette.primary.main}}/></IconButton>
        </div>
    </div>);
}
 
export default BottomBar;