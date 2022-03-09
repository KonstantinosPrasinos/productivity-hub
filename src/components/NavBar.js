import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import { useState, useEffect, useRef } from 'react';

import SideBar from './SideBar';

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
    const classes = useStyles();

    const [isMobileScreen, setIsMobileScreen] = useState(checkScreenWidth());

    const sideBarContainerRef = useRef();

    useEffect(() => {
        window.addEventListener('resize', () => setIsMobileScreen(checkScreenWidth()));
    }, []);

    function checkScreenWidth(){
        if (window.innerWidth > 768) return false;
        return true;
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
        <div className='side-bar-container' ref={sideBarContainerRef}>
            {isMobileScreen ? renderBottomBar() : <SideBar classes={classes} sideBarContainerRef={sideBarContainerRef}/>}
        </div>
    );
}
 
export default NavBar;