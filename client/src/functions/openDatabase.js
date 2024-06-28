import {openDB} from "idb";

export const openDatabase = () => {
    return openDB("productivity-hub-db", 2, {
        upgrade(db) {
            // Checks if the object store exists:
            if (!db.objectStoreNames.contains("tasks")) {
                // If the object store does not exist, create it:
                const taskObjectStore = db.createObjectStore("tasks", {
                    keyPath: "_id",
                    autoIncrement: true,
                });

                taskObjectStore.createIndex("userId", "userId", {unique: false});
                taskObjectStore.createIndex("title", "title", {unique: false});
                taskObjectStore.createIndex("type", "type", {unique: false});
                taskObjectStore.createIndex("priority", "priority", {unique: false});
                taskObjectStore.createIndex("repeats", "repeats", {unique: false});
                taskObjectStore.createIndex(
                    "mostRecentProperDate",
                    "mostRecentProperDate",
                    {unique: false}
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
                taskObjectStore.createIndex("hidden", "hidden", {unique: false});
                taskObjectStore.createIndex("goal", "goal", {unique: false});
                taskObjectStore.createIndex("longGoal", "longGoal", {unique: false});
                taskObjectStore.createIndex("repeatRate", "repeatRate", {
                    unique: false,
                });
                taskObjectStore.createIndex("mustSync", "mustSync", {unique: false});
            }

            if (!db.objectStoreNames.contains("entries")) {
                const entryObjectStore = db.createObjectStore("entries", {
                    keyPath: "_id",
                });

                entryObjectStore.createIndex("userId", "userId", {unique: false});
                entryObjectStore.createIndex("taskId", "taskId", {unique: false});
                entryObjectStore.createIndex("value", "value", {unique: false});
                entryObjectStore.createIndex("date", "date", {unique: false});
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

            if (!db.objectStoreNames.contains("categories")) {
                const categoryObjectStore = db.createObjectStore("categories", {
                    keyPath: "_id",
                    autoIncrement: true
                });

                categoryObjectStore.createIndex('title', 'title', {unique: false});
                categoryObjectStore.createIndex('color', 'color', {unique: false});
                categoryObjectStore.createIndex('repeats', 'repeats', {unique: false});
                categoryObjectStore.createIndex('priority', 'priority', {unique: false});
                categoryObjectStore.createIndex('goal.type', 'goal.type', {unique: false});
                categoryObjectStore.createIndex('goal.limit', 'goal.limit', {unique: false});
                categoryObjectStore.createIndex('goal.number', 'goal.number', {unique: false});
                categoryObjectStore.createIndex('repeatRate.number', 'repeatRate.number', {unique: false});
                categoryObjectStore.createIndex('repeatRate.bigTimePeriod', 'repeatRate.bigTimePeriod', {unique: false});
                categoryObjectStore.createIndex('repeatRate.startingDate', 'repeatRate.startingDate', {
                    unique: false,
                    multiEntry: true
                });
            }
        },
    });
};

export const addToStoreInDatabase = async (tempData = [], storeType = "") => {
    const db = await openDatabase();

    const transaction = db.transaction([storeType], "readwrite");
    const store = transaction.objectStore(storeType);

    for (const data of tempData) {
        await store.put({...data, mustSync: false});
    }
}

export const setTasksInDatabase = async (tempTasks = []) => {
    const db = await openDatabase();

    const transaction = db.transaction(["tasks"], "readwrite");
    const taskStore = transaction.objectStore("tasks");

    for (const task of tempTasks) {
        await taskStore.put({...task, mustSync: false});
    }
};

export const setEntriesInDatabase = async (tempEntries = []) => {
    const db = await openDatabase();

    const transaction = db.transaction(["entries"], "readwrite");
    const entryStore = transaction.objectStore("entries");

    for (const entry of tempEntries) {
        await entryStore.put({...entry, mustSync: false});
    }
};
