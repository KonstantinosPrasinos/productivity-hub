import { openDatabase } from "@/functions/openDatabase.js";
import {
  addTaskToServer,
  deleteTaskInServer,
  editTaskInServer,
  handleTaskGetRequest,
} from "@/service-worker/functions/taskFunctions.js";
import {
  addCategoryToServer,
  deleteCategoryInServer,
  handleCategoryGetRequest,
} from "@/service-worker/functions/categoryFunctions.js";
import { handleGroupGetRequest } from "@/service-worker/functions/groupFunctions.js";
import {
  addSettingsToServer,
  handleSettingsGetRequest,
} from "@/service-worker/functions/settingsFunctions.js";
import {
  addEntryToDB,
  deleteEntryInServer,
  handleAllEntriesGetRequest,
  setEntryInServer,
  setEntryValueInServer,
} from "@/service-worker/functions/entryFunctions.js";
import { messageClient } from "@/service-worker/sw.js";

export const prepareSyncData = async () => {
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
            userId: undefined,
            mostRecentProperDate: undefined,
            hidden: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            __v: undefined,
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
  const deletedEntries = [];

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  for (const entry of entries) {
    if (entry.mustSync) {
      if (entry?.toDelete) {
        if (!entry.isNew) {
          deletedEntries.push({
            ...entry,
            mustSync: undefined,
            isNew: undefined,
            forDeletion: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            __v: undefined,
          });
        }
      } else {
        if (entry.isNew) {
          if (entry.value > 0 && entry.date !== todayISO) {
            newEntries.push({
              ...entry,
              mustSync: undefined,
              isNew: undefined,
              forDeletion: undefined,
              createdAt: undefined,
              updatedAt: undefined,
              __v: undefined,
              currentEntryId: undefined,
              _id: undefined,
            });

            oldEntryIds.push(entry._id);
          }
        } else {
          editedEntries.push({
            ...entry,
            mustSync: undefined,
            forDeletion: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            __v: undefined,
          });
        }
      }
    }
  }

  const editedGroups = [];
  const newGroups = [];
  const oldGroupIds = [];
  const deletedGroups = [];

  for (const group of groups) {
    if (group?.mustSync) {
      if (group.toDelete) {
        if (!group.isNew) {
          deletedGroups.push({
            ...group,
            mustSync: undefined,
            isNew: undefined,
            toDelete: undefined,
          });
        }
      } else {
        if (group.isNew) {
          newGroups.push({
            ...group,
            mustSync: undefined,
            isNew: undefined,
          });
          oldGroupIds.push(group._id);
        } else {
          editedGroups.push({ ...group, mustSync: undefined });
        }
      }
    }
  }

  const editedCategories = [];
  const newCategories = [];
  const oldCategoryIds = [];
  const deletedCategories = [];

  for (const category of categories) {
    if (category.mustSync) {
      if (category.toDelete) {
        if (!category.isNew) {
          deletedCategories.push({
            ...category,
            mustSync: undefined,
            isNew: undefined,
            groups: [],
            toDelete: undefined,
          });
        }
      } else {
        if (category.isNew) {
          const tempCategory = {
            ...category,
            mustSync: undefined,
            isNew: undefined,
            groups: [],
            // _id: undefined,
          };

          // Move new groups for new categories to inside the category
          for (const group of newGroups) {
            if (group.parent === category._id) {
              tempCategory.groups.push({ ...group, parent: undefined });
            }
          }

          for (const group of tempCategory.groups) {
            newGroups.splice(
              newGroups.findIndex((obj) => obj._id === group._id),
            );
          }

          newCategories.push(tempCategory);
          oldCategoryIds.push(category._id);
        } else {
          editedCategories.push({ ...category, mustSync: undefined });
          // Todo check all tasks in backend if they have a category or group and change the temp ids to the normal ones
        }
      }
    }
  }

  let settingsToSync = undefined;

  if (settings[0] && settings[0].mustSync) {
    settingsToSync = { ...settings[0], mustSync: undefined };
  }

  const returnObject = {
    shouldSync: false,
    data: {
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
      deletedCategories,
      deletedEntries,
      deletedGroups,
    },
    oldData: {
      oldEntryIds,
      oldTaskIds,
      oldCategoryIds,
      oldGroupIds,
      deletedTasks,
      deletedCategories,
      deletedEntries,
      deletedGroups,
    },
  };

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
    deletedTasks.length ||
    deletedCategories.length ||
    deletedEntries.length ||
    deletedGroups.length
  ) {
    returnObject.shouldSync = true;
  }

  return returnObject;
};

