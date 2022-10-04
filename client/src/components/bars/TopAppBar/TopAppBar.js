import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import styles from './topAppBar.module.scss';
import { ScreenSizeContext } from '../../../context/ScreenSizeContext';
import IconButton from "../../buttons/IconButton/IconButton";

const TopAppBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const screenSizeContext = useContext(ScreenSizeContext);

  const [isMainPage, setIsMainPage] = useState(false);
  const [pageName, setPageName] = useState('');

  useEffect(() => {


    switch (location.pathname) {
      case '/':
        setIsMainPage(true);
        setPageName('Home');
        break;
      case '/settings':
        setIsMainPage(true);
        setPageName('Settings');
        break;
      case '/timer':
        setIsMainPage(true);
        setPageName('Settings');
        break;
      default:
        setIsMainPage(false);
        const currentLocation = location.pathname.slice(location.pathname.indexOf('/', 1) + 1, location.pathname.length).replaceAll('/', '');
        setPageName((currentLocation.charAt(0).toUpperCase() + currentLocation.slice(1)).replaceAll('-', ' '));
        break;
    }
  }, [location])

  return (screenSizeContext.state === 'small' && <div className={`${styles.container} ${!isMainPage ? styles.center : ''}`}>
    {!isMainPage && <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>}
    <div className={`Headline`}>{pageName}</div>
  </div>);
};

export default TopAppBar;
