import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { AlertsContext } from "../context/AlertsContext";
import { useQueryClient } from "react-query";
import { clearDatabase } from "@/functions/openDatabase.js";

const handleLogin = async (response, dispatch) => {
  const data = await response.json();
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setHours(date.getHours() - 1);
  dispatch({
    type: "SET_USER",
    payload: {
      id: data.user?._id,
      email: data.user?.local.email,
      googleLinked: data.user?.googleLinked,
    },
  });
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: data.user?._id,
      email: data.user?.local.email,
      validUntil: date,
      googleLinked: data.user?.googleLinked,
    }),
  );
};

export function useAuth() {
  const { dispatch } = useContext(UserContext);
  const alertsContext = useContext(AlertsContext);
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACK_END_IP}/api/user/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        },
      );

      if (!response.ok) {
        alertsContext.dispatch({
          type: "ADD_ALERT",
          payload: {
            type: "error",
            title: "Failed to log in",
            message: (await response.json()).message,
          },
        });
      } else {
        await handleLogin(response, dispatch);
      }
    } catch (error) {
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          title: "Failed to log in",
          message: "Connection to server couldn't be made",
        },
      });
    }

    setIsLoading(false);
  };

  const loginGoogle = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACK_END_IP}/api/user/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        },
      );

      if (!response.ok) {
        alertsContext.dispatch({
          type: "ADD_ALERT",
          payload: {
            type: "error",
            title: "Failed to log in",
            message: (await response.json()).message,
          },
        });
      } else {
        await handleLogin(response, dispatch);
      }
    } catch (error) {
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          title: "Failed to log in",
          message: "Connection to server couldn't be made",
        },
      });
    }

    setIsLoading(false);
  };

  const register = async (email, password) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACK_END_IP}/api/user/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        alertsContext.dispatch({
          type: "ADD_ALERT",
          payload: {
            type: "error",
            title: "Failed to sign up",
            message: data.message,
          },
        });
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          title: "Failed to sign up",
          message: "Connection to server couldn't be made",
        },
      });
      setIsLoading(false);
      return false;
    }

    setIsLoading(false);
    return true;
  };

  const logout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACK_END_IP}/api/user/logout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        alertsContext.dispatch({
          type: "ADD_ALERT",
          payload: {
            type: "error",
            title: "Failed to log out user",
            message: "Please try again.",
          },
        });
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("settings");

        dispatch({ type: "REMOVE_USER" });
        queryClient.removeQueries();

        await clearDatabase();
      }
    } catch (error) {
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          title: "Failed to log out user",
          message: "Please try again.",
        },
      });
    }
  };

  const resetAccount = async (password) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACK_END_IP}/api/user/reset`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        credentials: "include",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          title: "Failed to Reset Account",
          message: data.message,
        },
      });
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    await queryClient.invalidateQueries({ queryKey: ["groups"] });
    await queryClient.invalidateQueries({ queryKey: ["categories"] });
    await clearDatabase();
  };

  return { login, logout, register, isLoading, resetAccount, loginGoogle };
}
