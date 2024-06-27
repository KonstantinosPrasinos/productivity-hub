import {openDatabase, setEntriesInDatabase, setTasksInDatabase} from "@/functions/openDatabase";
import {BackgroundSyncPlugin} from "workbox-background-sync";

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

const getTasksFromDB = async () => {
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
                isTemporary: true,
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

    return new Response(JSON.stringify({tasks, currentEntries: [...existingEntries, ...newEntries]}), {
        headers: {'Content-Type': 'application/json'}
    });
};

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

const addTaskToServer = async (event, savedData) => {
    const response = await fetch(event.request);

    if (!response.ok) {
        return;
    }

    const data = await response.json();

    // Replace temporary task and entry with real ones
    const db = await openDatabase();
    const transaction = db.transaction(["tasks", "entries"], "readwrite");

    await transaction.objectStore("tasks").delete(savedData.task._id);
    await transaction.objectStore("tasks").put(data.task);

    await transaction.objectStore("entries").delete(savedData.entry._id);
    await transaction.objectStore("entries").put(data.entry);

    // Message client to update the query cache
    await messageClient(self, "UPDATE_TASKS");
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

            }
        }
    }
})