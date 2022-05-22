import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import NavBar from "./components/navbar/NavBar";
import Home from "./components/home/Home";
import Settings from "./components/settings/Settings";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GroupDetails from "./components/groups/GroupDetails";
import NewGroup from "./components/popups/NewGroup";
import { useSelector } from "react-redux";
import GroupList from "./components/groups/GroupList";
import PopupHandler from "./components/popups/PopupHandler";
import LogInPage from "./components/etc/LogInPage";
import RequireAuth from "./components/etc/RequireAuth";
import { useEffect } from "react";

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

  return (
    <ThemeProvider theme={mode ? darkTheme : lightTheme}>
      <CssBaseline enableColorScheme />
      <BrowserRouter>
        <div className="App">
          <PopupHandler />
          <NavBar />
          <div className="content">
            <Routes>
              <Route exact path="/" element={<RequireAuth><Home /></RequireAuth>} />
              <Route exact path="/home" element={<RequireAuth><Navigate to="/" /></RequireAuth>} />
              <Route path="/groups" element={<RequireAuth><GroupList /></RequireAuth>} />
              <Route path="/groups/:id" element={<RequireAuth><GroupDetails /></RequireAuth>} />
              <Route path="/groups/new" element={<RequireAuth><NewGroup /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="/log-in" element={<LogInPage />} />
              <Route path="*" element={<div>Not found</div>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
