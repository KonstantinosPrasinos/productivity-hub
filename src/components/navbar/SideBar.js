import {useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useLocation, useNavigate } from 'react-router';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import ListItem from './ListItem';

import { useSelector } from 'react-redux';


const SideBar = ({navBarContainerRef}) => {
    const groups = useSelector((state) => state.content.groups);
    const [selectedItem, setSelectedItem] = useState(null);
    
    const sideBarContentRef = useRef();
    const sideBarRef = useRef();
    const collapseRef = useRef();
    const homeRef = useRef();
    const taskRef = useRef();
    const settingsRef = useRef();
    const navigate = useNavigate();

    const location = useLocation();

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
    }

    useEffect(() => {
        const handleLocation = () => {
            switch (location.pathname) {
                case '/':
                    setSelectedItem(homeRef);
                    break;
                case '/lists':
                    setSelectedItem(taskRef);
                    break;
                case '/settings':
                    setSelectedItem(settingsRef);
                    break;
                default:
                    break;
            }
        }
        
        generateObj();
        handleLocation();
    }, [location, groups]);

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

    const addGroupButtons = () => {
        return groups.map((list, index) => {
            return <ListItem key={index} list={list} index={index} selectedItem={selectedItem} setSelectedItem={setSelectedItem} isFinal={groups.length !== index + 1 ? true : false} />
        })
    }

    const addNewGroupButton = () => {
        return (<div className='new-list title' onClick={() => {setSelectedItem(null); navigate('/lists/new')}}>Add new +</div>)
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
                <Link to='/' className='title' onClick={() => setSelectedItem('home')}>
                    <h1 className='home-button-title'><HomeRoundedIcon fontSize='1em' className='big-icon' /><p className={`title-text selection ${selectedItem && selectedItem === homeRef ? 'selected' : ''}`} ref={homeRef}>Home</p></h1>
                </Link>
                <Link to='/lists' className='title' onClick={() => setSelectedItem(taskRef)}>
                    <h1><CheckCircleIcon fontSize='1em' className='big-icon' /><p className={`title-text selection ${selectedItem && selectedItem === taskRef ? 'selected' : ''}`} ref={taskRef}>Task Lists</p></h1>
                </Link>
                <div className='lists-list'>
                    {groups.length !== 0 ? addGroupButtons() : addNewGroupButton()}
                </div>
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