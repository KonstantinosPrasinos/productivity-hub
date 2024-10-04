import { openDB } from "idb";

export const openDatabase = () => {
  return openDB("productivity-hub-db", 7, {
    upgrade(db) {
      // Checks if the object store exists:
      if (!db.objectStoreNames.contains("tasks")) {
        // If the object store does not exist, create it:
        const taskObjectStore = db.createObjectStore("tasks", {
          keyPath: "_id",
          autoIncrement: true,
        });

        taskObjectStore.createIndex("userId", "userId", { unique: false });
        taskObjectStore.createIndex("title", "title", { unique: false });
        taskObjectStore.createIndex("type", "type", { unique: false });
        taskObjectStore.createIndex("priority", "priority", { unique: false });
        taskObjectStore.createIndex("repeats", "repeats", { unique: false });
        taskObjectStore.createIndex(
          "mostRecentProperDate",
          "mostRecentProperDate",
          { unique: false },
        );
        taskObjectStore.createIndex("createdAt", "createdAt", {
          unique: false,
        });
        taskObjectStore.createIndex("updatedAt", "updatedAt", {
          unique: false,
        });
        taskObjectStore.createIndex("currentEntryId", "currentEntryId", {
          unique: false,
        });
        taskObjectStore.createIndex("hidden", "hidden", { unique: false });
        taskObjectStore.createIndex("goal", "goal", { unique: false });
        taskObjectStore.createIndex("longGoal", "longGoal", { unique: false });
        taskObjectStore.createIndex("repeatRate", "repeatRate", {
          unique: false,
        });
        taskObjectStore.createIndex("mustSync", "mustSync", { unique: false });
        taskObjectStore.createIndex("isNew", "isNew", { unique: false });
      }

      if (!db.objectStoreNames.contains("entries")) {
        const entryObjectStore = db.createObjectStore("entries", {
          keyPath: "_id",
        });

        entryObjectStore.createIndex("userId", "userId", { unique: false });
        entryObjectStore.createIndex("taskId", "taskId", { unique: false });
        entryObjectStore.createIndex("value", "value", { unique: false });
        entryObjectStore.createIndex("date", "date", { unique: false });
        entryObjectStore.createIndex("forDeletion", "forDeletion", {
          unique: false,
        });
        entryObjectStore.createIndex("createdAt", "createdAt", {
          unique: false,
        });
        entryObjectStore.createIndex("updatedAt", "updatedAt", {
          unique: false,
        });
        entryObjectStore.createIndex("mustSync", "mustSync", { unique: false });
        entryObjectStore.createIndex("isNew", "isNew", { unique: false });
      }

      if (!db.objectStoreNames.contains("categories")) {
        const categoryObjectStore = db.createObjectStore("categories", {
          keyPath: "_id",
          autoIncrement: true,
        });

        categoryObjectStore.createIndex("title", "title", { unique: false });
        categoryObjectStore.createIndex("color", "color", { unique: false });
        categoryObjectStore.createIndex("repeats", "repeats", {
          unique: false,
        });
        categoryObjectStore.createIndex("priority", "priority", {
          unique: false,
        });
        categoryObjectStore.createIndex("goal.type", "goal.type", {
          unique: false,
        });
        categoryObjectStore.createIndex("goal.limit", "goal.limit", {
          unique: false,
        });
        categoryObjectStore.createIndex("goal.number", "goal.number", {
          unique: false,
        });
        categoryObjectStore.createIndex(
          "repeatRate.number",
          "repeatRate.number",
          { unique: false },
        );
        categoryObjectStore.createIndex(
          "repeatRate.bigTimePeriod",
          "repeatRate.bigTimePeriod",
          { unique: false },
        );
        categoryObjectStore.createIndex(
          "repeatRate.startingDate",
          "repeatRate.startingDate",
          {
            unique: false,
            multiEntry: true,
          },
        );
        categoryObjectStore.createIndex("mustSync", "mustSync", {
          unique: false,
        });
        categoryObjectStore.createIndex("isNew", "isNew", { unique: false });
      }

      if (!db.objectStoreNames.contains("groups")) {
        const groupObjectStore = db.createObjectStore("groups", {
          keyPath: "_id",
          autoIncrement: true,
        });

        groupObjectStore.createIndex("title", "title", { unique: false });
        groupObjectStore.createIndex(
          "repeatRate.smallTimePeriod",
          "repeatRate.smallTimePeriod",
          {
            unique: false,
            multiEntry: true,
          },
        );
        groupObjectStore.createIndex(
          "repeatRate.startingDate",
          "repeatRate.startingDate",
          {
            unique: false,
            multiEntry: true,
          },
        );
        groupObjectStore.createIndex(
          "repeatRate.time.start",
          "repeatRate.time.start",
          { unique: false },
        );
        groupObjectStore.createIndex(
          "repeatRate.time.end",
          "repeatRate.time.end",
          { unique: false },
        );
        groupObjectStore.createIndex("mustSync", "mustSync", { unique: false });
        groupObjectStore.createIndex("isNew", "isNew", { unique: false });
      }

      if (!db.objectStoreNames.contains("settings")) {
        const settingsObjectStore = db.createObjectStore("settings", {
          keyPath: "theme",
        });

        settingsObjectStore.createIndex("theme", "theme", { unique: false });
        settingsObjectStore.createIndex("confirmDelete", "confirmDelete", {
          unique: false,
        });
        settingsObjectStore.createIndex("defaults.step", "defaults.step", {
          unique: false,
        });
        settingsObjectStore.createIndex(
          "defaults.priority",
          "defaults.priority",
          { unique: false },
        );
        settingsObjectStore.createIndex("defaults.goal", "defaults.goal", {
          unique: false,
        });
        settingsObjectStore.createIndex(
          "defaults.deleteGroupAction",
          "defaults.deleteGroupAction",
          { unique: false },
        );
        settingsObjectStore.createIndex("mustSync", "mustSync", {
          unique: false,
        });
        settingsObjectStore.createIndex("isNew", "isNew", { unique: false });
      }
    },
  });
};

