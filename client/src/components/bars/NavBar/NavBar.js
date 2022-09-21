import { Link } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import { useEffect, useRef, useContext } from 'react';

import styles from './NavBar.module.scss'

import { ScreenSizeContext } from '../../../context/ScreenSizeContext';
import SideBar from "../SideBar/SideBar";
import BottomBar from "../BottomBar/BottomBar";

const NavBar = () => {
    const screenSizeContext = useContext(ScreenSizeContext);

    const navBarContainerRef = useRef();

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
            {screenSizeContext.state === 'small' ? <BottomBar /> : <SideBar navBarContainerRef={navBarContainerRef} />}
        </div>

    );
}

export default NavBar;