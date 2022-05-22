import { Link } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import { useEffect, useRef } from 'react';

import { setScreenIsMobile } from '../../app/uiSlice';

import SideBar from './SideBar';
import { useDispatch, useSelector } from 'react-redux';

const NavBar = () => {
    const ScreenIsMobile = useSelector((state) => state.ui.ScreenIsMobile);

    const navBarContainerRef = useRef();
    const dispatch = useDispatch();

    useEffect(() => {
        window.addEventListener('resize', () => dispatch(setScreenIsMobile(checkScreenWidth())));
    }, [dispatch]);

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
            {ScreenIsMobile ? renderBottomBar() : <SideBar navBarContainerRef={navBarContainerRef}/>}
        </div>
    );
}
 
export default NavBar;