export const addToStoreInDatabase = async (tempData = [], storeType = "") => {
  const db = await openDatabase();

  const transaction = db.transaction([storeType], "readwrite");
  const store = transaction.objectStore(storeType);

  if (Array.isArray(tempData)) {
    for (const data of tempData) {
      await store.put({ ...data, mustSync: false });
    }
  } else {
    await store.put({ ...tempData, mustSync: false });
  }
};

export const getFromStoreInDatabase = async (storeType = "") => {
  const db = await openDatabase();

  const data = await db.transaction(storeType).objectStore(storeType).getAll();

  return new Response(JSON.stringify({ [storeType]: data }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const getSettingsFromDB = async () => {
  const db = await openDatabase();

  const settings = await db
    .transaction("settings")
    .objectStore("settings")
    .getAll();

  return new Response(JSON.stringify(settings[0]), {
    headers: { "Content-Type": "application/json" },
  });
};

export const setTasksInDatabase = async (tempTasks = []) => {
  // todo delete all the tasks that do not have "mustSync" set to false, this makes sure that edits are always being synced
  const db = await openDatabase();

  const transaction = db.transaction(["tasks"], "readwrite");
  const taskStore = transaction.objectStore("tasks");

  const tasks = await taskStore.getAll();

  for (const task of tasks) {
    if (!task?.mustSync) {
      await taskStore.delete(task._id);
    }
  }

  for (const task of tempTasks) {
    await taskStore.put({ ...task, mustSync: false });
  }
};

export const setEntriesInDatabase = async (tempEntries = []) => {
  const db = await openDatabase();

  const transaction = db.transaction(["entries"], "readwrite");
  const entryStore = transaction.objectStore("entries");

  const entries = await entryStore.getAll();

  for (const entry of entries) {
    if (!entry?.mustSync) {
      await entryStore.delete(entry._id);
    }
  }

  for (const entry of tempEntries) {
    await entryStore.put({ ...entry, mustSync: false });
  }
};

export const clearDatabase = async () => {
  const objectStores = ["tasks", "entries", "categories", "groups", "settings"];

  const db = await openDatabase();

  const transaction = db.transaction(objectStores, "readwrite");

  await transaction.objectStore("tasks").clear();
  await transaction.objectStore("entries").clear();
  await transaction.objectStore("categories").clear();
  await transaction.objectStore("groups").clear();
  await transaction.objectStore("settings").clear();
};

export const clearObjectStore = async (objectStore = "") => {
  const db = await openDatabase();

  const transaction = db.transaction([objectStore], "readwrite");
  const store = transaction.objectStore(objectStore);

  await store.clear();
};
