import {
  addToStoreInDatabase,
  openDatabase,
} from "@/functions/openDatabase.js";
import { messageClient } from "@/service-worker/sw.js";

export const getCategoriesFromDB = async () => {
  const db = await openDatabase();

  const categories = await db
    .transaction("categories")
    .objectStore("categories")
    .getAll();

  return new Response(JSON.stringify({ categories }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const addCategoryToServer = async (event, savedData) => {
  const response = await fetch(event.request);

  if (!response.ok) {
    self.mustSync = true;
    self.requestEventQueue.push({ ...event, savedData });
  }

  const data = await response.json();

  const db = await openDatabase();
  const transaction = db.transaction(["categories", "groups"], "readwrite");

  // todo change all new categories to categories
  await transaction.objectStore("categories").delete(savedData.newCategory._id);
  await transaction.objectStore("categories").put(data.newCategory);

  for (const group of savedData.newGroups) {
    await transaction.objectStore("groups").delete(group._id);
  }

  if (data.newGroups?.length > 0) {
    for (const group of data.newGroups) {
      await transaction.objectStore("groups").put(group);
    }
  }

  await messageClient(self, "UPDATE_CATEGORIES");
};

export const addCategoryToDB = async (category) => {
  const db = await openDatabase();

  const categoryId = await db.add("categories", {
    ...category,
    mustSync: true,
    isNew: true,
  });

  return {
    newCategory: { ...category, _id: categoryId, mustSync: true, isNew: true },
  };
};

export const handleCategoryGetRequest = async (request, sw) => {
  const categoryResponse = await fetch(request);

  if (!categoryResponse.ok) {
    return;
  }

  const categoryData = await categoryResponse.json();

  await addToStoreInDatabase(categoryData.categories, "categories");

  await messageClient(sw, "UPDATE_CATEGORIES");
};
