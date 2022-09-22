import GroupCard from "../../components/home/GroupCard";
// import CategoriesTracker from '../components/home/CategoriesTracker';

import {useSelector, useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";

import {useContext, useEffect} from "react";

import Category from "../../components/home/Category";
import {ScreenSizeContext} from "../../context/ScreenSizeContext";
import styles from './home.module.scss'

const Home = () => {
    // const groups = useSelector((state) => state.content.groups);
    const screenSizeContext = useContext(ScreenSizeContext);

    return (
        <div className={}>
            <div className={styles.leftSide}></div>
            {screenSizeContext.state !== 'small' &&
                <div className={styles.rightSide}>

                </div>}
        </div>
    );
};

export default Home;
