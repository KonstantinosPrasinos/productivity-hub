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

  // todo replace add with set so that the deleted tasks get deleted as well
  await addToStoreInDatabase(categoryData.categories, "categories");

  await messageClient(sw, "UPDATE_CATEGORIES");
};

export const deleteCategoryInDB = async (requestBody) => {
  const { categoryId, deleteTasks } = requestBody;

  const db = await openDatabase();
  const transaction = db.transaction(
    ["categories", "tasks", "entries", "groups"],
    "readwrite",
  );

  const categoryStore = transaction.objectStore("categories");
  const taskStore = transaction.objectStore("tasks");

  const categoryToDelete = await categoryStore.get(categoryId);

  await categoryStore.put({
    ...categoryToDelete,
    toDelete: true,
    mustSync: true,
    deleteTasks,
  });

  // No need to mark groups, they are handled when the category is deleted
  if (deleteTasks) {
    // Mark to be deleted. Don't need to actively delete them because they get cleared on next reload
    for (const task of (await taskStore.getAll()).filter(
      (task1) => task1.category === categoryId,
    )) {
      await taskStore.put({ ...task, toDelete: true });
    }
  } else {
    for (const task of (await taskStore.getAll()).filter(
      (task1) => task1.category === categoryId,
    )) {
      await taskStore.put({ ...task, category: null, group: null, test: 2 });
    }
  }

  return !!categoryToDelete?.isNew;
};

export const deleteCategoryInServer = async (event) => {
  try {
    const requestClone = event.request.clone();
    const requestBody = await requestClone.json();

    const response = await fetch(event.request);

    if (!response.ok) {
      self.mustSync = true;
      self.requestEventQueue.push(event);
    }

    const transaction = db.transaction(["categories", "groups"], "readwrite");

    const categoryStore = transaction.objectStore("categories");
    const groupStore = transaction.objectStore("groups");
    const groups = await groupStore.getAll();

    for (const group of groups) {
      if (group?.parent === requestBody?.categoryId) {
        await groupStore.delete(group._id);
      }
    }

    await categoryStore.delete(requestBody?.categoryId);
  } catch (error) {
    self.mustSync = true;
    self.requestEventQueue.push(event);
  }
};
