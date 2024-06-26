import { openDatabase } from "@/functions/openDatabase";
import { BackgroundSyncPlugin } from "workbox-background-sync";

const handleSync = async (event) => {
  // Todo add task/entries etc getting
  const db = await openDatabase();
  const tasks = await db.transaction("tasks").objectStore("tasks").getAll();

  tasks.forEach(async (task) => {
    if (task.mustSync) {
      // Add task to server
      // Todo create mass create route
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
        return;
      }

      // Set the updated task and entry data in react-query
      const data = await response.json();

      // Replace temporary task with synced task (same with entry)
      const transaction = db.transaction(["tasks", "entries"], "readwrite");
      const taskStore = transaction.objectStore("tasks");

      await taskStore.delete(task._id);
      await taskStore.add({ ...data.task, mustSync: false });

      const entryStore = transaction.objectStore("entries");

      await entryStore.delete(task._id);
      await entryStore.add(data.entry);
    }
  });

  // Let client know that it should update react-query
  const clients = await self.clients.matchAll();

  clients.forEach((client) => {
    client.postMessage({
      type: "SYNC_COMPLETED",
    });
  });
};

self.addEventListener("periodicsync", handleSync);

self.addEventListener("install", () => void self.skipWaiting());
self.addEventListener("activate", () => void self.clients.claim());

const bgSyncPlugin = new BackgroundSyncPlugin("taskQueue", {
  maxRetentionTime: 24 * 60, // Retry for max of 24 Hours
});

self.addEventListener("sync", handleSync);

const getTasksFromDB = () => {
  const db = window.indexedDB.open("tasks", 1);
};

const syncTasks = () => {
  console.log("syncing");
};
