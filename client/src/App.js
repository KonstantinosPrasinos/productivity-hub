import {Routes, Route, Navigate, useNavigate} from "react-router-dom";
import NavBar from './components/bars/NavBar/NavBar';
import Settings from "./pages/Settings/Settings";
import LogIn from "./pages/LogIn/LogIn";
import RequireAuth from "./components/etc/RequireAuth";
import {useContext, useEffect, useRef, useState} from "react";

import "./styles/index.scss";
import Playground from "./pages/Playground/Playground";
import NewCategory from './pages/NewCategory/NewCategory';
import NotFound from "./pages/NotFound/NotFound";
import {ScreenSizeContext} from "./context/ScreenSizeContext";
import NewTask from "./pages/NewTask/NewTask";
import HomePageContainer from "./pages/Home/Home";
import AlertHandler from "./components/utilities/AlertHandler/AlertHandler";
import MiniPagesHandler from "./components/utilities/MiniPagesHandler/MiniPageHandler";
import ListView from "./pages/ListView/ListView";
import {useDispatch, useSelector} from "react-redux";
import ChangeEmail from "./pages/ChangeEmail/ChangeEmail";
import {ModalContext} from "./context/ModalContext";
import {AnimatePresence} from "framer-motion";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import {UserContext} from "./context/UserContext";
import {useSettings} from "./hooks/useSettings";
import {setSettings} from "./state/settingsSlice";

function App() {
    const screenSizeContext = useContext(ScreenSizeContext);
    const modalContext = useContext(ModalContext);

    const settings = useSelector((state) => state?.settings);
    
    const user = useContext(UserContext);
    const matchMediaHasEventListener = useRef(false);

    const {getSettings} = useSettings();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(async () => {
      //This attempts to get the user data from localstorage. If present it sets the user using them, if not it sets the user to false meaning they should log in.
      const loggedInUser = localStorage.getItem("user");
      const settings = localStorage.getItem("settings");

      if (loggedInUser) {
          const userObject = JSON.parse(loggedInUser);
          user.dispatch({type: "SET_USER", payload: userObject});

          if (!settings) {
              await getSettings();
          } else {
              dispatch(setSettings(JSON.parse(settings)));
          }
      } else {
          navigate('/log-in')
      }
    }, []);

    function checkScreenWidth() {
        if (window.innerWidth > 768) return 'big';
        return 'small';
    }

    useEffect(() => {
        screenSizeContext.dispatch({type: 'SET_SIZE', payload: checkScreenWidth()});
        window.addEventListener('resize', () => {
            screenSizeContext.dispatch({type: 'SET_SIZE', payload: checkScreenWidth()})
        });
    }, [screenSizeContext]);

    useEffect(() => {
        setTheme(getTheme());

        const handleDefaultTheme = () => {
            setTheme(getTheme());
        }

        if (settings?.theme === 'Device' && !matchMediaHasEventListener.current) {
            matchMediaHasEventListener.current = true;
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleDefaultTheme);
        } else if (matchMediaHasEventListener.current) {
            matchMediaHasEventListener.current = false;
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleDefaultTheme);
        }

    }, [settings?.theme])

    const getDeviceTheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'Dark';
        } else {
            return 'Light';
        }
    }

    const getTheme = () => {
        switch (settings?.theme) {
            case 'Device':
                return getDeviceTheme();
            case 'Light':
            case 'Dark':
            case 'Midnight':
                return settings?.theme;
            default:
                return 'Light'
        }
    }

    const [theme, setTheme] = useState(getTheme());

    return (
        <div className={`App ${theme}`}>
            <NavBar/>
            <AlertHandler />
            <MiniPagesHandler />
            <AnimatePresence>{modalContext.state && <ChangeEmail />}</AnimatePresence>
            <div className="Content-Container">
                <Routes>
                    <Route
                        exact
                        path="/"
                        element={
                            <RequireAuth>
                                <HomePageContainer />
                            </RequireAuth>
                        }
                    />
                    <Route
                        exact
                        path="/home"
                        element={
                            <RequireAuth>
                                <Navigate to="/"/>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/list"
                        element={
                            <RequireAuth>
                                <ListView />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/new-category"
                        element={
                            <RequireAuth>
                                <NewCategory />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/new-task"
                        element={
                            <RequireAuth>
                                <NewTask />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <RequireAuth>
                                <Settings/>
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/settings/:tab"
                        element={
                            <RequireAuth>
                                <Settings/>
                            </RequireAuth>
                        }
                    />
                    <Route path="/playground" element={<Playground/>}/>
                    <Route
                        exact
                        path="/change-email"
                        element={
                            <RequireAuth>
                                <ChangeEmail />
                            </RequireAuth>
                        }
                    />
                    <Route
                        exact
                        path="/log-in"
                        element={
                            !user.state?.id ? <LogIn/> : <Navigate to="/" />
                        }
                    />
                    <Route
                        exact
                        path="/password-reset"
                        element={
                            !user.state?.id ? <ResetPassword/> : <Navigate to="/" />
                        }
                    />
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </div>
        </div>
    );
}

export default App;
