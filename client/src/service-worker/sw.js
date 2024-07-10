import {
    addToStoreInDatabase,
    clearObjectStore,
    getSettingsFromDB,
    openDatabase, setEntriesInDatabase, setTasksInDatabase,
} from "@/functions/openDatabase";
import {
    addTaskToDB,
    addTaskToServer,
    editTaskInDB,
    editTaskInServer,
    getTasksFromDB
} from "@/service-worker/functions/taskFunctions.js";
import {
    addCategoryToDB, addCategoryToServer,
    getCategoriesFromDB
} from "@/service-worker/functions/categoryFunctions.js";
import {addGroupsToDB, getGroupsFromDB} from "@/service-worker/functions/groupFunctions.js";
import {addSettingsToDB, addSettingsToServer} from "@/service-worker/functions/settingsFunctions.js";

let mustSync = true;

const executeTaskIn5Minutes = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Your task to be executed after 5 minutes
            console.log("Task executed after 5 minutes");
            resolve();
        }, 5 * 60 * 1000);
    });
};

const handleResponse = async (response, oldIds) => {
    // Set the updated task and entry data in the
    const {
        oldEntryIds, oldTaskIds,
        oldCategoryIds, oldGroupIds
    } = oldIds;

    const data = await response.json();

    const db = await openDatabase();
    const transaction = db.transaction(["tasks", "entries", "categories", "groups", "settings"], "readwrite");

    const taskStore = transaction.objectStore("tasks");
    const entryStore = transaction.objectStore("entries");
    const categoryStore = transaction.objectStore("categories");
    const groupStore = transaction.objectStore("groups");
    const settingsStore = transaction.objectStore("settings");

    for (const id of oldTaskIds) {
        await taskStore.delete(id);
    }

    for (const task of data.tasks) {
        await taskStore.put(task);
    }

    for (const id of oldCategoryIds) {
        await categoryStore.delete(id);
    }

    for (const category of data.categories) {
        await categoryStore.put(category);
    }

    for (const id of oldGroupIds) {
        await groupStore.delete(id);
    }

    for (const group of data.groups) {
        await groupStore.put(group);
    }

    for (const id of oldEntryIds) {
        await entryStore.delete(id);
    }

    for (const entry of data.entries) {
        await entryStore.put(entry);
    }

    if (data.settings) {
        await settingsStore.clear();
        await settingsStore.put(data.settings);
    }

    // Let client know that it should update react-query
    await messageClient(self, "SYNC_COMPLETED");
}

