import { useQuery, useQueryClient } from "react-query";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { AlertsContext } from "@/context/AlertsContext.jsx";

const fetchTasks = async () => {
  const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/task`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error((await response.json()).message);
  }

  return response.json();
};

export function useGetTasks() {
  const queryClient = useQueryClient();
  const user = useContext(UserContext);
  const alertsContext = useContext(AlertsContext);

  const queryObject = useQuery(["tasks"], fetchTasks, {
    staleTime: 30 * 60 * 60 * 1000,
    enabled: user.state?.id !== undefined,
    onSuccess: (data) => {
      console.log(data);
      // Set current entry from acquired data
      if (data?.currentEntries) {
        for (const currentEntry of data.currentEntries) {
          queryClient.setQueryData(
            ["task-entries", currentEntry.taskId, currentEntry._id],
            () => {
              return { entry: currentEntry };
            },
          );
        }
      }

      // Update the priority lowest and highest used value
      queryClient.setQueryData(["settings"], (oldData) => {
        const priorities = data.tasks.map((task) => task.priority);

        return {
          ...oldData,
          priorityBounds: {
            low: priorities.length > 0 ? Math.min(...priorities) : 1,
            high: priorities.length > 0 ? Math.max(...priorities) : 1,
          },
        };
      });
    },
    onError: (err) => {
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          message: err.message,
          title: "Failed to get tasks",
        },
      });
    },
  });

  return { ...queryObject, data: queryObject.data?.tasks };
}
