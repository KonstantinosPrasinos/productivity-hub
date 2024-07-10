import {openDatabase} from "@/functions/openDatabase.js";
import {messageClient} from "@/service-worker/sw.js";

export const getTasksFromDB = async () => {
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
                isNew: true
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

export const addTaskToServer = async (event, savedData, sw) => {
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

    await messageClient(sw, "UPDATE_TASKS");
}

export const editTaskInServer = async (event, sw) => {
    const response = await fetch(event.request);

    if (!response.ok) {
        return;
    }

    const data = await response.json();

    const db = await openDatabase();
    const objectStore = db.transaction(["tasks"], "readwrite").objectStore("tasks");

    await objectStore.put(data);
}

export const addTaskToDB = async (task) => {
    const db = await openDatabase();

    const tempTask = {
        ...task,
        currentEntryId: null,
        mustSync: true,
        isNew: true
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
        mustSync: true
    };

    await db.add("entries", entry);

    return {task: tempTask, entry};
};

export const editTaskInDB = async (task) => {
    const db = await openDatabase();
    const transaction = db.transaction(["tasks"], "readwrite");

    await transaction.objectStore("tasks").put({...task, mustSync: true});
}