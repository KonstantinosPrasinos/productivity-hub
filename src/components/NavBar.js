import { Link } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import { useState, useEffect, useRef } from 'react';

import SideBar from './SideBar';


const NavBar = () => {
    const [isMobileScreen, setIsMobileScreen] = useState(checkScreenWidth());

    const navBarContainerRef = useRef();

    useEffect(() => {
        window.addEventListener('resize', () => setIsMobileScreen(checkScreenWidth()));
    }, []);

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
        <div className='nav-bar-container' ref={navBarContainerRef}>
            {isMobileScreen ? renderBottomBar() : <SideBar navBarContainerRef={navBarContainerRef}/>}
        </div>
    );
}
 
export default NavBar;