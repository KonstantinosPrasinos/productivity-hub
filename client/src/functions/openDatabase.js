import { openDB } from "idb";

export const openDatabase = () => {
  return openDB("productivity-hub-db", 1, {
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
          { unique: false }
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
      }
    },
  });
};
