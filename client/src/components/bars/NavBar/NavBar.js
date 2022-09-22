import { useContext } from 'react';

import styles from './NavBar.module.scss'

import { ScreenSizeContext } from '../../../context/ScreenSizeContext';
import SideBar from "../SideBar/SideBar";
import BottomBar from "../BottomBar/BottomBar";

const NavBar = () => {
    const screenSizeContext = useContext(ScreenSizeContext);

    return (
        <div className={styles.container}>
            {screenSizeContext.state === 'small' ? <BottomBar /> : <SideBar />}
        </div>

    );
}

export default NavBar;