import { useMutation, useQueryClient } from "react-query";
import { useContext } from "react";
import { AlertsContext } from "../../context/AlertsContext";
import { clearDatabase } from "@/functions/openDatabase.js";

const postResetAccount = async (password) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACK_END_IP}/api/user/reset`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error((await response.json()).message);
  }

  return response.json();
};

export function useResetAccount() {
  const queryClient = useQueryClient();
  const alertsContext = useContext(AlertsContext);

  return useMutation({
    mutationFn: postResetAccount,
    onError: (err) => {
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          message: err.message,
          title: "Failed to reset account",
        },
      });
    },
    onSettled: async () => {
      // Todo move all this logic to logout function
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });

      await clearDatabase();
    },
  });
}
