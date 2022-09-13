import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import NavBar from "./components/navbar/NavBar";
import Home from "./pages/Home/HomePageContainer";
import Settings from "./pages/Settings/SettingsContainer";
import {
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GroupDetails from "./components/groups/GroupDetails";
import { useSelector } from "react-redux";
import GroupList from "./components/groups/GroupList";
import LogInPage from "./components/etc/LogInPage";
import RequireAuth from "./components/etc/RequireAuth";
import { useContext, useEffect } from "react";
import styled from "styled-components";
import NewCategory from "./components/popups/NewCategory";
import NewTask from "./components/popups/NewTask";
import { StylesProvider } from "@mui/styles";
import TopAppBar from "./components/etc/TopAppBar/TopAppBar";

import "./styles/index.scss";
import { ThemeContext } from "./context/ThemeContext";

function App() {

  const themeContext = useContext(ThemeContext);

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
    themeContext.dispatch({ type: "SET_THEME", payload: "dark" });
    const storedTheme = localStorage.getItem("ui-theme");
    switch (storedTheme) {
      case "default":
        if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
          themeContext.dispatch({ type: "SET_THEME", payload: "dark" });
        } else {
          themeContext.dispatch({ type: "SET_THEME", payload: "light" });
        }
        break;
      case "dark":
        themeContext.dispatch({ type: "SET_THEME", payload: "dark" });
        break;
      case "light":
        themeContext.dispatch({ type: "SET_THEME", payload: "light" });
        break;
      default:
        themeContext.dispatch({ type: "SET_THEME", payload: "light" });
        localStorage.setItem("ui-theme", "light");
        break;
    }
  }, [themeContext]);

  return (
    <BrowserRouter>
      <div className={`App ${themeContext.state ? themeContext.state : ''}`}>
        {/* <PopupHandler /> */}
        <NavBar />
        <TopAppBar />
        <div className="content-container">
          <Routes>
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
                  <Navigate to="/" />
                </RequireAuth>
              }
            />
            <Route
              path="/tasks"
              element={
                <RequireAuth>
                  <GroupList />
                </RequireAuth>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <RequireAuth>
                  <GroupDetails />
                </RequireAuth>
              }
            />
            <Route
              path="/tasks/new-category"
              element={
                <RequireAuth>
                  <NewCategory />
                </RequireAuth>
              }
            />
            <Route
              path="/tasks/new-task"
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
                  <Settings />
                </RequireAuth>
              }
            />
            <Route
              path="/settings/:tab"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route path="/log-in" element={<LogInPage />} />
            <Route path="*" element={<div>Not found</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
