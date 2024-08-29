import { getSettingsFromDB } from "@/functions/openDatabase";
import {
  addTaskToDB,
  addTaskToServer,
  deleteTaskInDB,
  deleteTaskInServer,
  editTaskInDB,
  editTaskInServer,
  getTasksFromDB,
  handleTaskGetRequest,
} from "@/service-worker/functions/taskFunctions.js";
import {
  addCategoryToDB,
  addCategoryToServer,
  deleteCategoryInDB,
  deleteCategoryInServer,
  getCategoriesFromDB,
  handleCategoryGetRequest,
} from "@/service-worker/functions/categoryFunctions.js";
import {
  addGroupsToDB,
  getGroupsFromDB,
  handleGroupGetRequest,
} from "@/service-worker/functions/groupFunctions.js";
import {
  addSettingsToDB,
  addSettingsToServer,
  handleSettingsGetRequest,
} from "@/service-worker/functions/settingsFunctions.js";
import {
  addEntryToDB,
  addEntryToServer,
  getAllEntriesFromDB,
  handleAllEntriesGetRequest,
  setEntryInDB,
  setEntryInServer,
  setEntryValueInDB,
  setEntryValueInServer,
} from "@/service-worker/functions/entryFunctions.js";
import { handleSync } from "@/service-worker/functions/handleSync.js";

self.mustSync = true;
self.isSyncing = false;
self.requestEventQueue = [];
self.timeoutExists = false;

const resetState = () => {
  self.mustSync = true;
  self.isSyncing = false;
  self.requestEventQueue = [];
  self.timeoutExists = false;
};

const executeSyncIn5Minutes = () => {
  if (!self.timeoutExists) {
    self.timeoutExists = true;
    setTimeout(
      () => {
        self.timeoutExists = false;
        handleSync();
      },
      5 * 60 * 1000,
    );
  }
};

// self.addEventListener("periodicsync", handleSync);

self.addEventListener("install", () => void self.skipWaiting());
self.addEventListener("activate", () => {
  void self.clients.claim();
});

// const bgSyncPlugin = new BackgroundSyncPlugin("taskQueue", {
//     maxRetentionTime: 24 * 60, // Retry for max of 24 Hours
// });

self.addEventListener("sync", handleSync);

self.addEventListener("message", (event) => {
  // replace this with sync event from client
  const { type } = event.data;

  if (type === "START_SYNC") {
  }
});

export const messageClient = async (sw, type) => {
  // Let client know that it should update react-query
  const clients = await sw.clients.matchAll();

  clients.forEach((client) => {
    client.postMessage({
      type,
    });
  });
};

