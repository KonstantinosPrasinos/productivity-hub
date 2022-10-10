import {useContext, useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';

import styles from './SideBar.module.scss';
import IconButton from "../../buttons/IconButton/IconButton";
import Button from "../../buttons/Button/Button";
import {MiniPagesContext} from "../../../context/MiniPagesContext";

const SideBar = () => {
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
            case '/timer':
                setSelected('timer')
                break;
            case '/settings':
                setSelected('settings')
                break;
            default:
                break;
        }
    }, [location]);

    return (
        <div className={`Stack-Container ${styles.container} `}>
            <div className={`Stack-Container ${styles.buttonsContainer}`}>
                <IconButton onClick={() => navigate('/', {replace: true})} selected={selected === 'home'}
                            setSelected={() => setSelected('home')}><HomeIcon sx={{fontSize: '1.5em'}}/></IconButton>
                <IconButton onClick={() => navigate('/timer', {replace: true})} selected={selected === 'timer'}
                            setSelected={() => setSelected('timer')}><TimerIcon sx={{fontSize: '1.5em'}}/></IconButton>
                <IconButton onClick={() => navigate('/settings', {replace: true})} selected={selected === 'settings'}
                            setSelected={() => setSelected('settings')}><SettingsIcon
                    sx={{fontSize: '1.5em'}}/></IconButton>
            </div>
            <Button type='square'
                    onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'new-task'}})}><AddIcon
                sx={{fontSize: '1.5em'}}/></Button>
        </div>
    );
}

export default SideBar;