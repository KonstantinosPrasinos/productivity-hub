import {Routes, Route, BrowserRouter, Navigate} from "react-router-dom";
import NavBar from './components/bars/NavBar/NavBar';
import Settings from "./pages/Settings/Settings";
import LogInPage from "./pages/LogInPage/LogInPage";
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
import TaskList from "./pages/TaskList/TaskList";
import {useSelector} from "react-redux";
import ChangeEmail from "./pages/ChangeEmail/ChangeEmail";
import {ModalContext} from "./context/ModalContext";
import {AnimatePresence} from "framer-motion";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

function App() {
    const screenSizeContext = useContext(ScreenSizeContext);
    const modalContext = useContext(ModalContext);

    const userTheme = useSelector((state) => state?.user.settings.theme);
    const matchMediaHasEventListener = useRef(false);

    // useEffect(() => {
    //   //This attempts to get the user data from localstorage. If present it sets the user using them, if not it sets the user to false meaning they should log in.
    //   const loggedInUser = localStorage.getItem("user");
    //   if (loggedInUser) {
    //     const foundUser = JSON.parse(loggedInUser);
    //     dispatch(setUser(foundUser));
    //   } else {
    //     //   Are commented because login in and saving info to localstorage doesn't work
    //     //   dispatch(setUser(false));
    //     //   navigate('/log-in')
    //   }
    // }, [dispatch, navigate]);

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

        if (userTheme === 'Device' && !matchMediaHasEventListener.current) {
            matchMediaHasEventListener.current = true;
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleDefaultTheme);
        } else if (matchMediaHasEventListener.current) {
            matchMediaHasEventListener.current = false;
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleDefaultTheme);
        }

    }, [userTheme])

    const getDeviceTheme = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'Dark';
        } else {
            return 'Light';
        }
    }

    useEffect(() => {

    }, [userTheme]);

    const getTheme = () => {
        switch (userTheme) {
            case 'Device':
                return getDeviceTheme();
            case 'Light':
            case 'Dark':
            case 'Midnight':
                return userTheme;
            default:
                return 'Light'
        }
    }

    const [theme, setTheme] = useState(getTheme());

    return (
        <BrowserRouter>
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
                            path="/tasks"
                            element={
                                <RequireAuth>
                                    <TaskList />
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/new-category"
                            element={
                                <RequireAuth>
                                    <NewCategory></NewCategory>
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/new-task"
                            element={
                                <RequireAuth>
                                    <NewTask></NewTask>
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
                            element={<LogInPage/>}
                        />
                        <Route
                            exact
                            path="/password-reset"
                            element={<ResetPassword/>}
                        />
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