self.addEventListener("fetch", async (event) => {
  if (event.request.url.includes("/api/")) {
    const requestUrl = event.request.url.substring(
      event.request.url.indexOf("/api/") + 4,
    );

    if (event.request.method === "GET") {
      switch (requestUrl) {
        case "/task":
          event.respondWith(getTasksFromDB());

          if (self.mustSync) {
            self.requestEventQueue.push({ request: event.request.clone() });
            handleSync();
          } else {
            await handleTaskGetRequest(event.request, self);
          }
          break;
        case "/category":
          event.respondWith(getCategoriesFromDB());

          if (self.mustSync) {
            self.requestEventQueue.push({ request: event.request.clone() });
            handleSync();
          } else {
            await handleCategoryGetRequest(event.request, self);
          }
          break;
        case "/group":
          event.respondWith(getGroupsFromDB());

          if (self.mustSync) {
            self.requestEventQueue.push({ request: event.request.clone() });
            handleSync();
          } else {
            await handleGroupGetRequest(event.request, self);
          }
          break;
        case "/settings":
          // Settings is the first request made by the app
          // assume this means the app window has been reset and reset the service worker state
          resetState();
          event.respondWith(getSettingsFromDB());

          if (self.mustSync) {
            self.requestEventQueue.push({ request: event.request.clone() });
            handleSync();
          } else {
            await handleSettingsGetRequest(event.request, self);
          }
          break;
        default:
          if (/\/entry\/all\/*/.test(requestUrl)) {
            event.respondWith(
              getAllEntriesFromDB(requestUrl.split("/entry/all/")[1]),
            );

            if (self.mustSync) {
              self.requestEventQueue.push({ request: event.request.clone() });
              handleSync();
            } else {
              await handleAllEntriesGetRequest(event.request, self);
            }
          }
      }
    } else if (event.request.method === "POST") {
      switch (requestUrl) {
        case "/task/create":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                const savedData = await addTaskToDB(requestBody.task);

                console.log(self.mustSync);

                if (self.mustSync) {
                  self.requestEventQueue.push({
                    request: event.request.clone(),
                    savedData,
                  });
                  handleSync();
                } else {
                  addTaskToServer(event, savedData, self);
                }

                return new Response(JSON.stringify(savedData), {
                  headers: { "Content-Type": "application/json" },
                });
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
        case "/category/create":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                const savedCategory = await addCategoryToDB(
                  requestBody.category,
                );
                const savedGroups =
                  requestBody.groups.length > 0
                    ? await addGroupsToDB(
                        requestBody.groups,
                        savedCategory.newCategory._id,
                      )
                    : { newGroups: [] };

                const savedData = { ...savedCategory, ...savedGroups };

                if (self.mustSync) {
                  self.requestEventQueue.push({
                    request: event.request.clone(),
                    savedData,
                  });
                  handleSync();
                } else {
                  addCategoryToServer(event, savedData);
                }

                return new Response(JSON.stringify(savedData), {
                  headers: { "Content-Type": "application/json" },
                });
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
        case "/settings/update":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                await addSettingsToDB(requestBody);

                if (self.mustSync) {
                  // todo why does this even need to happen. the whole event queue?
                  self.requestEventQueue.push({
                    request: event.request.clone(),
                  });
                  handleSync();
                } else {
                  addSettingsToServer(event);
                }

                return new Response(JSON.stringify(requestBody.settings), {
                  headers: { "Content-Type": "application/json" },
                });
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
        case "/task/set":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                await editTaskInDB(requestBody.task);

                if (self.mustSync) {
                  self.requestEventQueue.push({
                    request: event.request.clone(),
                  });
                  handleSync();
                } else {
                  editTaskInServer(event);
                }

                return new Response(JSON.stringify(requestBody.task), {
                  headers: { "Content-Type": "application/json" },
                });
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
        case "/task/delete":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                const isNew = await deleteTaskInDB(requestBody.taskId);

                if (!isNew) {
                  if (self.mustSync) {
                    self.requestEventQueue.push({
                      request: event.request.clone(),
                    });
                    handleSync();
                  } else {
                    deleteTaskInServer(event);
                  }
                }

                return new Response(
                  JSON.stringify({
                    message: "Task and it's entries set for deletion.",
                  }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
        case "/entry/create":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                const entry = await addEntryToDB(requestBody);

                if (self.mustSync) {
                  self.requestEventQueue.push({
                    request: event.request.clone(),
                  });
                  handleSync();
                } else {
                  // todo doesn't just adding the entry to the server duplicate the entry? created once for the db and once for the server
                  addEntryToServer(event, entry, self);
                }

                return new Response(JSON.stringify(entry), {
                  headers: { "Content-Type": "application/json" },
                });
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
        case "/entry/set-value":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                const entry = await setEntryValueInDB(requestBody);

                if (self.mustSync) {
                  self.requestEventQueue.push({
                    request: event.request.clone(),
                  });
                  handleSync();
                } else {
                  setEntryValueInServer(event);
                }

                return new Response(JSON.stringify({ entry }), {
                  headers: { "Content-Type": "application/json" },
                });
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
        case "/entry/set":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                await setEntryInDB(requestBody);

                if (self.mustSync) {
                  // todo make this not break (turn into custom object instead
                  self.requestEventQueue.push({
                    request: event.request.clone(),
                  });
                  handleSync();
                } else {
                  setEntryInServer(event);
                }

                return new Response(JSON.stringify(requestBody), {
                  headers: { "Content-Type": "application/json" },
                });
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
        case "/category/delete":
          event.respondWith(
            (async () => {
              try {
                const requestClone = event.request.clone();
                const requestBody = await requestClone.json();

                const isNew = await deleteCategoryInDB(requestBody);

                if (!isNew) {
                  if (self.mustSync) {
                    self.requestEventQueue.push({
                      request: event.request.clone(),
                    });
                    handleSync();
                  } else {
                    deleteCategoryInServer(event);
                  }
                }

                return new Response(
                  JSON.stringify({
                    message: "Category deleted",
                  }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              } catch (error) {
                console.error("Error processing request:", error);
                return new Response(
                  JSON.stringify({ error: "Failed to process request" }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            })(),
          );
          break;
      }
    }
  }
});
