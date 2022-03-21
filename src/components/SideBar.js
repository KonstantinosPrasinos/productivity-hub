import {useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import ListItem from './ListItem';

const SideBar = ({navBarContainerRef}) => {
    const listsList = ['Workout', 'Reading', 'Random Thing', 'Example'];
    const [selectedItem, setSelectedItem] = useState();
    
    const sideBarContentRef = useRef();
    const sideBarRef = useRef();
    const collapseRef = useRef();
    const homeRef = useRef();
    const taskRef = useRef();
    const settingsRef = useRef();

    let showSideBar = true;

    

    const generateObj = () => {
        const date = new Date();
        const obj = {};
        obj.name = 'Workout';
        obj.parameterType = ['n', 'n']
        obj[`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()+1}`] = {
            'Push-Ups': 10,
            'Pull-Ups': 20
        };
        obj[`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`] = {
            'Push-Ups': 12,
            'Pull-Ups': 23
        };
        console.log(obj);
    }

    useEffect(() => {
        generateObj();
    });

    const collapseSideNavBar = () => {
        function setInvisible() {
            if (sideBarContentRef.current){
                sideBarContentRef.current.style.visibility = 'hidden';
            }
        }
        const timeline = gsap.timeline();
        timeline.to(sideBarContentRef.current, {duration: 0.2, opacity: 0, onComplete: setInvisible})
            .to(navBarContainerRef.current, {duration: 0.2, width: '2em'})
            .to(sideBarRef.current, {duration: 0.2, width: 0}, '-=0.2')
            .to(collapseRef.current, {duration: 0.2, left: '2em'}, '-=0.2')
            .to(collapseRef.current, {duration: 0.2, rotation: 180}, '-=0.2');
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
        if (navBarContainerRef.current && showSideBar){
            timeline.to(collapseRef.current, {duration: 0.2, rotation: 0})
                .to(collapseRef.current, {duration: 0.2, left: 'calc(280px - 3em)'}, '-=0.2')
                .to(sideBarRef.current, {duration: 0.2, width: 'calc(100% - 10px)', onComplete: setVisible}, '-=0.2')
                .to(navBarContainerRef.current, {duration: 0.2, width: '300px'}, '-=0.2')
                .to(sideBarContentRef.current, {duration: 0.2, opacity: 1}, '-=0.2');
        }
    }

    useEffect(() => {
        const sideBarContainer = navBarContainerRef.current;
        
        return function cleanUp() {
            sideBarContainer.style.width = '300px';
        }
    }, [navBarContainerRef])

    const renderSideBar = () => {
        return (
            <div className='side-nav-bar-content' ref={sideBarContentRef}>
                <Link to='/' className='title' onClick={() => {setSelectedItem(homeRef); console.log(window.location.pathname)}}>
                    <h1 className='home-button-title'><HomeRoundedIcon fontSize='1em' className='big-icon' /><p className={`title-text selection ${selectedItem && selectedItem === homeRef ? 'selected' : ''}`} ref={homeRef}>Home</p></h1>
                </Link>
                <Link to='/lists' className='title' onClick={() => setSelectedItem(taskRef)}>
                    <h1><CheckCircleIcon fontSize='1em' className='big-icon' /><p className={`title-text selection ${selectedItem && selectedItem === taskRef ? 'selected' : ''}`} ref={taskRef}>Task Lists</p></h1>
                </Link>
                <div className='lists-list'>
                    {listsList.map((list, index) => (
                        <ListItem key={index} list={list} index={index} isFinal={listsList.length !== index + 1 ? true : false} selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
                    ))}
                </div>
                {/* <Link to='/lists/new' className='title' onClick={() => setSelectedItem(null)}>
                    <div className='new-list'>Add new +</div>
                </Link> */}
                <Link to='/settings' className='title settings' onClick={() => setSelectedItem(settingsRef)}>
                    <h1 className='settings-content'><SettingsApplicationsRoundedIcon fontSize='1em' className='big-icon' /><p className={`title-text selection ${selectedItem && selectedItem === settingsRef ? 'selected' : ''}`} ref={settingsRef}>Settings</p></h1>
                </Link>
            </div>
        )
    }

    return (
        <div className={'side-nav-bar'} ref={sideBarRef} >
            {showSideBar && renderSideBar()}
            <button className='collapse-side-nav-bar' fontSize='1em' onClick={() => showSideBar ? collapseSideNavBar() : expandSideNavBar()} ref={collapseRef}><ArrowBackIosIcon /></button>
        </div>
    );
}
 
export default SideBar;