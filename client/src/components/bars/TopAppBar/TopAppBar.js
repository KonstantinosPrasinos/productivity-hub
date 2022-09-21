import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import styles from './topAppBar.module.scss';
import { ScreenSizeContext } from '../../../context/ScreenSizeContext';
import IconButton from "../../buttons/IconButton/IconButton";

const TopAppBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const screenSizeContext = useContext(ScreenSizeContext);
  const [isMainPage, setIsMainPage] = useState(false);
  const currentLocation = location.pathname.slice(location.pathname.indexOf('/', 1) + 1, location.pathname.length).replaceAll('/', '');
  const capitalizedLocation = currentLocation.charAt(0).toUpperCase() + currentLocation.slice(1);

  useEffect(() => {
    if (location.pathname.split('/').length - 1 > 1) {
      setIsMainPage(false);
    } else {
      setIsMainPage(true);
    }
  }, [location])

  return (screenSizeContext.state && <div className={`${styles.container} ${!isMainPage ? styles.center : ''}`}>
    {isMainPage && <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>}
    <div className={`Headline`}>{capitalizedLocation}</div>
  </div>);
};

export default TopAppBar;
