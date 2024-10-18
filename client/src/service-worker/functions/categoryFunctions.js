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

    const data = await response.json();
    throw new Error(data.message || "Unknown error");
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
  const categoryResponse = await fetch(request, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!categoryResponse.ok) {
    if (categoryResponse.code === 401) {
      await messageClient(sw, "UNAUTHORIZED");
    }
    self.mustSync = true;
    self.requestEventQueue.push(request);

    const data = await categoryResponse.json();
    throw new Error(data.message || "Unknown error");
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
  const groupStore = transaction.objectStore("groups");

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
      let taskGroup;

      if (task?.group) {
        taskGroup = groupStore.get(task.group);
      }

      let repeatRate = categoryToDelete?.repeatRate;

      if (taskGroup) {
        repeatRate = { ...repeatRate, ...taskGroup?.repeatRate };
      }

      await taskStore.put({
        ...task,
        category: null,
        group: null,
        repeatRate,
        longGoal: categoryToDelete.goal,
        mustSync: true,
      });
    }
  }

  return !!categoryToDelete?.isNew;
};

export const deleteCategoryInServer = async (event) => {
  const db = await openDatabase();
  const requestClone = event.request.clone();
  const requestBody = await requestClone.json();

  const response = await fetch(event.request);

  if (!response.ok) {
    self.mustSync = true;
    self.requestEventQueue.push(event);

    const data = await response.json();
    throw new Error(data.message || "Unknown error");
  }

  const transaction = db.transaction(
    ["categories", "groups", "tasks"],
    "readwrite",
  );

  const categoryStore = transaction.objectStore("categories");
  const groupStore = transaction.objectStore("groups");
  const taskStore = transaction.objectStore("tasks");

  const groups = await groupStore.getAll();

  for (const group of groups) {
    if (group?.parent === requestBody?.categoryId) {
      await groupStore.delete(group._id);
    }
  }

  await categoryStore.delete(requestBody?.categoryId);

  const tasks = await taskStore.getAll();

  for (const task of tasks.filter(
    (task) => !task?.isNew && task?.category === requestBody?.categoryId,
  )) {
    await taskStore.put({ ...task, mustSync: false });
  }
};

export const editCategoryInDB = async (requestBody) => {
  const {
    category,
    groupsForDeletion,
    groupsForEdit,
    action,
    newGroups,
    parentId,
  } = requestBody;

  const db = await openDatabase();
  const transaction = db.transaction(
    ["categories", "groups", "tasks"],
    "readwrite",
  );

  const categoryObjectStore = transaction.objectStore("categories");
  const groupObjectStore = transaction.objectStore("groups");
  const taskObjectStore = transaction.objectStore("tasks");

  let tasks = await taskObjectStore.getAll();
  const editedTasks = [];

  const responseObject = { editedGroups: [], newGroups: [] };

  // todo add group creation / editing to handle sync for this reason

  // Category editing
  if (category) {
    const oldCategory = await categoryObjectStore.get(category._id);
    await categoryObjectStore.put({
      ...category,
      mustSync: true,
      isNew: oldCategory?.isNew,
    });
    responseObject.editedCategory = category;
  }

  // Group deletion
  if (groupsForDeletion?.length > 0) {
    switch (action) {
      case "Keep their repeat details":
        for (const task of tasks) {
          if (groupsForDeletion.includes(task?.group)) {
            await taskObjectStore.put({
              ...task,
              group: undefined,
              mustSync: true,
            });
            editedTasks.push(task._id);
          }
        }
        break;
      case "Remove their repeat details":
        // This doesn't actually exist in the client
        for (const task of tasks) {
          if (groupsForDeletion.includes(task?.group)) {
            await taskObjectStore.put({
              ...task,
              group: undefined,
              repeatRate: {
                time: {},
                smallTimePeriod: [],
                startingDate: [],
              },
              repeats: false,
              mustSync: true,
            });
          }
          editedTasks.push(task._id);
        }
        break;
      case "Delete them":
        for (const task of tasks) {
          if (groupsForDeletion.includes(task?.group)) {
            await taskObjectStore.put({
              ...task,
              toDelete: true,
              mustSync: !task?.isNew,
            }); // todo check if being cleared
          }
          if (!task?.isNew) {
            editedTasks.push(task._id);
          }
        }
        break;
    }

    for (const groupId of groupsForDeletion) {
      const group = await groupObjectStore.get(groupId);

      await groupObjectStore.put({ ...group, toDelete: true, mustSync: true });
    }

    responseObject.affectedTasks = editedTasks;
  }

  tasks = await taskObjectStore.getAll();

  // Group editing
  if (groupsForEdit?.length > 0) {
    for (const group of groupsForEdit) {
      await groupObjectStore.put({ ...group, mustSync: true });
      responseObject.editedGroups.push(group);

      for (const task of tasks) {
        if (task?.group === group._id) {
          await taskObjectStore.put({
            ...task,
            repeatRate: group.repeatRate,
            mustSync: true,
          });
        }
      }
    }
  }

  // New groups
  if (newGroups?.length > 0) {
    for (const group of newGroups) {
      const groupId = await groupObjectStore.add({
        ...group,
        parent: parentId,
        mustSync: true,
        isNew: true,
      });

      responseObject.newGroups.push({
        ...group,
        _id: groupId,
        parent: parentId,
      });
    }
  }

  return responseObject;
};

