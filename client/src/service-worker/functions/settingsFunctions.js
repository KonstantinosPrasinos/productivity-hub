import {openDatabase} from "@/functions/openDatabase.js";

export const addSettingsToDB = async (data) => {
    const db = await openDatabase();

    const transaction = db.transaction(["settings"], "readwrite");
    transaction.objectStore("settings").clear();

    await db.put("settings", {...data.settings, mustSync: true})
}

export const addSettingsToServer = async (event) => {
    const response = await fetch(event.request);

    if (!response.ok) {
        return;
    }

    const data = await response.json();

    const db = await openDatabase();
    const transaction = db.transaction(["settings"], "readwrite");

    await transaction.objectStore("settings").clear();
    await transaction.objectStore("settings").put(data);
}