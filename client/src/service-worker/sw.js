import {addToStoreInDatabase, openDatabase, setEntriesInDatabase, setTasksInDatabase} from "@/functions/openDatabase";
import {BackgroundSyncPlugin} from "workbox-background-sync";
import {addTaskToServer, getTasksFromDB} from "@/service-worker/functions/taskFunctions.js";
import {addCategoryToServer, getCategoriesFromDB} from "@/service-worker/functions/categoryFunctions.js";
import {getGroupsFromDB} from "@/service-worker/functions/groupFunctions.js";

let isSyncing = false;

const executeTaskIn5Minutes = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Your task to be executed after 5 minutes
            console.log("Task executed after 5 minutes");
            resolve();
        }, 5 * 60 * 1000);
    });
};

const handleSync = async (event) => {
    if (isSyncing) return;
    isSyncing = true;

    // Todo add task/entries etc getting
    const db = await openDatabase();
    const transaction = db.transaction(["tasks", "entries"], "readwrite");

    const taskStore = transaction.objectStore("tasks");
    const entryStore = transaction.objectStore("entries");

    const tasks = await taskStore.getAll();
    const entries = await entryStore.getAll();

    const tasksToSync = [];

    tasks.forEach(async (task) => {
        if (task.mustSync) {
            tasksToSync.add({
                ...task,
                currentEntryValue: undefined,
                streak: undefined,
                _id: undefined,
                currentEntryId: undefined,
                mustSync: undefined,
            });
            // Add task to server
            // Todo create mass create route
            // const response = await fetch(
            //   `${import.meta.env.VITE_BACK_END_IP}/api/task/create`,
            //   {
            //     method: "POST",
            //     body: JSON.stringify({
            //   task: {
            //     ...task,
            //     currentEntryValue: undefined,
            //     streak: undefined,
            //     _id: undefined,
            //     currentEntryId: undefined,
            //     mustSync: undefined,
            //   },
            // }),
            //     headers: { "Content-Type": "application/json" },
            //     credentials: "include",
            //   }
            // );

            // if (!response.ok) {
            //   return;
            // }

            // Set the updated task and entry data in react-query
            const data = await response.json();

            // Replace temporary task with synced task (same with entry)
            const transaction = db.transaction(["tasks", "entries"], "readwrite");
            const taskStore = transaction.objectStore("tasks");

            await taskStore.delete(task._id);
            await taskStore.add({...data.task, mustSync: false});

            const entryStore = transaction.objectStore("entries");

            await entryStore.delete(task._id);
            await entryStore.add(data.entry);
        }
    });

    const entriesToSync = [];

    entries.forEach((entry) => {
        if (entry.mustSync && entry.value > 0) {
            entriesToSync.add({
                ...entry,
                mustSync: undefined,
                isTemporary: undefined,
            });
        }
    });

    // Todo add categories and groups
    // Todo add settings as well
    // Todo replace initial fetch with a fetch for everything

    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/sync`, {
        method: "POST",
        body: JSON.stringify({
            tasks: tasksToSync,
            entries: entriesToSync,
            categories: [],
            groups: [],
        }),
        headers: {"Content-Type": "application/json"},
        credentials: "include",
    });

    if (!response.ok) {
        event.waitUntil(executeTaskIn5Minutes());
    }

    // Set the updated task and entry data in the
    const data = await response.json();

    for (const task of data.tasks) {
        await taskStore.delete(task._id);
        await taskStore.add({...task, mustSync: false});
    }

    for (const entry of data.entries) {
        await entryStore.add(entry);
    }

    // Delete temporary entries
    entryStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
            const value = cursor.value;

            if (value.isTemporary) {
                cursor.delete();
            }

            cursor.continue();
        }
    };

    // Let client know that it should update react-query
    await messageClient(self, "SYNC_COMPLETED")
};

self.addEventListener("periodicsync", handleSync);

self.addEventListener("install", () => void self.skipWaiting());
self.addEventListener("activate", () => void self.clients.claim());

const bgSyncPlugin = new BackgroundSyncPlugin("taskQueue", {
    maxRetentionTime: 24 * 60, // Retry for max of 24 Hours
});

self.addEventListener("sync", handleSync);

self.addEventListener("message", (event) => {
    // replace this with sync event from client
    const {type} = event.data;

    if (type === "START_SYNC") {
    }
});

const addCategoryToDB = async (category) => {
    const db = await openDatabase();

    const categoryId = await db.add("categories", category);

    return {newCategory: {...category, _id: categoryId}};
}

const addGroupsToDB = async (groups, categoryId) => {
    const db = await openDatabase();

    const addedGroups = [];

    for (const group of groups) {
        const groupId = await db.add("groups", {...group, parent: categoryId});

        addedGroups.push({...group, _id: groupId, parent: categoryId});
    }

    console.log(addedGroups);

    return {newGroups: addedGroups};
}

const addTaskToDB = async (task) => {
    const db = await openDatabase();

    const tempTask = {
        ...task,
        currentEntryId: null,
        mustSync: true,
    };

    const taskId = await db.add("tasks", task);

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
    };

    await db.add("entries", entry);

    return {task: tempTask, entry};
};

const messageClient = async (sw, type) => {
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
                case "/groups":
                    event.respondWith(getGroupsFromDB());

                    const groupResponse = await fetch(event.request);

                    if (!groupResponse.ok) {
                        return;
                    }

                    const groupData = await groupResponse.json();

                    await addToStoreInDatabase(groupData.categories, "groups");

                    await messageClient(self, "UPDATE_GROUPS");
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

                            await addTaskToServer(event, savedData);

                            // Message client to update the query cache
                            await messageClient(self, "UPDATE_TASKS");

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

                            await addCategoryToServer(event, savedData);

                            await messageClient(self, "UPDATE_CATEGORIES")

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
            }
        }
    }
})