export const editCategoryInServer = async (event, tempData) => {
  const requestClone = event.request.clone();
  const requestBody = await requestClone.json();

  const response = await fetch(event.request);

  if (!response.ok) {
    self.mustSync = true;
    self.requestEventQueue.push({ ...event, tempData });

    const data = await response.json();
    throw new Error(data.message || "Unknown error");
  }

  const data = await response.json();

  const db = await openDatabase();
  const transaction = await db.transaction(
    ["categories", "groups", "tasks"],
    "readwrite",
  );

  const categoryObjectStore = transaction.objectStore("categories");
  const groupObjectStore = await transaction.objectStore("groups");
  const taskObjectStore = transaction.objectStore("tasks");

  // const { category, groupsForDeletion, groupsForEdit, action, newGroups } =
  //   requestBody;

  const { editedCategory, newGroups } = data;

  const { newGroups: tempGroups, affectedTasks } = tempData;

  const { groupsForDeletion } = requestBody;

  // Category editing
  if (editedCategory) {
    await categoryObjectStore.put(data.editedCategory);
  }

  // New groups
  if (newGroups?.length > 0) {
    for (const group of data.newGroups) {
      await groupObjectStore.add(group);
    }

    for (const group of tempGroups) {
      await groupObjectStore.delete(group._id);
    }
  }

  // Deleted groups
  if (groupsForDeletion?.length > 0) {
    for (const groupId of groupsForDeletion) {
      await groupObjectStore.delete(groupId);
    }
  }

  if (affectedTasks) {
    for (const taskId of affectedTasks) {
      const task = await taskObjectStore.get(taskId);
      await taskObjectStore.put({ ...task, mustSync: false });
    }
  }

  await messageClient(self, "UPDATE_CATEGORIES");

  // let tasks = await taskObjectStore.getAll();
  //
  // // todo add group creation / editing to handle sync for this reason
  //
  // // Group deletion
  // if (groupsForDeletion?.length > 0) {
  //   for (const task of tasks) {
  //     if (groupsForDeletion.includes(task?.group)) {
  //       await taskObjectStore.put({
  //         ...task,
  //         mustSync: false,
  //       });
  //     }
  //   }
  //   switch (action) {
  //     case "Delete them":
  //       for (const task of tasks) {
  //         if (groupsForDeletion.includes(task?.group)) {
  //           await taskObjectStore.put({
  //             ...task,
  //             toDelete: undefined,
  //             mustSync: false,
  //           }); // todo check if being cleared
  //         }
  //       }
  //       break;
  //     default:
  //       for (const task of tasks) {
  //         if (groupsForDeletion.includes(task?.group)) {
  //           await taskObjectStore.put({
  //             ...task,
  //             mustSync: false,
  //           });
  //         }
  //       }
  //       break;
  //   }
  //
  //   for (const groupId of groupsForDeletion) {
  //     await groupObjectStore.delete(groupId);
  //   }
  // }
  //
  // tasks = await taskObjectStore.getAll();
  //
  // // Group editing
  // if (groupsForEdit?.length > 0) {
  //   for (const group of groupsForEdit) {
  //     await groupObjectStore.put({ ...group, mustSync: false });
  //
  //     for (const task of tasks) {
  //       if (task?.group === group._id) {
  //         await taskObjectStore.put({
  //           ...task,
  //           mustSync: false,
  //         });
  //       }
  //     }
  //   }
  // }
  //
};
