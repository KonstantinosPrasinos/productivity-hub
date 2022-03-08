import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import { useState, useEffect } from 'react';

import ListItem from './ListItem';

const useStyles = makeStyles((theme) => ({
    template: {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.primary.main
    },
    largeIcon: {
        color: theme.palette.secondary.secondary,
        marginRight: '0.2em',
        transform: 'translateY(0.11em)',
        fontSize: '1em'
    }
}));


const NavBar = () => {
    const [selectedList, setSelectedList] = useState();
    const classes = useStyles();
    const listsList = ['Workout', 'Reading', 'Random Thing', 'Example'];

    const [isMobileScreen, setIsMobileScreen] = useState(checkScreenWidth());

    useEffect(() => {
        window.addEventListener('resize', () => setIsMobileScreen(checkScreenWidth()));
    }, []);

    function checkScreenWidth(){
        if (window.innerWidth > 768) return false;
        return true;
    }

    const renderSideBar = () => {
        return (
            <div className={`side-nav-bar ${classes.template}`}>
                <Link to='/' className='title' onClick={() => setSelectedList(null)}>
                    <h1><HomeRoundedIcon className={classes.largeIcon} fontSize='1em' />Home</h1>
                </Link>
                <Link to='/task-list' className='title'>
                    <h1><TaskAltIcon className={classes.largeIcon} fontSize='1em' />Task Lists</h1>
                </Link>
                <div className='lists-list'>
                    {listsList.map((list, index) => (
                        <ListItem list={list} index={index} isFinal={listsList.length !== index + 1? true : false} selectedList={selectedList} setSelectedList={setSelectedList}/>
                    ))}
                </div>
                <Link to='/lists/new' className='title' onClick={() => setSelectedList(null)}>
                    <div className='new-list'>Add new +</div>
                </Link>
                <Link to='/settings' className='title settings settings-line' onClick={() => setSelectedList(null)}>
                    <h1 className='settings-content'><SettingsApplicationsRoundedIcon className={classes.largeIcon} fontSize='1em' />Settings</h1>
                </Link>
            </div>
        );
    }

    const renderBottomBar = () => {
        return (
            <div className={`bottom-nav-bar ${classes.template}`}>
                <Link to='/' className='title'>
                    <h1><HomeRoundedIcon className={classes.largeIcon} fontSize='1em' /></h1>
                </Link>
                <Link to='/settings' className='title settings'>
                    <h1 className='settings-content'><SettingsApplicationsRoundedIcon className={classes.largeIcon} fontSize='1em' /></h1>
                </Link>
            </div>
        );
    }

    return (
        <div>{isMobileScreen ? renderBottomBar() : renderSideBar()}</div>
    );
}
 
export default NavBar;