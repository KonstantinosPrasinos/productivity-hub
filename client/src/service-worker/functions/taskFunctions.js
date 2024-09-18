import {
  openDatabase,
  setEntriesInDatabase,
  setTasksInDatabase,
} from "@/functions/openDatabase.js";
import { messageClient } from "@/service-worker/sw.js";

export const getTasksFromDB = async () => {
  const db = await openDatabase();

  const tasks = await db.transaction("tasks").objectStore("tasks").getAll();
  const entries = await db
    .transaction("entries")
    .objectStore("entries")
    .getAll();

  const filteredTasks = tasks.filter((task) => task?.toDelete !== true);

  // Check if there is an entry for each of the tasks.
  // If there isn't one, create a mock one.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const newEntries = [];
  const existingEntries = [];

  filteredTasks.forEach((task) => {
    let todayEntry = entries.find(
      (entry) =>
        entry.taskId === task._id && entry.date === today.toISOString(),
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
        isNew: true,
      };

      newEntries.push(todayEntry);
    } else {
      existingEntries.push(todayEntry);
    }

    task.currentEntryId = todayEntry._id;
  });

  // Add all the new entries to the db
  for (const entry of newEntries) {
    await db.add("entries", entry);
  }

  return new Response(
    JSON.stringify({
      tasks: filteredTasks,
      currentEntries: [...existingEntries, ...newEntries],
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
};

export const addTaskToServer = async (event, savedData, sw) => {
  const response = await fetch(event.request);

  if (!response.ok) {
    // todo this doesn't check for server errors like 400
    self.mustSync = true;
    self.requestEventQueue.push({ ...event, savedData });
    return;
  }

  const data = await response.json();

  // Replace temporary task and entry with real ones
  const db = await openDatabase();
  const transaction = db.transaction(["tasks", "entries"], "readwrite");

  await transaction.objectStore("tasks").delete(savedData.task._id);
  await transaction.objectStore("tasks").put({ ...data.task });

  await transaction.objectStore("entries").delete(savedData.entry._id);
  await transaction.objectStore("entries").put(data.entry);

  await messageClient(sw, "UPDATE_TASKS");
};

export const editTaskInServer = async (event) => {
  const response = await fetch(event.request);

  if (!response.ok) {
    self.mustSync = true;
    self.requestEventQueue.push(event);
  }

  const data = await response.json();

  const db = await openDatabase();
  const objectStore = db
    .transaction(["tasks"], "readwrite")
    .objectStore("tasks");

  await objectStore.put(data);
};

export const addTaskToDB = async (task) => {
  const db = await openDatabase();

  const tempTask = {
    ...task,
    currentEntryId: null,
    mustSync: true,
    isNew: true,
  };

  const taskId = await db.add("tasks", tempTask);

  tempTask.currentEntryId = taskId;
  tempTask._id = taskId;

  const currentDate = new Date();
  currentDate.setUTCHours(0, 0, 0, 0);

  const entry = {
    _id: taskId,
    taskId,
    value: 0,
    date: currentDate.toISOString(),
    forDeletion: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    isNew: true,
    mustSync: true,
  };

  await db.add("entries", entry);

  return { task: tempTask, entry };
};

export const editTaskInDB = async (task) => {
  const db = await openDatabase();
  const transaction = db.transaction(["tasks"], "readwrite");

  const taskToEdit = await transaction.objectStore("tasks").get(task._id);

  const editedTask = { ...taskToEdit, ...task };

  await transaction.objectStore("tasks").put({ ...editedTask, mustSync: true });
};

export const deleteTaskInDB = async (taskId) => {
  const db = await openDatabase();
  const transaction = db.transaction(["tasks"], "readwrite");
  const objectStore = transaction.objectStore("tasks");

  const taskToDelete = await objectStore.get(taskId);

  await objectStore.put({ ...taskToDelete, toDelete: true, mustSync: true });

  return !!taskToDelete.isNew;
};

export const deleteTaskInServer = async (event) => {
  try {
    const requestClone = event.request.clone();
    const requestBody = await requestClone.json();

    const response = await fetch(event.request);

    if (!response.ok) {
      self.mustSync = true;
      self.requestEventQueue.push(event);
    }

    const db = await openDatabase();
    const transaction = db.transaction(["tasks"], "readwrite");
    const objectStore = transaction.objectStore("tasks");

    const taskToDelete = await objectStore.get(requestBody.taskId);

    await objectStore.put({ ...taskToDelete, mustSync: false });
  } catch (_) {
    self.mustSync = true;
    self.requestEventQueue.push(event);
  }
};

export const handleTaskGetRequest = async (request, sw) => {
  console.log(request);
  const response = await fetch(request, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    // todo add error handling
    return;
  }

  const data = await response.json();

  // Delete all today temporary entries
  const db = await openDatabase();

  const transaction = db.transaction(["entries"], "readwrite");
  const entryStore = transaction.objectStore("entries");

  const entries = await entryStore.getAll();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const filteredEntries = entries.filter(
    (entry) => entry?.date === today.toISOString(),
  );

  for (const entry1 of filteredEntries) {
    await entryStore.delete(entry1._id);
  }

  await setTasksInDatabase(data.tasks);
  await setEntriesInDatabase(data.currentEntries);

  await messageClient(sw, "UPDATE_TASKS");
};
