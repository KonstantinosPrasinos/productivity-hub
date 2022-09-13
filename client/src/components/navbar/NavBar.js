import { Link } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import styled from 'styled-components';
import { useEffect, useRef, useContext } from 'react';


import SideBar from './SideBar';
import BottomBar from './BottomBar';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenSizeContext } from '../../context/ScreenSizeContext';

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

    const NavBarContainer = styled.div`
        @media (max-width: 768px) {
            height: 0;
            width: 0;
        }
        @media (min-width: 768px) {
            height: 100%;
            width: 300px;
        }
    `;

    return (
        <NavBarContainer className='nav-bar-container' ref={navBarContainerRef}>
            {screenSizeContext.state === 'small' ? '' : <SideBar navBarContainerRef={navBarContainerRef}/>}
        </NavBarContainer>
    );
}
 
export default NavBar;