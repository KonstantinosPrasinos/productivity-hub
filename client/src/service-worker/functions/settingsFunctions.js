import {
  addToStoreInDatabase,
  clearObjectStore,
  openDatabase,
} from "@/functions/openDatabase.js";
import { messageClient } from "@/service-worker/sw.js";

export const addSettingsToDB = async (data) => {
  const db = await openDatabase();

  const transaction = db.transaction(["settings"], "readwrite");
  transaction.objectStore("settings").clear();

  await db.put("settings", { ...data.settings, mustSync: true });
};

export const addSettingsToServer = async (event) => {
  const response = await fetch(event.request);

  if (!response.ok) {
    self.mustSync = true;
    self.requestEventQueue.push(event);

    const data = await response.json();
    throw new Error(data.message || "Unknown error");
  }

  const data = await response.json();

  const db = await openDatabase();
  const transaction = db.transaction(["settings"], "readwrite");

  await transaction.objectStore("settings").clear();
  await transaction.objectStore("settings").put(data);
};

export const handleSettingsGetRequest = async (request, sw) => {
  const settingsResponse = await fetch(request, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!settingsResponse.ok) {
    if (settingsResponse.code === 401) {
      await messageClient(sw, "UNAUTHORIZED");
    }
    self.mustSync = true;
    self.requestEventQueue.push(request);

    const data = await settingsResponse.json();
    throw new Error(data.message || "Unknown error");
  }

  const settingsData = await settingsResponse.json();

  await clearObjectStore("settings");

  // Todo change backend (and this) to return object.settings
  await addToStoreInDatabase(settingsData, "settings");

  await messageClient(sw, "UPDATE_SETTINGS");
};
