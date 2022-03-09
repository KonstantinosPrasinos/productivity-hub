import {useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import ListItem from './ListItem';

const SideBar = ({classes, sideBarContainerRef}) => {
    const listsList = ['Workout', 'Reading', 'Random Thing', 'Example'];
    const [selectedList, setSelectedList] = useState();
    const sideBarContentRef = useRef();
    const sideBarRef = useRef();
    const collapseRef = useRef();

    let showSideBar = true;

    const collapseSideNavBar = () => {
        function setInvisible() {
            if (sideBarContentRef.current){
                sideBarContentRef.current.style.visibility = 'hidden';
            }
        }
        const timeline = gsap.timeline();
        timeline.to(sideBarContentRef.current, {duration: 0.2, opacity: 0, onComplete: setInvisible})
            .to(sideBarContainerRef.current, {duration: 0.2, width: '2em'})
            .to(sideBarRef.current, {duration: 0.2, width: 0}, '-=0.2')
            .to(collapseRef.current, {duration: 0.2, left: '2em'}, '-=0.2')
            .to(collapseRef.current, {duration: 0.2, rotation: 180}, '-=0.2')
            .to(collapseRef.current, {duration: 0.2, color: '#000000'}, '-=0.2');
        showSideBar = false;
    }

    const expandSideNavBar = () => {
        showSideBar = true;
        function setVisible() {
            if (sideBarContentRef.current){
                sideBarContentRef.current.style.visibility = 'visible';
            }
        }
        const timeline = gsap.timeline();
        if (sideBarContainerRef.current && showSideBar){
            timeline.to(collapseRef.current, {duration: 0.2, color: 'var(--background-color)'})
                .to(collapseRef.current, {duration: 0.2, rotation: 0}, '-=0.2')
                .to(collapseRef.current, {duration: 0.2, left: 'calc(280px - 3em)'}, '-=0.2')
                .to(sideBarRef.current, {duration: 0.2, width: 'calc(100% - 10px)', onComplete: setVisible}, '-=0.2')
                .to(sideBarContainerRef.current, {duration: 0.2, width: '300px'}, '-=0.2')
                .to(sideBarContentRef.current, {duration: 0.2, opacity: 1}, );
        }
        
    }

    const renderSideBar = () => {
        return (
            <div className='side-nav-bar-content' ref={sideBarContentRef}>
                <Link to='/' className='title' onClick={() => setSelectedList(null)}>
                    <h1><HomeRoundedIcon className={classes.largeIcon} fontSize='1em' />Home</h1>
                </Link>
                <Link to='/task-list' className='title' onClick={() => setSelectedList(null)}>
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
        )
    }

    return (
        <div className={`side-nav-bar ${classes.template}`} ref={sideBarRef} >
            {showSideBar && renderSideBar()}
            <button className='collapse-side-nav-bar' fontSize='1em' onClick={() => showSideBar ? collapseSideNavBar() : expandSideNavBar()} ref={collapseRef}><ArrowBackIosIcon /></button>
        </div>
    );
}
 
export default SideBar;