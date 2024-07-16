import { openDatabase } from "@/functions/openDatabase.js";

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
  }

  const data = await response.json();

  const db = await openDatabase();
  const objectStore = db
    .transaction(["entries"], "readwrite")
    .objectStore("entries");

  await objectStore.put(data.entry);
};
