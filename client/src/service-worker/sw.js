import { getSettingsFromDB, openDatabase } from "@/functions/openDatabase";
import {
  addTaskToDB,
  addTaskToServer,
  deleteTaskInDB,
  deleteTaskInServer,
  editTaskInDB,
  editTaskInServer,
  getTasksFromDB,
  handleTaskGetRequest,
} from "@/service-worker/functions/taskFunctions.js";
import {
  addCategoryToDB,
  addCategoryToServer,
  getCategoriesFromDB,
  handleCategoryGetRequest,
} from "@/service-worker/functions/categoryFunctions.js";
import {
  addGroupsToDB,
  getGroupsFromDB,
  handleGroupGetRequest,
} from "@/service-worker/functions/groupFunctions.js";
import {
  addSettingsToDB,
  addSettingsToServer,
  handleSettingsGetRequest,
} from "@/service-worker/functions/settingsFunctions.js";

self.mustSync = true;
self.isSyncing = false;
self.requestEventQueue = [];

const resetState = () => {
  self.mustSync = true;
  self.isSyncing = false;
  self.requestEventQueue = [];
};

const executeTaskIn5Minutes = () => {
  return new Promise((resolve) => {
    setTimeout(
      () => {
        // Your task to be executed after 5 minutes
        console.log("Task executed after 5 minutes");
        resolve();
      },
      5 * 60 * 1000,
    );
  });
};

const handleResponse = async (response, oldIds) => {
  // Set the updated task and entry data in the
  const { oldEntryIds, oldTaskIds, oldCategoryIds, oldGroupIds, deletedTasks } =
    oldIds;

  const data = await response.json();

  const db = await openDatabase();
  const transaction = db.transaction(
    ["tasks", "entries", "categories", "groups", "settings"],
    "readwrite",
  );

  const taskStore = transaction.objectStore("tasks");
  const entryStore = transaction.objectStore("entries");
  const categoryStore = transaction.objectStore("categories");
  const groupStore = transaction.objectStore("groups");
  const settingsStore = transaction.objectStore("settings");

  // Handle task creation
  for (const id of oldTaskIds) {
    await taskStore.delete(id);
  }

  for (const task of data.tasks) {
    await taskStore.put(task);
  }

  // Handle category creation
  for (const id of oldCategoryIds) {
    await categoryStore.delete(id);
  }

  for (const category of data.categories) {
    await categoryStore.put(category);
  }

  // Handle group creation
  for (const id of oldGroupIds) {
    await groupStore.delete(id);
  }

  for (const group of data.groups) {
    await groupStore.put(group);
  }

  // Handle entry creation
  for (const id of oldEntryIds) {
    await entryStore.delete(id);
  }

  for (const entry of data.entries) {
    await entryStore.put(entry);
  }

  // Handle settings editing
  if (data.settings) {
    await settingsStore.clear();
    await settingsStore.put(data.settings);
  }

  // Handle task deletion
  const entries = await entryStore.getAll();

  for (const task of deletedTasks) {
    await taskStore.delete(task._id);
    for (const entry1 of entries.filter((entry) => entry.taskId === task._id)) {
      await entryStore.delete(entry1._id);
    }
  }

  // Todo remove mustSync from editedTask
};

const handleCleanup = async () => {
  const db = await openDatabase();
  const transaction = db.transaction(
    ["tasks", "entries", "categories", "groups", "settings"],
    "readwrite",
  );

  const taskStore = transaction.objectStore("tasks");
  const entryStore = transaction.objectStore("entries");

  const tasks = await taskStore.getAll();
  const entries = await entryStore.getAll();

  // Remove all deleted tasks (and their entries) from the db
  for (const task of tasks) {
    if (!task.mustSync && task?.toDelete) {
      await taskStore.delete(task._id);
      for (const entry1 of entries.filter(
        (entry) => entry.taskId === task._id,
      )) {
        await entryStore.delete(entry1._id);
      }
    }
  }
};

