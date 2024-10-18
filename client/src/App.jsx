import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import NavBar from "./components/bars/NavBar/NavBar";
import Settings from "./pages/Settings/Settings";
import LogIn from "./pages/Auth/LogIn/LogIn";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";

import "./styles/index.scss";
import Playground from "./pages/Playground/Playground";
import NotFound from "./pages/NotFound/NotFound";
import Home from "./pages/Home/Home";
import AlertHandler from "./components/handlers/AlertHandler/AlertHandler";
import MiniPagesHandler from "./components/handlers/MiniPagesHandler/MiniPageHandler";
import ListView from "./pages/ListView/ListView";
import ChangeEmail from "./pages/Auth/ChangeEmail/ChangeEmail";
import ResetPassword from "./pages/Auth/ResetPassword/ResetPassword";
import { UserContext } from "./context/UserContext";

import { useGetSettings } from "./hooks/get-hooks/useGetSettings";
import { updateUserValidDate } from "./functions/updateUserValidDate";
import "react-day-picker/dist/style.css";
import UndoContextProvider from "./context/UndoContext";
import UndoHandler from "./components/handlers/UndoHandler/UndoHandler";
import { useGetTasks } from "@/hooks/get-hooks/useGetTasks";
import { useGetGroups } from "@/hooks/get-hooks/useGetGroups";
import { useGetCategories } from "@/hooks/get-hooks/useGetCategories";
import LoadingIndicator from "@/components/indicators/LoadingIndicator/LoadingIndicator.jsx";
import { MiniPagesContext } from "@/context/MiniPagesContext.jsx";
import { useQueryClient } from "react-query";
import { clearDatabase, openDatabase } from "./functions/openDatabase";
import { ReactQueryDevtools } from "react-query/devtools";

const syncTasks = async (queryClient) => {
  const db = await openDatabase();

  const tasks = await db.transaction("tasks").objectStore("tasks").getAll();
  const entries = await db
    .transaction("entries")
    .objectStore("entries")
    .getAll();

  const filteredTasks = tasks.filter((task) => task?.toDelete !== true);

  for (const task of filteredTasks) {
    const taskEntry = entries.find(
      (entry) => entry._id === task.currentEntryId,
    );

    queryClient.setQueryData(
      ["task-entries", taskEntry.taskId, taskEntry._id],
      () => {
        return { entry: taskEntry };
      },
    );
  }

  queryClient.setQueryData(["tasks"], () => {
    return {
      tasks: filteredTasks,
    };
  });
};

const syncCategories = async (queryClient) => {
  const db = await openDatabase();

  const categories = await db
    .transaction("categories")
    .objectStore("categories")
    .getAll();

  queryClient.setQueryData(["categories"], () => {
    return {
      categories,
    };
  });
};

const syncGroups = async (queryClient) => {
  const db = await openDatabase();

  const groups = await db.transaction("groups").objectStore("groups").getAll();

  queryClient.setQueryData(["groups"], () => {
    return {
      groups,
    };
  });
};

const syncSettings = async (queryClient) => {
  const db = await openDatabase();
  const settings = await db
    .transaction("settings")
    .objectStore("settings")
    .getAll();

  queryClient.setQueryData(["settings"], (oldData) => {
    return {
      ...settings[0],
      priorityBounds: oldData.priorityBounds,
    };
  });
};

const syncTaskEntries = async (queryClient, taskId) => {
  const db = await openDatabase();

  const entries = await db
    .transaction("entries")
    .objectStore("entries")
    .getAll();

  const entriesThatMatchTaskId = entries.filter(
    (entry) => entry.taskId.toString() === taskId,
  );

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayString = today.toISOString();

  const entriesThatArentToday = entriesThatMatchTaskId.filter(
    (entry) => entry.date !== todayString,
  );

  queryClient.setQueryData(["task-entries", taskId], () => {
    return { entries: entriesThatArentToday };
  });
};

const localLogout = async (queryClient, userContext) => {
  localStorage.removeItem("user");
  localStorage.removeItem("settings");
  userContext.dispatch({ type: "REMOVE_USER" });
  queryClient.removeQueries();
  await clearDatabase();
};

