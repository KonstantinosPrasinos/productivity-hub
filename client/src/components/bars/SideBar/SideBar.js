import {useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';

import styles from './SideBar.module.scss';
import IconButton from "../../buttons/IconButton/IconButton";
import FilledButton from "../../buttons/FilledButton/FilledButton";

const SideBar = ({navBarContainerRef}) => {
    const navigate = useNavigate();

    const location = useLocation();

    const [selected, setSelected] = useState(null);

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
                <IconButton onClick={() => navigate('/')} selected={selected === 'home'} setSelected={() => setSelected('home')}><HomeIcon sx={{fontSize: '1.5em'}} /></IconButton>
                <IconButton onClick={() => navigate('/timer')} selected={selected === 'timer'} setSelected={() => setSelected('timer')}><TimerIcon sx={{fontSize: '1.5em'}} /></IconButton>
                <IconButton onClick={() => navigate('/settings')} selected={selected === 'settings'} setSelected={() => setSelected('settings')}><SettingsIcon sx={{fontSize: '1.5em'}} /></IconButton>
            </div>
            <FilledButton type='square' onClick={() => navigate('/new-task')}><AddIcon sx={{fontSize: '1.5em'}} /></FilledButton>
        </div>
    );
}
 
export default SideBar;