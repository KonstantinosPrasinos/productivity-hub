import {Routes, Route, Navigate, useNavigate, useLocation, Outlet} from "react-router-dom";
import NavBar from './components/bars/NavBar/NavBar';
import Settings from "./pages/Settings/Settings";
import LogIn from "./pages/Auth/LogIn/LogIn";
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
import ChangeEmail from "./pages/Auth/ChangeEmail/ChangeEmail";
import ResetPassword from "./pages/Auth/ResetPassword/ResetPassword";
import {UserContext} from "./context/UserContext";

import {useGetSettings} from "./hooks/get-hooks/useGetSettings";
import {ReactQueryDevtools} from "react-query/devtools";
import {updateUserValidDate} from "./functions/updateUserValidDate";
import 'react-day-picker/dist/style.css';


const NavLayout = () => (
    <>
        <NavBar/>
        <MiniPagesHandler />
        <div className="Content-Container">
            <Outlet />
        </div>
    </>
)
const ProtectedLayout = () => {
    const userExists = useContext(UserContext).state?.id;
    const location = useLocation();

    if (!userExists) {
        return <Navigate to="/log-in" replace state={{path: location.pathname}} />
    }

    return (<Outlet />)
}

function App() {
    const location = useLocation();
    
    const user = useContext(UserContext);
    const matchMediaHasEventListener = useRef(false);

    const navigate = useNavigate();

    const {data: settings, isLoading: settingsLoading} = useGetSettings();

    useEffect(() => {
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
          user.dispatch({type: "SET_USER", payload: {isLoading: false}})
          navigate('/log-in');
      }
    }, []);

    const [defaultThemeChanged, setDefaultThemeChanged] = useState(false);

    const handleSetDefaultThemeChanged = () => {
        setDefaultThemeChanged(current => !current)
    }

    useEffect(() => {
        if (!settingsLoading) {
            if (settings?.theme === 'Device' && !matchMediaHasEventListener.current) {
                matchMediaHasEventListener.current = true;
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSetDefaultThemeChanged);
            } else if (matchMediaHasEventListener.current) {
                matchMediaHasEventListener.current = false;
                window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSetDefaultThemeChanged);
            }
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
            <AlertHandler />
            {/*<AnimatePresence mode="wait">*/}
                <Routes key={location.pathname}>
                    <Route path="/" element={<ProtectedLayout />}>
                        <Route path="/" element={<NavLayout />}>
                            <Route
                                exact
                                path="/"
                                element={
                                    <Home />
                                }
                            />
                            <Route
                                exact
                                path="/home"
                                element={
                                    <Navigate to="/"/>
                                }
                            />
                            <Route
                                path="/list"
                                element={
                                    <ListView />
                                }
                            />
                            <Route
                                path="/new-category"
                                element={
                                    <NewCategory />
                                }
                            />
                            <Route
                                path="/new-task"
                                element={
                                    <NewTask />
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <Settings/>
                                }
                            />
                            <Route path="/playground" element={<Playground/>}/>
                        </Route>
                    </Route>
                    <Route
                        exact
                        path="/change-email"
                        element={
                            <ChangeEmail/>
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
                        path="/reset-password"
                        element={
                            <ResetPassword/>
                        }
                    />
                    <Route path="*" element={<Navigate to={"/not-found"} />}/>
                    <Route path="/not-found" element={<NotFound/>}/>
                </Routes>
            {/*</AnimatePresence>*/}
            <ReactQueryDevtools />
        </div>
    );
}

export default App;
