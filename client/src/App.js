import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import NavBar from "./components/navbar/NavBar";
import Home from "./pages/Home/HomePageContainer";
import Settings from "./pages/Settings/SettingsContainer";
import { createTheme, ThemeProvider, responsiveFontSizes } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GroupDetails from "./components/groups/GroupDetails";
import { useSelector } from "react-redux";
import GroupList from "./components/groups/GroupList";
import LogInPage from "./components/etc/LogInPage";
import RequireAuth from "./components/etc/RequireAuth";
import { useEffect } from "react";
import { setIsDarkMode, setUiTheme } from "./state/uiSlice";
import styled from 'styled-components';
import NewCategory from "./components/popups/NewCategory";
import NewTask from "./components/popups/NewTask"
import { StylesProvider } from "@mui/styles";
import TopAppBar from "./components/etc/TopAppBar/TopAppBar";

import './styles/index.scss';

let lightTheme = createTheme({
  palette: {
    type: "light",
    primary: {
      main: "#2E3440",
    },
    secondary: {
      main: "#2E3440",
    },
    background: {
      default: "#ECEFF4",
      paper: "#ffffff",
    },
    text: {
      primary: "#3B4252",
    },
    success: {
      main: "#26DE81"
    }
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
  }
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
    success: {
      main: "#26DE81"
    }
  },
});

const midnightTheme = createTheme({
  palette: {
    type: "midnight",

  }
})

lightTheme = responsiveFontSizes(lightTheme);

function App() {
  const theme = useSelector((state) => state.ui.uiTheme);
  const screenIsMobile = useSelector((state) => state.ui.screenIsMobile);

  useEffect(() => {
    setUiTheme('dark');
    // const storedTheme = localStorage.getItem('ui-theme');
    // switch (storedTheme) {
    //   case "default":
    //     if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
    //       setUiTheme('dark');
    //       setIsDarkMode(true);
    //     } else {
    //       setUiTheme('light');
    //       setIsDarkMode(false);
    //     }
    //     break;
    //   case "dark":
    //     setUiTheme('dark');
    //     setIsDarkMode(true);
    //     break;
    //   case "midnight":
    //     setUiTheme('midnight');
    //     setIsDarkMode(true);
    //     break;
    //   case "light":
    //     setUiTheme('light');
    //     setIsDarkMode(false);
    //     break;
    //   default:
    //     setUiTheme('light');
    //     setIsDarkMode(false);
    //     localStorage.setItem('ui-theme', 'light');
    //     break;
    // }
  }, [])

  const ContentContainer = styled.div`
    @media (max-width: 768px) {
      height: calc(100% - 5em);
      width: 100%;
      padding: 1em 1em 2.5em 1em;
    }

    @media (min-width: 768px) {
      width: calc(100% - 300px - 8em);
      height: 100%;
      padding: 2em;
    }
    
    flex-grow: 1;
  `;

  return (
    <StylesProvider injectFirst>
      <ThemeProvider theme={theme === 'dark' ? darkTheme : (theme === 'midnight' ? midnightTheme : lightTheme)}>
      <CssBaseline enableColorScheme />
      <BrowserRouter>
        <div className={`App light`}>
          {/* <PopupHandler /> */}
          <NavBar />
          <TopAppBar />
          <ContentContainer>
            <Routes>
              <Route exact path="/" element={<RequireAuth><Home /></RequireAuth>} />
              <Route exact path="/home" element={<RequireAuth><Navigate to="/" /></RequireAuth>} />
              <Route path="/tasks" element={<RequireAuth><GroupList /></RequireAuth>} />
              <Route path="/tasks/:id" element={<RequireAuth><GroupDetails /></RequireAuth>} />
              <Route path="/tasks/new-category" element={<RequireAuth><NewCategory /></RequireAuth>} />
              <Route path="/tasks/new-task" element={<RequireAuth><NewTask /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="/settings/:tab" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="/log-in" element={<LogInPage />} />
              <Route path="*" element={<div>Not found</div>} />
            </Routes>
          </ContentContainer>
        </div>
      </BrowserRouter>
    </ThemeProvider>
    </StylesProvider>
  );
}

export default App;
