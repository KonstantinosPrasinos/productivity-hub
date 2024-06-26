import { useMutation, useQueryClient } from "react-query";
import { useCallback, useContext } from "react";
import { AlertsContext } from "@/context/AlertsContext.jsx";
import { UserContext } from "@/context/UserContext";
import { openDatabase } from "@/functions/openDatabase";

const addTaskToDB = async (task, user) => {
  const db = await openDatabase();

  const tempTask = {
    ...task,
    currentEntryId: null,
    mustSync: true,
  };

  const taskId = await db.add("tasks", task);

  tempTask.currentEntryId = taskId;
  tempTask._id = taskId;

  const entry = {
    _id: taskId,
    userId: user.state?.id,
    taskId,
    value: 0,
    date: new Date().setUTCHours(0, 0, 0, 0),
    forDeletion: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.add("entries", entry);

  return { task: tempTask, entry };
};

const addTaskToServer = async (task, queryClient, updateSettingsLowAndHigh) => {
  // Add task to server
  const response = await fetch(
    `${import.meta.env.VITE_BACK_END_IP}/api/task/create`,
    {
      method: "POST",
      body: JSON.stringify({
        task: {
          ...task,
          currentEntryValue: undefined,
          streak: undefined,
          _id: undefined,
          currentEntryId: undefined,
          mustSync: undefined,
        },
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  if (!response.ok) {
    // Todo add errors
    return;
  }

  // Set the updated task and entry data in react-query
  const data = await response.json();

  queryClient.setQueryData(["tasks"], (oldData) => {
    updateSettingsLowAndHigh(data.task);

    const tempTask = oldData.tasks.find(
      (tempTask) => tempTask._id === task._id
    );

    return oldData
      ? {
          tasks: [
            ...oldData.tasks.filter((task) => task !== tempTask),
            data.task,
          ],
        }
      : oldData;
  });

  queryClient.setQueryData(
    ["task-entries", data.task._id, data.task.currentEntryId],
    () => {
      return { entry: data.entry };
    }
  );

  // queryClient.invalidateQueries({
  //   queryKey: ["task-entries", task._id, task.currentEntryId],
  // });

  // Set the updated task/entry data in indexed db with mustSync set to false
  const db = await openDatabase();

  const transaction = db.transaction(["tasks", "entries"], "readwrite");
  const taskStore = transaction.objectStore("tasks");

  await taskStore.delete(task._id);
  await taskStore.add({ ...data.task, mustSync: false });

  const entryStore = transaction.objectStore("entries");

  await entryStore.delete(task._id);
  await entryStore.add(data.entry);
};

export function useAddTask() {
  const queryClient = useQueryClient();
  const alertsContext = useContext(AlertsContext);
  const user = useContext(UserContext);

  const updateSettingsLowAndHigh = useCallback(
    (task) => {
      queryClient.setQueryData(["settings"], (oldData) => {
        const newData = { ...oldData };

        if (task.priority < oldData.priorityBounds.low) {
          newData.priorityBounds.low = task.priority;
        }

        if (task.priority > oldData.priorityBounds.high) {
          newData.priorityBounds.high = task.priority;
        }

        return newData;
      });
    },
    [queryClient]
  );

  return useMutation({
    mutationFn: (task) => addTaskToDB(task, user),
    onSuccess: (data) => {
      queryClient.setQueryData(["tasks"], (oldData) => {
        updateSettingsLowAndHigh(data.task);
        return oldData
          ? {
              tasks: [...oldData.tasks, { ...data.task, hidden: false }],
            }
          : oldData;
      });

      queryClient.setQueryData(
        ["task-entries", data.task._id, data.task.currentEntryId],
        () => {
          return { entry: data.entry };
        }
      );

      if (navigator.onLine) {
        // todo add try catch
        addTaskToServer(data.task, queryClient, updateSettingsLowAndHigh);
      }
    },
    onError: (err) => {
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          message: err.message,
          title: "Failed to create task",
        },
      });
    },
  });
}