const makeSyncRequest = async (requestData) => {
  const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/sync`, {
    method: "POST",
    body: JSON.stringify(requestData),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      await messageClient(self, "UNAUTHORIZED");
    }
    self.mustSync = true;

    const data = await response.json();
    throw new Error(data.message || "Unknown error");
  }

  return response;
};

const handleResponse = async (response, oldIds) => {
  // Set the updated task and entry data in the
  const {
    oldEntryIds,
    oldTaskIds,
    oldCategoryIds,
    oldGroupIds,
    deletedTasks,
    deletedCategories,
    deletedEntries,
    deletedGroups,
  } = oldIds;

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

  // Handle category deletion
  const groups = await groupStore.getAll();

  for (const category of deletedCategories) {
    await categoryStore.delete(category._id);

    for (const group of groups.filter(
      (group1) => group1.parent === category._id,
    )) {
      await groupStore.delete(group._id);
    }
  }

  // Handle entry deletion
  for (const entry of deletedEntries) {
    await entryStore.delete(entry._id);
  }

  for (const group of deletedGroups) {
    await groupStore.delete(group._id);
  }

  // Todo remove mustSync from editedTask
};

const handleCleanup = async () => {
  // Add must clean up flag or remove the need for this entirely. Because this runs every time it must sync, which is every time if offline.
  const db = await openDatabase();
  const transaction = db.transaction(
    ["tasks", "entries", "categories", "groups", "settings"],
    "readwrite",
  );

  const taskStore = transaction.objectStore("tasks");
  const entryStore = transaction.objectStore("entries");
  const categoryStore = transaction.objectStore("categories");
  const groupStore = transaction.objectStore("groups");

  let tasks = await taskStore.getAll();
  let entries = await entryStore.getAll();
  const categories = await categoryStore.getAll();
  let groups = await groupStore.getAll();

  // Remove all deleted tasks (and their entries) from the db
  for (const task of tasks) {
    if ((task?.isNew && task?.toDelete) || (!task.mustSync && task?.toDelete)) {
      await taskStore.delete(task._id);
      for (const entry1 of entries.filter(
        (entry) => entry.taskId === task._id,
      )) {
        await entryStore.delete(entry1._id);
      }
    }
  }

  tasks = await taskStore.getAll();
  entries = await entryStore.getAll();

  // Remove all deleted categories from the db
  for (const category of categories) {
    if (
      (category?.isNew && category?.toDelete) ||
      (!category.mustSync && category?.toDelete)
    ) {
      if (category?.deleteTasks) {
        // Delete all tasks associated with category
        for (const task of tasks) {
          if (task?.category === category._id) {
            for (const entry1 of entries.filter(
              (entry) => entry.taskId === task._id,
            )) {
              await entryStore.delete(entry1._id);
            }

            await taskStore.delete(task._id);
          }
        }
      }

      for (const group of groups) {
        if (group?.parent === category._id) {
          await groupStore.delete(group._id);
        }
      }

      await categoryStore.delete(category._id);
    }
  }

  // Group cleanup
  groups = await groupStore.getAll();

  for (const group of groups) {
    if (
      (group?.isNew && group?.toDelete) ||
      (!group?.mustSync && group?.toDelete)
    ) {
      await groupStore.delete(group?._id);
    }
  }

  // Entry cleanup
  entries = await entryStore.getAll();

  for (const entry of entries) {
    if (
      (entry?.isNew && entry?.toDelete) ||
      (!entry.mustSync && entry?.toDelete)
    ) {
    }
  }
};

const handleRemainingRequests = async () => {
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
          default:
            if (/\/entry\/all\/*/.test(requestUrl)) {
              await handleAllEntriesGetRequest(eventObj.request, self);
            }
        }
      } else {
        switch (requestUrl) {
          case "/task/create":
            await addTaskToServer(eventObj, eventObj.savedData, self);
            break;
          case "/category/create":
            await addCategoryToServer(eventObj, eventObj.savedData);
            break;
          case "/settings/update":
            await addSettingsToServer(eventObj);
            break;
          case "/task/set":
            await editTaskInServer(eventObj);
            break;
          case "/task/delete":
            await deleteTaskInServer(eventObj);
            break;
          case "/entry/create":
            await addEntryToDB(eventObj);
            break;
          case "/entry/set-value":
            await setEntryValueInServer(eventObj);
            break;
          case "/entry/set":
            await setEntryInServer(eventObj);
            break;
          case "/category/delete":
            await deleteCategoryInServer(eventObj);
            break;
          case "/entry/delete-single":
            await deleteEntryInServer(eventObj);
            break;
        }
      }
    } catch (error) {
      console.error(
        `Error processing backlog request to ${requestUrl}:`,
        error,
      );
    }
  }
};

export const handleSync = async () => {
  if (self.isSyncing) return;
  self.isSyncing = true;

  await messageClient(self, "SYNCING_STARTED");

  try {
    await handleCleanup();

    const syncData = await prepareSyncData();
    if (!syncData.shouldSync) {
      self.mustSync = false;
      self.isSyncing = false;

      await handleRemainingRequests();
      await messageClient(self, "SYNC_COMPLETED");
      return;
    }

    const requestData = await makeSyncRequest(syncData.data);

    await handleResponse(requestData, syncData.oldData);

    await handleRemainingRequests();

    await messageClient(self, "SYNC_COMPLETED");

    self.mustSync = false;
  } catch (error) {
    console.error(error);
    self.mustSync = true;
  }

  self.isSyncing = false;
};
