import HomeIcon from '@mui/icons-material/Home';
import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';

import styles from './BottomBar.module.scss';
import IconButton from "../../buttons/IconButton/IconButton";
import FilledButton from "../../buttons/FilledButton/FilledButton";
import {useState} from "react";

const BottomBar = () => {
    const [selected, setSelected] = useState('home');;
    return (
        <div className={styles.container}>
            <IconButton onClick={() => setSelected('home')} label={'Home'} selected={selected === 'home'}><HomeIcon sx={{fontSize: '1.5em'}} /></IconButton>
            <IconButton onClick={() => setSelected('timer')} label={'Timer'} selected={selected === 'timer'}><TimerIcon sx={{fontSize: '1.5em'}} /></IconButton>
            <IconButton onClick={() => setSelected('settings')} label={'Settings'} selected={selected === 'settings'}><SettingsIcon sx={{fontSize: '1.5em'}} /></IconButton>
            <FilledButton type='square'><AddIcon sx={{fontSize: '2em'}} /></FilledButton>
        </div>
    );
};

export default BottomBar;
