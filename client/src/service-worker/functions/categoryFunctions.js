import {openDatabase} from "@/functions/openDatabase.js";

export const getCategoriesFromDB = async () => {
    const db = await openDatabase();

    const categories = await db.transaction("categories").objectStore("categories").getAll();

    return new Response(JSON.stringify({categories}), {
        headers: {'Content-Type': 'application/json'}
    });
}

export const addCategoryToServer = async (event, savedData) => {
    const response = await fetch(event.request);

    if (!response.ok) {
        return;
    }

    const data = await response.json();

    const db = await openDatabase();
    const transaction = db.transaction(["categories"], "readwrite");

    // todo change all new categories to categories
    await transaction.objectStore("categories").delete(savedData.newCategory._id);
    await transaction.objectStore("categories").put(data.newCategory);
}