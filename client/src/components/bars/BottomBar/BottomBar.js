import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';

import styles from './BottomBar.module.scss';
import IconButton from "../../buttons/IconButton/IconButton";
import Button from "../../buttons/Button/Button";
import {useContext, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {MiniPagesContext} from "../../../context/MiniPagesContext";

const BottomBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const miniPagesContext = useContext(MiniPagesContext);

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
        <div className={styles.container}>
            <IconButton
                onClick={() => {
                    setSelected('home');
                    navigate('/', {replace: true});
                }}
                label={'Home'}
                selected={selected === 'home'}
            >
                <HomeIcon sx={{fontSize: '1.5em'}} />
            </IconButton>
            <IconButton
                onClick={() => {
                    setSelected('timer');
                    navigate('/timer', {replace: true});
                }}
                label={'Timer'}
                selected={selected === 'timer'}
            >
                <TimerIcon sx={{fontSize: '1.5em'}} />
            </IconButton>
            <IconButton
                onClick={() => {
                    setSelected('settings');
                    navigate('/settings', {replace: true});
                }}
                label={'Settings'}
                selected={selected === 'settings'}
            >
                <SettingsIcon sx={{fontSize: '1.5em'}} />
            </IconButton>
            <Button
                onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'new-task'}})}
                type='square'
            >
                <AddIcon sx={{fontSize: '2em'}} />
            </Button>
        </div>
    );
};

export default BottomBar;
