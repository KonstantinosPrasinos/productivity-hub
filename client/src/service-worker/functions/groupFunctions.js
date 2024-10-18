import {
  addToStoreInDatabase,
  openDatabase,
} from "@/functions/openDatabase.js";
import { messageClient } from "@/service-worker/sw.js";

export const getGroupsFromDB = async () => {
  const db = await openDatabase();

  const groups = await db.transaction("groups").objectStore("groups").getAll();

  const filteredGroups = groups.filter((group) => group?.toDelete !== true);

  return new Response(JSON.stringify({ groups: filteredGroups }), {
    headers: { "Content-Type": "application/json" },
  });
};

// export const addGroupToServer = async (event, savedData) => {
//     const response = await fetch(event.request);
//
//     if (!response.ok) {
//         return;
//     }
//
//     const data = await response.json();
//
//     const db = await openDatabase();
//     const transaction = db.transaction(["groups"], "readwrite");
//
//     // todo change all new groups to groups ?
//     await transaction.objectStore("groups").delete(savedData.._id);
//     await transaction.objectStore("categories").put(data.newCategory);
// }

export const addGroupsToDB = async (groups, categoryId) => {
  const db = await openDatabase();

  const addedGroups = [];

  for (const group of groups) {
    const groupId = await db.add("groups", {
      ...group,
      parent: categoryId,
      isNew: true,
      mustSync: true,
    });

    addedGroups.push({
      ...group,
      _id: groupId,
      parent: categoryId,
      mustSync: true,
      isNew: true,
    });
  }

  return { newGroups: addedGroups };
};

export const handleGroupGetRequest = async (request, sw) => {
  const groupResponse = await fetch(request, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!groupResponse.ok) {
    if (groupResponse.code === 401) {
      await messageClient(sw, "UNAUTHORIZED");
    }
    self.mustSync = true;
    self.requestEventQueue.push(request);

    const data = await groupResponse.json();
    throw new Error(data.message || "Unknown error");
  }

  const groupData = await groupResponse.json();

  await addToStoreInDatabase(groupData.groups, "groups");

  await messageClient(sw, "UPDATE_GROUPS");
};
