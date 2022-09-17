import { Link } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import { useEffect, useRef, useContext } from 'react';

import styles from './NavBar.module.scss'

import { ScreenSizeContext } from '../../../context/ScreenSizeContext';
import SideBar from "../SideBar/SideBar";

const NavBar = () => {
    const screenSizeContext = useContext(ScreenSizeContext);

    const navBarContainerRef = useRef();

    useEffect(() => {
        screenSizeContext.dispatch({type: 'SET_SIZE', payload: checkScreenWidth()});
        window.addEventListener('resize', () => {screenSizeContext.dispatch({type: 'SET_SIZE', payload: checkScreenWidth()})});
    }, [screenSizeContext]);

    function checkScreenWidth(){
        if (window.innerWidth > 768) return false;
        return true;
    }

    const renderBottomBar = () => {
        return (
            <div className={`bottom-nav-bar`}>
                <Link to='/' className='title'>
                    <h1><HomeRoundedIcon fontSize='1em' /></h1>
                </Link>
                <Link to='/settings' className='title settings'>
                    <h1 className='settings-content'><SettingsApplicationsRoundedIcon fontSize='1em' /></h1>
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container} ref={navBarContainerRef}>
            {screenSizeContext.state === 'small' ? '' : <SideBar navBarContainerRef={navBarContainerRef} />}
        </div>

    );
}

export default NavBar;