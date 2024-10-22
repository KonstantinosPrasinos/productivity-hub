import {
  openDatabase,
  setEntriesInDatabase,
} from "@/functions/openDatabase.js";
import { messageClient } from "@/service-worker/sw.js";

export const addEntryToDB = async (entry) => {
  const db = await openDatabase();

  const tempEntry = {
    ...entry,
    _id: `${entry.taskId}-${entry.date}`,
    currentEntryId: null,
    mustSync: true,
    isNew: true,
  };

  const entryId = await db.add("entries", tempEntry);

  return {
    entry: { ...entry, _id: entryId },
  };
};

export const addEntryToServer = async (event, savedData, sw) => {
  const response = await fetch(event.request);

  if (!response.ok) {
    self.mustSync = true;
    self.requestEventQueue.push({ ...event, savedData });

    const data = await response.json();
    throw new Error(data.message || "Unknown error");
  }

  const data = await response.json();

  const db = await openDatabase();
  const objectStore = db
    .transaction(["entries"], "readwrite")
    .objectStore("entries");

  await objectStore.delete(savedData.entry._id);
  await objectStore.put(data.entry);

  await messageClient(sw, `UPDATE_ENTRIES_${data.entry.taskId}`);
};

export const setEntryValueInDB = async (requestBody) => {
  const { entryId, value } = requestBody;

  const db = await openDatabase();
  const transaction = db.transaction(["entries"], "readwrite");
  const objectStore = transaction.objectStore("entries");

  const entry = await objectStore.get(entryId);

  await objectStore.put({ ...entry, mustSync: true, value });
};

export const setEntryValueInServer = async (event) => {
  const response = await fetch(event.request);

  if (!response.ok) {
    self.mustSync = true;
    self.requestEventQueue.push(event);

    const data = await response.json();
    throw new Error(data.message || "Unknown error");
  }

  const data = await response.json();

  const db = await openDatabase();
  const objectStore = db
    .transaction(["entries"], "readwrite")
    .objectStore("entries");

  await objectStore.put(data.entry);
};

export const setEntryInDB = async (requestBody) => {
  const newEntry = requestBody;

  const db = await openDatabase();
  const transaction = db.transaction(["entries"], "readwrite");
  const objectStore = transaction.objectStore("entries");

  const oldEntry = await objectStore.get(newEntry._id);

  const editedEntry = { ...oldEntry, ...newEntry };

  await objectStore.put({ ...editedEntry, mustSync: true });
};

export const setEntryInServer = async (event) => {
  const response = await fetch(event.request);

  if (!response.ok) {
    self.mustSync = true;
    self.requestEventQueue.push(event);

    const data = await response.json();
    throw new Error(data.message || "Unknown error");
  }

  const data = await response.json();

  const db = await openDatabase();
  const objectStore = db
    .transaction(["entries"], "readwrite")
    .objectStore("entries");

  await objectStore.put(data);

  await messageClient(self, `UPDATE_ENTRIES_${data.taskId}`);
};

export const getAllEntriesFromDB = async (taskId) => {
  const db = await openDatabase();

  const entries = await db
    .transaction("entries")
    .objectStore("entries")
    .getAll();

  const entriesThatMatchTaskId = entries.filter(
    (entry) => entry.taskId.toString() === taskId,
  );

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayString = today.toISOString();

  const entriesThatArentToday = entriesThatMatchTaskId.filter(
    (entry) => entry.date !== todayString,
  );

  return new Response(JSON.stringify({ entries: entriesThatArentToday }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const handleAllEntriesGetRequest = async (request, sw) => {
  const response = await fetch(request, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      await messageClient(sw, "UNAUTHORIZED");
    }
    self.mustSync = true;
    self.requestEventQueue.push(request);

    const data = await response.json();
    throw new Error(data.message || "Unknown error");
  }

  const data = await response.json();

  if (data.entries.length === 0) return;

  await setEntriesInDatabase(data.entries);
  await messageClient(sw, `UPDATE_ENTRIES_${data.entries[0].taskId}`);
};

export const deleteEntryInDB = async (requestBody) => {
  const { entryId } = requestBody;

  const db = await openDatabase();
  const transaction = db.transaction(["entries"], "readwrite");
  const objectStore = transaction.objectStore("entries");

  const entryToDelete = await objectStore.get(entryId);

  await objectStore.put({ ...entryToDelete, toDelete: true, mustSync: true });

  return !!entryToDelete?.isNew;
};

export const deleteEntryInServer = async (event) => {
  const requestClone = event.request.clone();
  const requestBody = await requestClone.json();

  const response = await fetch(event.request);

  if (!response.ok) {
    self.mustSync = true;
    self.requestEventQueue.push(event);

    const data = await response.json();
    throw new Error(data.message || "Unknown error");
  }

  const db = await openDatabase();
  const transaction = db.transaction(["entries"], "readwrite");

  await transaction.objectStore("entries").delete(requestBody?.entryId);
};
