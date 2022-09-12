import GroupCard from '../../components/home/GroupCard';
// import CategoriesTracker from '../components/home/CategoriesTracker';

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate} from 'react-router-dom';

import { setSelectedGroup } from '../../state/uiSlice';
import { useEffect } from 'react';
import styled from 'styled-components';

import {setUser} from "../../state/uiSlice";
import Category from '../../components/home/Category';

const Home = () => {
    const groups = useSelector((state) => state.content.groups);
    const screenIsMobile = useSelector((state) => state.ui.screenIsMobile);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        //This attempts to get the user data from localstorage. If present it sets the user using them, if not it sets the user to false meaning they should log in.
        const loggedInUser = localStorage.getItem("user");
        if (loggedInUser) {
          const foundUser = JSON.parse(loggedInUser);
          dispatch(setUser(foundUser));
        } else {
        //   Are commented because login in and saving info to localstorage doesn't work
        //   dispatch(setUser(false));
        //   navigate('/log-in')
        }
      }, [dispatch, navigate]);

    const renderCards = () => {
        return groups.map(group => {
            return <Category group={group.id} key={group.id}></Category>
        })
    }
    
    const renderNoGroups = () => {
        return (<div className='title' onClick={() => {dispatch(setSelectedGroup(null)); navigate('/groups/new')}}>
            <div className='new-list'>Add new +</div>
        </div>)
    }

    const TasksContainer = styled.div`
        @media (max-width: 768px) {
            width: 100%;
        }
        @media (min-width: 768px) {
            width: 60%;
        }
        display: inline-block;
        position: absolute;
        overflow-y: auto;
        padding-right: 20px;
        height: 100%;
    `;

    return (
        <div className='home'>
            {/* <TasksContainer>
                <div className="groups-container">
                    {groups.length !== 0 ? renderCards() : renderNoGroups()}
                </div>
            </TasksContainer> */}
            {!screenIsMobile && <div className="graphs">
                {/* <CategoriesTracker /> */}
            </div>}
        </div>
    );
}
 
export default Home;