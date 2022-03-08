import {useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import ListItem from './ListItem';

const SideBar = ({classes, setShowSideBar}) => {
    const listsList = ['Workout', 'Reading', 'Random Thing', 'Example'];
    const [selectedList, setSelectedList] = useState();
    const sideBarRef = useRef();

    const collapseSideNavBar = () => {
        function setNotVisible(){
            setShowSideBar(false);
        }
        gsap.to(sideBarRef.current, {duration: 0.17, left: '-300px',  onComplete: setNotVisible});
        
    }

    useEffect(() => { 
        sideBarRef.current.style.visibility = 'visible';
        gsap.to(sideBarRef.current, {duration: 0.17, left: 0});
    }, []);

    return (
        <div className={`side-nav-bar ${classes.template}`} ref={sideBarRef}>
            <div className='side-nav-bar-content'>
                <Link to='/' className='title' onClick={() => setSelectedList(null)}>
                    <h1><HomeRoundedIcon className={classes.largeIcon} fontSize='1em' />Home</h1>
                </Link>
                <button className='collapse-side-nav-bar' fontSize='1em' onClick={collapseSideNavBar}><ArrowBackIosIcon /></button>
                <Link to='/task-list' className='title'>
                    <h1><TaskAltIcon className={classes.largeIcon} fontSize='1em' />Task Lists</h1>
                </Link>
                <div className='lists-list'>
                    {listsList.map((list, index) => (
                        <ListItem key={index} list={list} index={index} isFinal={listsList.length !== index + 1 ? true : false} selectedList={selectedList} setSelectedList={setSelectedList} />
                    ))}
                </div>
                <Link to='/lists/new' className='title' onClick={() => setSelectedList(null)}>
                    <div className='new-list'>Add new +</div>
                </Link>
                <Link to='/settings' className='title settings settings-line' onClick={() => setSelectedList(null)}>
                    <h1 className='settings-content'><SettingsApplicationsRoundedIcon className={classes.largeIcon} fontSize='1em' />Settings</h1>
                </Link>
            </div>
        </div>
    );
}
 
export default SideBar;