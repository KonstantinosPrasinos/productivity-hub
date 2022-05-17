import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import NavBar from "./components/navbar/NavBar";
import Home from "./components/home/Home";
import Settings from "./components/settings/Settings";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GroupDetails from "./components/groups/GroupDetails";
import NewGroup from "./components/popups/NewGroup";
import { useDispatch, useSelector } from "react-redux";
import GroupList from "./components/groups/GroupList";
import PopupHandler from "./components/popups/PopupHandler";
import { useEffect } from "react";
import {setUser} from "./app/uiSlice";

const lightTheme = createTheme({
  palette: {
    type: "light",
    primary: {
      main: "#3B4252",
    },
    secondary: {
      main: "#3B4252",
    },
    background: {
      default: "#ECEFF4",
      paper: "#ffffff",
    },
    text: {
      primary: "#3B4252",
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
  },
});

const darkTheme = createTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#ffffff",
    },
    secondary: {
      main: "#f50057",
    },
    warning: {
      main: "#ff9800",
    },
    background: {
      default: "#3B4252",
      paper: "#2E3440",
    },
    text: {
      primary: "#ffffff",
    },
  },
});

function App() {
  const mode = useSelector((state) => state.ui.isDarkMode);

  const dispatch = useDispatch();

  useEffect(() => {
    //This attempts to get the user data from localstorage. If present it sets the user using them, if not it sets the user to false meaning they should log in.
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      dispatch(setUser(foundUser));
    } else {
      //Is commented because login in and saving info to localstorage doesn't work
      // dispatch(setUser(false));
    }
  }, [dispatch]);

  return (
    <ThemeProvider theme={mode ? darkTheme : lightTheme}>
      <CssBaseline enableColorScheme />
      <BrowserRouter>
        <div className="App">
          <PopupHandler />
          <NavBar />
          <div className="content">
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/home" element={<Navigate to="/" />} />
              <Route path="/groups" element={<GroupList />} />
              <Route path="/groups/:id" element={<GroupDetails />} />
              <Route path="/groups/new" element={<NewGroup />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<div>Not found</div>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
