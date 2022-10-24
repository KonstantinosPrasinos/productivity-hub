import {useContext, useEffect, useState} from 'react';

import styles from './NavBar.module.scss'
import IconButton from "../../buttons/IconButton/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import SettingsIcon from "@mui/icons-material/Settings";
import Button from "../../buttons/Button/Button";
import AddIcon from "@mui/icons-material/Add";
import {useLocation, useNavigate} from "react-router-dom";
import {MiniPagesContext} from "../../../context/MiniPagesContext";

const NavBar = () => {
    const navigate = useNavigate();

    const location = useLocation();

    const [selected, setSelected] = useState(null);

    const miniPagesContext = useContext(MiniPagesContext);

    useEffect(() => {
        switch (location.pathname) {
            case '/':
            case '/home':
                setSelected('home')
                break;
            // case '/timer':
            //     setSelected('timer')
            //     break;
            case '/list':
                setSelected('list')
                break;
            case '/settings':
                setSelected('settings')
                break;
            default:
                break;
        }
    }, [location]);

    return (
        <div className={styles.container}>
            <div className={`${styles.navBar}`}>
                <IconButton
                    onClick={() => navigate('/', {replace: true})}
                    selected={selected === 'home'}
                    setSelected={() => setSelected('home')}
                >
                    <HomeIcon sx={{fontSize: '1.5em'}}/>
                </IconButton>
                {/*<IconButton onClick={() => navigate('/timer', {replace: true})} selected={selected === 'timer'}*/}
                {/*            setSelected={() => setSelected('timer')}><TimerIcon sx={{fontSize: '1.5em'}}/></IconButton>*/}
                <IconButton
                    onClick={() => {
                        setSelected('tasks');
                        navigate('/list', {replace: true});
                    }}
                    selected={selected === 'tasks'}
                >
                    <FormatListBulletedIcon sx={{fontSize: '1.5em'}}/>
                </IconButton>
                <IconButton
                    onClick={() => navigate('/settings', {replace: true})} selected={selected === 'settings'}
                    setSelected={() => setSelected('settings')}
                >
                    <SettingsIcon sx={{fontSize: '1.5em'}}/>
                </IconButton>
                <Button
                    type='square'
                    onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'new-task'}})}
                >
                    <AddIcon sx={{fontSize: '1.5em'}}/>
                </Button>
            </div>
        </div>

    );
}

export default NavBar;