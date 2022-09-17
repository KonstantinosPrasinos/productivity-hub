import {useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useLocation, useNavigate } from 'react-router-dom';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import ListItem from '../../navbar/ListItem';

import { useSelector } from 'react-redux';

import styles from './SideBar.module.scss';

const SideBar = ({navBarContainerRef}) => {
    const groups = useSelector((state) => state.content.groups);
    const [selectedGroup, setSelectedGroup] = useState(null);
    
    const sideBarContentRef = useRef();
    const sideBarRef = useRef();
    const collapseRef = useRef();
    const homeRef = useRef();
    const taskRef = useRef();
    const settingsRef = useRef();
    const navigate = useNavigate();

    const location = useLocation();

    let showSideBar = true;

    // Temp
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
                    setSelectedGroup(homeRef);
                    break;
                case '/groups':
                    setSelectedGroup(taskRef);
                    break;
                case '/settings':
                    setSelectedGroup(settingsRef);
                    break;
                default:
                    break;
            }
        }
        
        generateObj();
        handleLocation();
    }, [location, groups]);

    const collapseSideNavBar = () => {
        const timeline = gsap.timeline();
        timeline.to(navBarContainerRef.current, {duration: 0.2, width: '2em'})
            .to(sideBarRef.current, {duration: 0.2, left: '-300px'}, '-=0.2')
            .to(collapseRef.current, {duration: 0.2, left: '2em'}, '-=0.2')
            .to(collapseRef.current, {duration: 0.2, rotation: 180}, '-=0.2');
        showSideBar = false;
    }

    const expandSideNavBar = () => {
        showSideBar = true;
        const timeline = gsap.timeline();
        if (navBarContainerRef.current && showSideBar){
            timeline.to(collapseRef.current, {duration: 0.2, rotation: 0})
                .to(collapseRef.current, {duration: 0.2, left: 'calc(280px - 3em)'}, '-=0.2')
                .to(sideBarRef.current, {duration: 0.2, left: 0}, '-=0.2')
                .to(navBarContainerRef.current, {duration: 0.2, width: '300px'}, '-=0.2');
        }
    }

    const addGroupButtons = () => {
        return groups.map((group, index) => {
            return <ListItem key={group.id} index={index} group={group} selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} isFinal={groups.length !== index + 1 ? true : false} />
        })
    }

    const addNewGroupButton = () => {
        return (<div className='new-group title' onClick={() => {setSelectedGroup(null); navigate('/groups/new')}}>Add new +</div>)
    }

    useEffect(() => {
        const sideBarContainer = navBarContainerRef.current;
        
        return function cleanUp() {
            sideBarContainer.style.width = '300px';
        }
    }, [navBarContainerRef])

    const renderSideBar = () => {
        return (
            <div className={styles.container} ref={sideBarContentRef}>
                <div  className='title' onClick={() => {setSelectedGroup('home'); navigate('/')}}>
                    <h1 className='home-button-title'><HomeRoundedIcon fontSize='1em' className='big-icon' /><p className={`title-text selection ${selectedGroup && selectedGroup === homeRef ? 'selected' : ''}`} ref={homeRef}>Home</p></h1>
                </div>
                <div className='title' onClick={() => {setSelectedGroup(taskRef); navigate('/groups')}}>
                    <h1><CheckCircleIcon fontSize='1em' className='big-icon' /><p className={`title-text selection ${selectedGroup && selectedGroup === taskRef ? 'selected' : ''}`} ref={taskRef}>Task Groups</p></h1>
                </div>
                <div className='groups-group'>
                    {groups.length !== 0 ? addGroupButtons() : addNewGroupButton()}
                </div>
                <div className='title settings' onClick={() => {setSelectedGroup(settingsRef); navigate('/settings')}}>
                    <h1 className='settings-content'><SettingsApplicationsRoundedIcon fontSize='1em' className='big-icon' /><p className={`title-text selection ${selectedGroup && selectedGroup === settingsRef ? 'selected' : ''}`} ref={settingsRef}>Settings</p></h1>
                </div>
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