const handleSync = async (event) => {
  if (self.isSyncing) return;
  self.isSyncing = true;

  await handleCleanup();

  const db = await openDatabase();
  const transaction = db.transaction(
    ["tasks", "entries", "categories", "groups", "settings"],
    "readwrite",
  );

  const taskStore = transaction.objectStore("tasks");
  const entryStore = transaction.objectStore("entries");
  const categoryStore = transaction.objectStore("categories");
  const groupStore = transaction.objectStore("groups");
  const settingsStore = transaction.objectStore("settings");

  const tasks = await taskStore.getAll();
  const entries = await entryStore.getAll();
  const categories = await categoryStore.getAll();
  const groups = await groupStore.getAll();
  const settings = await settingsStore.getAll();

  // todo add is new to all tasks, categories, groups etc
  // todo add isDeleted flag to everything, also don't pull tasks etc with isDeleted flag fromm the db

  const editedTasks = [];
  const newTasks = [];
  const deletedTasks = [];

  const entriesAddedToTask = [];
  const oldTaskIds = [];
  const oldEntryIds = [];

  for (const task of tasks) {
    if (task.mustSync) {
      if (task.toDelete) {
        // Handle deleted tasks
        if (!task.isNew) {
          deletedTasks.push({
            ...task,
            currentEntryValue: undefined,
            streak: undefined,
            currentEntryId: undefined,
            mustSync: undefined,
            toDelete: undefined,
          });
        }
      } else {
        // Handle new / edited tasks
        if (task.isNew) {
          const tempTask = {
            ...task,
            currentEntryValue: undefined,
            streak: undefined,
            currentEntryId: undefined,
            mustSync: undefined,
            _id: undefined,
            isNew: undefined,
            entries: [],
          };

          for (const entry of entries) {
            if (entry.mustSync && entry.isNew && entry.taskId === task._id) {
              tempTask.entries.push({
                ...entry,
                _id: undefined,
                mustSync: undefined,
                isNew: undefined,
              });
              entriesAddedToTask.push(entry);
              oldEntryIds.push(entry._id);
            }
          }

          oldTaskIds.push(task._id);

          newTasks.push(tempTask);
        } else {
          editedTasks.push({
            ...task,
            currentEntryValue: undefined,
            streak: undefined,
            currentEntryId: undefined,
            mustSync: undefined,
          });
        }
      }
    }
  }

  for (const entry of entriesAddedToTask) {
    entries.splice(
      entries.findIndex((obj) => obj._id === entry._id),
      1,
    );
  }

  const newEntries = [];
  const editedEntries = [];

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  for (const entry of entries) {
    if (entry.mustSync) {
      if (entry.isNew) {
        if (entry.value > 0 && entry.date !== todayISO) {
          newEntries.push({ ...entry, mustSync: undefined, isNew: undefined });
        }
      } else {
        editedEntries.push({ ...entry, mustSync: undefined });
      }
    }
  }

  const editedGroups = [];
  const newGroups = [];
  const oldGroupIds = [];

  for (const group of groups) {
    if (group.mustSync) {
      if (group.isNew) {
        newGroups.push({
          ...group,
          mustSync: undefined,
          isNew: undefined,
          _id: undefined,
        });
        oldGroupIds.push(group._id);
      } else {
        editedGroups.push({ ...group, mustSync: undefined });
      }
    }
  }

  const editedCategories = [];
  const newCategories = [];
  const oldCategoryIds = [];

  for (const category of categories) {
    if (category.mustSync) {
      if (category.isNew) {
        const tempCategory = {
          ...category,
          mustSync: undefined,
          isNew: undefined,
          groups: [],
          _id: undefined,
        };

        // Move new groups for new categories to inside the category
        for (const group of newGroups) {
          if (group.parent === category._id) {
            tempCategory.groups.push({ ...group, parent: undefined });
          }
        }

        for (const group of tempCategory.groups) {
          newGroups.splice(newGroups.findIndex((obj) => obj._id === group._id));
        }

        newCategories.push(tempCategory);
        oldCategoryIds.push(category._id);
      } else {
        editedCategories.push({ ...category, mustSync: undefined });
      }
    }
  }

  let settingsToSync = undefined;

  if (settings[0] && settings[0].mustSync) {
    settingsToSync = { ...settings[0], mustSync: undefined };
  }

  let requestSuccessful = true;

  if (
    settingsToSync ||
    newTasks.length ||
    editedTasks.length ||
    newCategories.length ||
    editedCategories.length ||
    newGroups.length ||
    editedGroups.length ||
    newEntries.length ||
    editedEntries.length ||
    deletedTasks.length
  ) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACK_END_IP}/api/sync`,
        {
          method: "POST",
          body: JSON.stringify({
            newTasks,
            editedTasks,
            newCategories,
            editedCategories,
            newGroups,
            editedGroups,
            settingsToSync,
            editedEntries,
            newEntries,
            deletedTasks,
          }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (!response.ok) {
        event.waitUntil(executeTaskIn5Minutes());
        self.mustSync = true;
        requestSuccessful = false;
      } else {
        await handleResponse(response, {
          oldEntryIds,
          oldTaskIds,
          oldCategoryIds,
          oldGroupIds,
          deletedTasks,
        });
      }
    } catch (_) {
      self.mustSync = true;
      requestSuccessful = false;
      event.waitUntil(executeTaskIn5Minutes());
    }
  }

  // Fetch stored requests
  console.log(self.requestEventQueue);
  while (self.requestEventQueue.length > 0) {
    const eventObj = self.requestEventQueue.shift();

    const requestUrl = eventObj.request.url.substring(
      eventObj.request.url.indexOf("/api/") + 4,
    );

    try {
      if (eventObj.request.method === "GET") {
        switch (requestUrl) {
          case "/task":
            await handleTaskGetRequest(eventObj.request, self);
            break;
          case "/category":
            await handleCategoryGetRequest(eventObj.request, self);
            break;
          case "/group":
            await handleGroupGetRequest(eventObj.request, self);
            break;
          case "/settings":
            await handleSettingsGetRequest(eventObj.request, self);
            break;
        }
      } else {
        switch (requestUrl) {
          case "/task/create":
            await addTaskToServer(event, event.savedData, self);
            break;
          case "/category/create":
            await addCategoryToServer(event, event.savedData);
            break;
          case "/settings/update":
            await addSettingsToServer(event);
            break;
          case "/task/set":
            await editTaskInServer(event);
            break;
          case "/task/delete":
            await deleteTaskInServer(event);
            break;
        }
      }
    } catch (error) {
      console.error("Error processing backlog request:", error);
    }
  }

  // Let client know that it should update react-query
  await messageClient(self, "SYNC_COMPLETED");

  self.isSyncing = false;
  self.mustSync = !requestSuccessful;
};

// self.addEventListener("periodicsync", handleSync);

self.addEventListener("install", () => void self.skipWaiting());
self.addEventListener("activate", () => {
  void self.clients.claim();
});

// const bgSyncPlugin = new BackgroundSyncPlugin("taskQueue", {
//     maxRetentionTime: 24 * 60, // Retry for max of 24 Hours
// });

self.addEventListener("sync", handleSync);

self.addEventListener("message", (event) => {
  // replace this with sync event from client
  const { type } = event.data;

  if (type === "START_SYNC") {
  }
});

export const messageClient = async (sw, type) => {
  // Let client know that it should update react-query
  const clients = await sw.clients.matchAll();

  clients.forEach((client) => {
    client.postMessage({
      type,
    });
  });
};

self.addEventListener("fetch", async (event) => {
  if (event.request.url.includes("/api/")) {
    const requestUrl = event.request.url.substring(
      event.request.url.indexOf("/api/") + 4,
    );

    if (event.request.method === "GET") {
      switch (requestUrl) {
        case "/task":
          event.respondWith(getTasksFromDB());

          if (self.mustSync) {
            self.requestEventQueue.push(event);
            handleSync();
          } else {
            await handleTaskGetRequest(event.request, self);
          }
          break;
        case "/category":
          event.respondWith(getCategoriesFromDB());

          if (self.mustSync) {
            self.requestEventQueue.push(event);
            handleSync();
          } else {
            await handleCategoryGetRequest(event.request, self);
          }
          break;
        case "/group":
          event.respondWith(getGroupsFromDB());

          if (self.mustSync) {
            self.requestEventQueue.push(event);
            handleSync();
          } else {
            await handleGroupGetRequest(event.request, self);
          }
          break;
        case "/settings":
          // Settings is the first request made by the app
          // assume this means the app window has been reset and reset the service worker state
          resetState();
          event.respondWith(getSettingsFromDB());

          if (self.mustSync) {
            self.requestEventQueue.push(event);
            handleSync();
          } else {
            await handleSettingsGetRequest(event.request, self);
          }
          break;
      }
    } else if (event.request.method === "POST") {
      switch (requestUrl) {
        case "/task/create":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                const savedData = await addTaskToDB(requestBody.task);

                if (self.mustSync) {
                  self.requestEventQueue.push({ ...event, savedData });
                  handleSync();
                } else {
                  addTaskToServer(event, savedData, self);
                }

                return new Response(JSON.stringify(savedData), {
                  headers: { "Content-Type": "application/json" },
                });
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
        case "/category/create":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                const savedCategory = await addCategoryToDB(
                  requestBody.category,
                );
                const savedGroups =
                  requestBody.groups.length > 0
                    ? await addGroupsToDB(
                        requestBody.groups,
                        savedCategory.newCategory._id,
                      )
                    : { newGroups: [] };

                const savedData = { ...savedCategory, ...savedGroups };

                if (self.mustSync) {
                  self.requestEventQueue.push({ ...event, savedData });
                  handleSync();
                } else {
                  addCategoryToServer(event, savedData);
                }

                return new Response(JSON.stringify(savedData), {
                  headers: { "Content-Type": "application/json" },
                });
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
        case "/settings/update":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                await addSettingsToDB(requestBody);

                if (self.mustSync) {
                  self.requestEventQueue.push(event);
                  handleSync();
                } else {
                  addSettingsToServer(event);
                }

                return new Response(JSON.stringify(requestBody.settings), {
                  headers: { "Content-Type": "application/json" },
                });
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
        case "/task/set":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                await editTaskInDB(requestBody.task);

                if (self.mustSync) {
                  self.requestEventQueue.push(event);
                  handleSync();
                } else {
                  editTaskInServer(event);
                }

                return new Response(JSON.stringify(requestBody.task), {
                  headers: { "Content-Type": "application/json" },
                });
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
        case "/task/delete":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                const isNew = await deleteTaskInDB(requestBody.taskId);

                if (!isNew) {
                  if (self.mustSync) {
                    self.requestEventQueue.push(event);
                    handleSync();
                  } else {
                    deleteTaskInServer(event);
                  }
                }

                return new Response(
                  JSON.stringify({
                    message: "Task and it's entries set for deletion.",
                  }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
      }
    }
  }
});
