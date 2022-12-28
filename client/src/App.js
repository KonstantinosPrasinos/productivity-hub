import {Routes, Route, Navigate, useNavigate, useLocation} from "react-router-dom";
import NavBar from './components/bars/NavBar/NavBar';
import Settings from "./pages/Settings/Settings";
import LogIn from "./pages/LogIn/LogIn";
import RequireAuth from "./components/etc/RequireAuth";
import {useContext, useEffect, useMemo, useRef, useState} from "react";

import "./styles/index.scss";
import Playground from "./pages/Playground/Playground";
import NewCategory from './pages/NewCategory/NewCategory';
import NotFound from "./pages/NotFound/NotFound";
import NewTask from "./pages/NewTask/NewTask";
import Home from "./pages/Home/Home";
import AlertHandler from "./components/handlers/AlertHandler/AlertHandler";
import MiniPagesHandler from "./components/handlers/MiniPagesHandler/MiniPageHandler";
import ListView from "./pages/ListView/ListView";
import ChangeEmail from "./pages/ChangeEmail/ChangeEmail";
import {ModalContext} from "./context/ModalContext";
import {AnimatePresence} from "framer-motion";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import {UserContext} from "./context/UserContext";

import {useGetSettings} from "./hooks/get-hooks/useGetSettings";
import {ReactQueryDevtools} from "react-query/devtools";
import {updateUserValidDate} from "./functions/updateUserValidDate";

function App() {
    const modalContext = useContext(ModalContext);
    const location = useLocation();


    
    const user = useContext(UserContext);
    const matchMediaHasEventListener = useRef(false);

    const navigate = useNavigate();

    const {data: settings, isLoading: settingsLoading} = useGetSettings(user.state?.id && true);

    useEffect(async () => {
      //This attempts to get the user data from localstorage. If present it sets the user using them, if not it sets the user to false meaning they should log in.
      const loggedInUser = localStorage.getItem("user");

      if (loggedInUser) {
          const userObject = JSON.parse(loggedInUser);

          const dateValidUntil = new Date(userObject.validUntil);

          if (dateValidUntil && dateValidUntil.getTime() > (new Date()).getTime()) {
              user.dispatch({type: "SET_USER", payload: userObject});
              updateUserValidDate();
          } else {
              localStorage.removeItem("user");
              navigate("/log-in");
          }
      } else {
          navigate('/log-in');
      }
    }, []);

    const [defaultThemeChanged, setDefaultThemeChanged] = useState(false);

    const handleSetDefaultThemeChanged = () => {
        setDefaultThemeChanged(current => !current)
    }

    useEffect(() => {
        if (settingsLoading) return;

        if (settings?.theme === 'Device' && !matchMediaHasEventListener.current) {
            matchMediaHasEventListener.current = true;
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSetDefaultThemeChanged);
        } else if (matchMediaHasEventListener.current) {
            matchMediaHasEventListener.current = false;
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSetDefaultThemeChanged);
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
        if (settingsLoading) return 'Light';

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

    const theme = useMemo(getTheme, [settings?.theme, defaultThemeChanged]);

    return (
        <div className={`App ${theme}`}>
                {user.state?.id && <NavBar/>}
                <AlertHandler />
                {user.state?.id && < MiniPagesHandler />}
                <AnimatePresence>{modalContext.state && <ChangeEmail />}</AnimatePresence>
                <div className="Content-Container">
                    <AnimatePresence exitBeforeEnter={true}>
                        <Routes key={location.pathname}>
                            <Route
                                exact
                                path="/"
                                element={
                                    <RequireAuth>
                                        <Home />
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
                    </AnimatePresence>
                </div>
            <ReactQueryDevtools />
        </div>
    );
}

export default App;