const NavLayout = () => {
  // Server state
  const { isLoading: settingsLoading } = useGetSettings();
  const { isLoading: tasksLoading } = useGetTasks();
  const { isLoading: categoriesLoading } = useGetCategories();
  const { isLoading: groupsLoading } = useGetGroups();
  const queryClient = useQueryClient();

  const miniPagesContext = useContext(MiniPagesContext);
  const userContext = useContext(UserContext);

  const eventListenerExits = useRef(false);
  const serviceWorkerListenerExists = useRef(false);

  useEffect(() => {
    const handleKeydown = (event) => {
      // Add new task
      if (
        event.ctrlKey &&
        event.key === "Enter" &&
        miniPagesContext.state.length === 0
      ) {
        miniPagesContext.dispatch({
          type: "ADD_PAGE",
          payload: { type: "new-task" },
        });
      }

      if (
        event.ctrlKey &&
        event.key === "\\" &&
        miniPagesContext.state.length === 0
      ) {
        miniPagesContext.dispatch({
          type: "ADD_PAGE",
          payload: { type: "new-category" },
        });
      }
    };

    if (!eventListenerExits.current) {
      document.addEventListener("keydown", handleKeydown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [miniPagesContext, eventListenerExits]);

  useEffect(() => {
    // Add event listener to wait for sync message for offline support
    if (!serviceWorkerListenerExists.current) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then(() => {
          navigator.serviceWorker.addEventListener("message", (event) => {
            const { type } = event.data;

            switch (type) {
              case "SYNC_COMPLETED":
                syncCategories(queryClient);
                syncGroups(queryClient);
                syncTasks(queryClient);
                break;
              case "UPDATE_TASKS":
                syncTasks(queryClient);
                break;
              case "UPDATE_CATEGORIES":
                syncCategories(queryClient);
                syncGroups(queryClient);
                break;
              case "UPDATE_GROUPS":
                syncGroups(queryClient);
                break;
              case "UPDATE_SETTINGS":
                syncSettings(queryClient);
                break;
              case "UPDATE_CATEGORIES_DELETE":
                syncCategories(queryClient);
                syncGroups(queryClient);
                syncTasks(queryClient);
                break;
              case "UNAUTHORIZED":
                localLogout(queryClient, userContext);
                break;
              default:
                if (/UPDATE_ENTRIES_*/.test(type)) {
                  syncTaskEntries(
                    queryClient,
                    type.split("UPDATE_ENTRIES_")[1],
                  );
                }
                break;
            }
          });
        });
      }

      serviceWorkerListenerExists.current = false;
    }
  }, []);

  if (settingsLoading || tasksLoading || categoriesLoading || groupsLoading) {
    return (
      <LoadingIndicator
        size={"fullscreen"}
        indicatorSize={"large"}
        type={"dots"}
      />
    );
  }

  return (
    <UndoContextProvider>
      <NavBar />
      <MiniPagesHandler />
      <UndoHandler />
      <div className="Content-Container">
        <Outlet />
      </div>
    </UndoContextProvider>
  );
};
const ProtectedLayout = () => {
  const user = useContext(UserContext);

  const location = useLocation();

  if (!user.state?.id) {
    return (
      <Navigate to="/log-in" replace state={{ path: location.pathname }} />
    );
  }

  return <Outlet />;
};

function App() {
  const navigate = useNavigate();

  const user = useContext(UserContext);
  const matchMediaHasEventListener = useRef(false);

  const { data: settings, isLoading: settingsLoading } = useGetSettings();

  const [defaultThemeChanged, setDefaultThemeChanged] = useState(false);

  const handleSetDefaultThemeChanged = () => {
    setDefaultThemeChanged((current) => !current);
  };

  useEffect(() => {
    if (!settingsLoading) {
      if (settings?.theme === "Device" && !matchMediaHasEventListener.current) {
        matchMediaHasEventListener.current = true;
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .addEventListener("change", handleSetDefaultThemeChanged);
      } else if (matchMediaHasEventListener.current) {
        matchMediaHasEventListener.current = false;
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .removeEventListener("change", handleSetDefaultThemeChanged);
      }
    }
  }, [settings?.theme]);

  useEffect(() => {
    // This attempts to get the user data from localstorage. If present it sets the user using them, if not it sets the user to false meaning they should log in.
    const loggedInUser = localStorage.getItem("user");

    if (loggedInUser) {
      const userObject = JSON.parse(loggedInUser);

      const dateValidUntil = new Date(userObject.validUntil);

      if (dateValidUntil && dateValidUntil.getTime() > new Date().getTime()) {
        user.dispatch({ type: "SET_USER", payload: userObject });
        updateUserValidDate();
      } else {
        localStorage.removeItem("user");
        navigate("/log-in");
      }
    } else {
      user.dispatch({ type: "SET_USER", payload: { isLoading: false } });
      navigate("/log-in");
    }
  }, []);

  const getDeviceTheme = () => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "Dark";
    } else {
      return "Light";
    }
  };

  const getTheme = () => {
    if (settingsLoading) return "Light";

    switch (settings?.theme) {
      case "Device":
        return getDeviceTheme();
      case "Light":
      case "Dark":
      case "Midnight":
        return settings?.theme;
      default:
        return "Light";
    }
  };

  const theme = useMemo(getTheme, [settings?.theme, defaultThemeChanged]);

  return (
    <div className={`App ${theme}`} id={"app"}>
      <AlertHandler />
      <Routes>
        <Route element={<ProtectedLayout />}>
          <Route element={<NavLayout />}>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/home" element={<Navigate to="/" />} />
            <Route path="/list" element={<ListView />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route exact path="/change-email" element={<ChangeEmail />} />
        <Route
          exact
          path="/log-in"
          element={!user.state?.id ? <LogIn /> : <Navigate to="/" />}
        />
        <Route exact path="/reset-password" element={<ResetPassword />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="*" element={<Navigate to={"/not-found"} />} />
        <Route path="/not-found" element={<NotFound />} />
      </Routes>
      <ReactQueryDevtools />
    </div>
  );
}

export default App;
