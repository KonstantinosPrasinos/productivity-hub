import { useQuery, useQueryClient } from "react-query";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import { AlertsContext } from "@/context/AlertsContext.jsx";

const fetchSettings = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_BACK_END_IP}/api/settings`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Failed to get settings from server, unauthorized");
    } else throw new Error((await response.json()).message);
  }

  return response.json();
};

export function useGetSettings() {
  const user = useContext(UserContext);
  const queryClient = useQueryClient();
  const alertsContext = useContext(AlertsContext);

  return useQuery(["settings"], fetchSettings, {
    staleTime: 30 * 60 * 60 * 1000,
    enabled: user.state?.id !== undefined,
    onError: (err) => {
      localStorage.removeItem("user");
      localStorage.removeItem("settings");
      user.dispatch({ type: "REMOVE_USER" });
      queryClient.removeQueries();
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          message: err.message,
          title: "Failed to get settings",
        },
      });
    },
  });
}
