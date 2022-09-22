import {Routes, Route, BrowserRouter, Navigate} from "react-router-dom";
import NavBar from './components/bars/NavBar/NavBar';
import Settings from "./pages/Settings/SettingsContainer";
import LogInPage from "./components/etc/LogInPage";
import RequireAuth from "./components/etc/RequireAuth";
import {useContext, useEffect} from "react";
import TopAppBar from "./components/bars/TopAppBar/TopAppBar";

import "./styles/index.scss";
import {ThemeContext} from "./context/ThemeContext";
import Playground from "./pages/Playground/Playground";
import NewCategory from './pages/NewCategory/NewCategory';
import NotFound from "./pages/NotFound/NotFound";
import {ScreenSizeContext} from "./context/ScreenSizeContext";
import NewTask from "./pages/NewTask/NewTask";
import HomePageContainer from "./pages/Home/Home";

function App() {

    const themeContext = useContext(ThemeContext);
    const screenSizeContext = useContext(ScreenSizeContext);

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

    useEffect(() => {
        themeContext.dispatch({type: "SET_THEME", payload: "dark"});
        const storedTheme = localStorage.getItem("ui-theme");
        switch (storedTheme) {
            case "default":
                if (
                    window.matchMedia &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches
                ) {
                    themeContext.dispatch({type: "SET_THEME", payload: "dark"});
                } else {
                    themeContext.dispatch({type: "SET_THEME", payload: "light"});
                }
                break;
            case "dark":
                themeContext.dispatch({type: "SET_THEME", payload: "dark"});
                break;
            case "light":
                themeContext.dispatch({type: "SET_THEME", payload: "light"});
                break;
            default:
                themeContext.dispatch({type: "SET_THEME", payload: "light"});
                localStorage.setItem("ui-theme", "light");
                break;
        }
    }, [themeContext]);

    useEffect(() => {
        screenSizeContext.dispatch({type: 'SET_SIZE', payload: checkScreenWidth()});
        window.addEventListener('resize', () => {
            screenSizeContext.dispatch({type: 'SET_SIZE', payload: checkScreenWidth()})
        });
    }, [screenSizeContext]);

    function checkScreenWidth() {
        if (window.innerWidth > 768) return 'big';
        return 'small';
    }

    return (
        <BrowserRouter>
            <div className={`App ${themeContext.state ? themeContext.state : ''}`}>
                <NavBar/>
                <TopAppBar/>
                <div className="content-container">
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
                                    <div>at</div>
                                </RequireAuth>
                            }
                        />
                        <Route
                            path="/tasks/:id"
                            element={
                                <RequireAuth>
                                    <div>ads</div>
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
                            path="/new-task"
                            element={
                                <RequireAuth>
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
                        <Route path="/log-in" element={<LogInPage/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
