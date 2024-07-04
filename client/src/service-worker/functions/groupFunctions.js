import {openDatabase} from "@/functions/openDatabase.js";

export const getGroupsFromDB = async () => {
    const db = await openDatabase();

    const groups = await db.transaction("groups").objectStore("groups").getAll();

    return new Response(JSON.stringify({groups}), {
        headers: {'Content-Type': 'application/json'}
    });
}

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
        const groupId = await db.add("groups", {...group, parent: categoryId, isNew: true, mustSync: true});

        addedGroups.push({...group, _id: groupId, parent: categoryId, mustSync: true, isNew: true});
    }

    return {newGroups: addedGroups};
}