const handleSync = async (event) => {
    mustSync = false;

    const db = await openDatabase();
    const transaction = db.transaction(["tasks", "entries", "categories", "groups", "settings"], "readwrite");

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

    const entriesAddedToTask = [];
    const oldTaskIds = [];
    const oldEntryIds = [];

    for (const task of tasks) {
        if (task.mustSync) {
            if (task.isNew) {
                const tempTask = {
                    ...task,
                    currentEntryValue: undefined,
                    streak: undefined,
                    currentEntryId: undefined,
                    mustSync: undefined,
                    _id: undefined,
                    isNew: undefined,
                    entries: []
                };

                for (const entry of entries) {
                    if (entry.mustSync && entry.isNew && entry.taskId === task._id) {
                        tempTask.entries.push({...entry, _id: undefined, mustSync: undefined, isNew: undefined});
                        entriesAddedToTask.push(entry);
                        oldEntryIds.push(entry._id);
                    }
                }

                oldTaskIds.push(task._id)

                newTasks.push(tempTask);
            } else {
                editedTasks.push({
                    ...task,
                    currentEntryValue: undefined,
                    streak: undefined,
                    currentEntryId: undefined,
                    mustSync: undefined
                });
            }
        }
    }

    for (const entry of entriesAddedToTask) {
        entries.splice(entries.findIndex(obj => obj._id === entry._id), 1);
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
                    newEntries.push({...entry, mustSync: undefined, isNew: undefined});
                }
            } else {
                editedEntries.push({...entry, mustSync: undefined})
            }
        }
    }

    const editedGroups = [];
    const newGroups = [];
    const oldGroupIds = [];

    for (const group of groups) {
        if (group.mustSync) {
            if (group.isNew) {
                newGroups.push({...group, mustSync: undefined, isNew: undefined, _id: undefined});
                oldGroupIds.push(group._id);
            } else {
                editedGroups.push({...group, mustSync: undefined});
            }
        }
    }

    const editedCategories = [];
    const newCategories = [];
    const oldCategoryIds = [];

    for (const category of categories) {
        if (category.mustSync) {
            if (category.isNew) {
                const tempCategory = {...category, mustSync: undefined, isNew: undefined, groups: [], _id: undefined};

                // Move new groups for new categories to inside the category
                for (const group of newGroups) {
                    if (group.parent === category._id) {
                        tempCategory.groups.push({...group, parent: undefined});
                    }
                }

                for (const group of tempCategory.groups) {
                    newGroups.splice(newGroups.findIndex(obj => obj._id === group._id));
                }

                newCategories.push(tempCategory);
                oldCategoryIds.push(category._id);
            } else {
                editedCategories.push({...category, mustSync: undefined});
            }
        }
    }

    let settingsToSync = undefined;

    if (settings[0] && settings[0].mustSync) {
        settingsToSync = {...settings[0], mustSync: undefined};
    }

    if (!settingsToSync && !newTasks.length && !editedTasks.length && !newCategories.length && !editedCategories.length && !newGroups.length && !editedGroups.length && !newEntries.length && !editedEntries.length) {
        return;
    }

    console.log({
        newTasks,
        editedTasks,
        newCategories,
        editedCategories,
        newGroups,
        editedGroups,
        settingsToSync,
        editedEntries,
        newEntries
    })

    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/sync`, {
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
            newEntries
        }),
        headers: {"Content-Type": "application/json"},
        credentials: "include",
    });

    if (!response.ok) {
        event.waitUntil(executeTaskIn5Minutes());
        mustSync = true;
        return;
    }

    await handleResponse(response, {
        oldEntryIds, oldTaskIds, oldCategoryIds, oldGroupIds
    });
};

// self.addEventListener("periodicsync", handleSync);

self.addEventListener("install", () => void self.skipWaiting());
self.addEventListener("activate", () => {
    console.log("activating");
    void self.clients.claim();
});

// const bgSyncPlugin = new BackgroundSyncPlugin("taskQueue", {
//     maxRetentionTime: 24 * 60, // Retry for max of 24 Hours
// });

self.addEventListener("sync", handleSync);

self.addEventListener("message", (event) => {
    // replace this with sync event from client
    const {type} = event.data;

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
}

self.addEventListener('fetch', async (event) => {
    if (event.request.url.includes('/api/')) {
        const requestUrl = event.request.url.substring(event.request.url.indexOf("/api/") + 4);

        if (event.request.method === "GET") {
            switch (requestUrl) {
                case "/task":
                    event.respondWith(getTasksFromDB());

                    const response = await fetch(event.request);

                    if (!response.ok) {
                        return;
                    }

                    const data = await response.json();

                    await setTasksInDatabase(data.tasks);
                    await setEntriesInDatabase(data.currentEntries);

                    await messageClient(self, "UPDATE_TASKS");
                    break;
                case "/category":
                    event.respondWith(getCategoriesFromDB());

                    const categoryResponse = await fetch(event.request);

                    if (!categoryResponse.ok) {
                        return;
                    }

                    const categoryData = await categoryResponse.json();

                    await addToStoreInDatabase(categoryData.categories, "categories");

                    await messageClient(self, "UPDATE_CATEGORIES");
                    break;
                case "/group":
                    event.respondWith(getGroupsFromDB());

                    const groupResponse = await fetch(event.request);

                    if (!groupResponse.ok) {
                        return;
                    }

                    const groupData = await groupResponse.json();

                    await addToStoreInDatabase(groupData.categories, "groups");

                    await messageClient(self, "UPDATE_GROUPS");
                    break;
                case "/settings":
                    event.respondWith(getSettingsFromDB());

                    const settingsResponse = await fetch(event.request);

                    if (!settingsResponse.ok) {
                        return;
                    }

                    const settingsData = await settingsResponse.json();

                    await clearObjectStore("settings");

                    // Todo change backend (and this) to return object.settings
                    await addToStoreInDatabase(settingsData, "settings");

                    await messageClient(self, "UPDATE_SETTINGS");
                    break;
            }
        } else if (event.request.method === "POST") {
            switch (requestUrl) {
                case "/task/create":
                    event.respondWith((async () => {
                        try {
                            const requestClone = event.request.clone();
                            const requestBody = await requestClone.json();

                            const savedData = await addTaskToDB(requestBody.task);

                            addTaskToServer(event, savedData, self);

                            return new Response(JSON.stringify(savedData), {
                                headers: {'Content-Type': 'application/json'}
                            });
                        } catch (error) {
                            console.error('Error processing request:', error);
                            return new Response(JSON.stringify({error: 'Failed to process request'}), {
                                headers: {'Content-Type': 'application/json'}
                            });
                        }
                    })());
                    break;
                case "/category/create":
                    event.respondWith((async () => {
                        try {
                            const requestClone = event.request.clone();
                            const requestBody = await requestClone.json();

                            const savedCategory = await addCategoryToDB(requestBody.category);
                            const savedGroups = requestBody.groups.length > 0 ? await addGroupsToDB(requestBody.groups, savedCategory.newCategory._id) : {newGroups: []};

                            const savedData = {...savedCategory, ...savedGroups};

                            addCategoryToServer(event, savedData);

                            return new Response(JSON.stringify(savedData), {
                                headers: {'Content-Type': 'application/json'}
                            })
                        } catch (error) {
                            console.error('Error processing request:', error);
                            return new Response(JSON.stringify({error: 'Failed to process request'}), {
                                headers: {'Content-Type': 'application/json'}
                            });
                        }
                    })());
                    break;
                case "/settings/update":
                    event.respondWith((async () => {
                        try {
                            const requestClone = event.request.clone();
                            const requestBody = await requestClone.json();

                            await addSettingsToDB(requestBody);

                            addSettingsToServer(event)

                            return new Response(JSON.stringify(requestBody.settings), {
                                headers: {'Content-Type': 'application/json'}
                            })
                        } catch (error) {
                            console.error('Error processing request:', error);
                            return new Response(JSON.stringify({error: 'Failed to process request'}), {
                                headers: {'Content-Type': 'application/json'}
                            });
                        }
                    })())
                    break;
                case "/task/set":
                    event.respondWith((async () => {
                        try {
                            const requestClone = event.request.clone();
                            const requestBody = await requestClone.json();

                            console.log(requestBody.task)

                            await editTaskInDB(requestBody.task);

                            editTaskInServer(event);

                            return new Response(JSON.stringify(requestBody.task), {
                                headers: {'Content-Type': 'application/json'}
                            })
                        } catch (error) {
                            console.error('Error processing request:', error);
                            return new Response(JSON.stringify({error: 'Failed to process request'}), {
                                headers: {'Content-Type': 'application/json'}
                            });
                        }
                    })())
                    break;
            }
        }

        if (mustSync) handleSync();
    }
})