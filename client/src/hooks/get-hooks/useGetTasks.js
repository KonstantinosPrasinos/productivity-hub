import { useQuery, useQueryClient } from "react-query";
import { useContext, useRef } from "react";
import { UserContext } from "@/context/UserContext";
import { AlertsContext } from "@/context/AlertsContext.jsx";
import { openDatabase } from "@/functions/openDatabase";

const getTasksFromDB = async (queryClient) => {
  const db = await openDatabase();

  const tasks = await db.transaction("tasks").objectStore("tasks").getAll();
  const entries = await db
    .transaction("entries")
    .objectStore("entries")
    .getAll();

  // Check if there is an entry for each of the tasks.
  // If there isn't one, create a mock one.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const newEntries = [];
  const existingEntries = [];

  tasks.forEach((task) => {
    let todayEntry = entries.find(
      (entry) => entry.taskId === task._id && entry.date === today.toISOString()
    );

    if (!todayEntry) {
      todayEntry = {
        _id: `${task._id}-${today.toISOString()}`,
        userId: task.userId,
        taskId: task._id,
        value: 0,
        date: today.toISOString(),
        forDeletion: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mustSync: true,
      };

      newEntries.push(todayEntry);
    } else {
      existingEntries.push(todayEntry);
    }

    task.currentEntryId = todayEntry._id;
  });

  // Add all the new entries to the db
  newEntries.forEach(async (entry) => {
    await db.add("entries", entry);
  });

  return { tasks, currentEntries: [...existingEntries, ...newEntries] };
};

const handleTaskSideEffects = (data, queryClient) => {
  if (data?.currentEntries) {
    for (const currentEntry of data.currentEntries) {
      queryClient.setQueryData(
        ["task-entries", currentEntry.taskId, currentEntry._id],
        () => {
          return { entry: currentEntry };
        }
      );
    }
  }

  // todo replace with global set settings low and high
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
};

const fetchTasks = async (queryClient, needsToSync) => {
  needsToSync.current = true;
  // Get tasks and entries from db
  const data = await getTasksFromDB(queryClient);

  handleTaskSideEffects(data, queryClient);

  return { tasks: data.tasks };
};

const getTasksFromServer = async (queryClient) => {
  // todo add syncing of entry changes to server as well
  const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/task`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    // Todo add error messages
    return;
  }

  const data = await response.json();

  queryClient.setQueryData(["tasks"], () => {
    return { tasks: data.tasks };
  });

  handleTaskSideEffects(data, queryClient);
};

export function useGetTasks() {
  const queryClient = useQueryClient();
  const user = useContext(UserContext);
  const alertsContext = useContext(AlertsContext);
  const needsToSync = useRef(false);

  const queryObject = useQuery(
    ["tasks"],
    () => fetchTasks(queryClient, needsToSync),
    {
      staleTime: 30 * 60 * 60 * 1000,
      enabled: user.state?.id !== undefined,
      onSuccess: () => {
        if (navigator.onLine && needsToSync.current) {
          needsToSync.current = false;
          getTasksFromServer(queryClient);
        }
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
    }
  );

  return { ...queryObject, data: queryObject.data?.tasks };
}
