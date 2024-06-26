import { useCallback, useEffect, useMemo, useState } from "react";
import { useGetTasks } from "../get-hooks/useGetTasks";
import { useGetGroups } from "../get-hooks/useGetGroups";
import { useGetCategories } from "@/hooks/get-hooks/useGetCategories";
import { findNextUpdateDate } from "@/functions/findNextUpdateDate";
import { useGetTaskCurrentEntry } from "@/hooks/get-hooks/useGetTaskCurrentEntry.js";

let tasksNextUpdate = null;
let timeout = null;

const checkTime = (task) => {
  const currentDate = new Date();
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  currentDate.setHours(0, 0, 0, 0);
  const nextUpdate = findNextUpdateDate(task);

  if (nextUpdate === false) {
    return false;
  }

  nextUpdate.setHours(0, 0, 0, 0); // Change to local time

  const isCorrectDate = nextUpdate.getTime() === currentDate.getTime();
  let isCorrectTime = true;

  // Check if it uses time
  if (task.repeatRate.time?.start) {
    // If it has time, check if it should render at the current time
    const fromHours = parseInt(task.repeatRate.time.start.substring(0, 2));
    const toHours = parseInt(task.repeatRate.time.end.substring(0, 2));
    const fromMinutes = parseInt(task.repeatRate.time.start.substring(2));
    const toMinutes = parseInt(task.repeatRate.time.end.substring(2));

    if (
      fromHours > currentHours ||
      currentHours > toHours ||
      (fromHours === currentHours && currentMinutes < fromMinutes) ||
      (toHours === currentHours && currentMinutes >= toMinutes)
    ) {
      // It shouldn't render now so set next update time
      nextUpdate.setHours(fromHours, fromMinutes);
      isCorrectTime = false;
    } else {
      // It should render now so return true and set next update to, to-time
      nextUpdate.setHours(toHours, toMinutes);
      isCorrectTime = true;
    }
  } else {
    if (isCorrectDate) {
      // Set update time to tomorrow at 00:00
      nextUpdate.setHours(24, 0);
    }
  }

  if (!tasksNextUpdate || nextUpdate.getTime() < tasksNextUpdate.getTime()) {
    tasksNextUpdate = nextUpdate;
  }

  return isCorrectDate && isCorrectTime;
};

const checkTaskCompleted = (task, entry) => {
  // Checks if a task is completed
  // For checkbox return true when value is not zero
  // For number if it has goal return false always
  // Else look for if it completes goal
  if (task.type === "Checkbox") {
    return entry.value !== 0;
  } else {
    if (!task?.goal) {
      return false;
    } else {
      switch (task.goal.limit) {
        case "At least":
          return entry.value >= task.goal.number;
        case "At most":
          return entry.value <= task.goal.number;
        case "Exactly":
          return entry.value === task.goal.number;
      }
    }
  }
};

export function useRenderTasks(usesTime = false) {
  const [shouldReRender, setShouldReRender] = useState(false); // Flip this when we want tasks to re-render
  const {
    isLoading: tasksLoading,
    isError: tasksError,
    data: tasks,
  } = useGetTasks();
  // const tasksLoading = false;
  // const tasksError = false;
  // const tasks = [];
  const {
    isLoading: groupsLoading,
    isError: groupsError,
    data: groups,
  } = useGetGroups();
  const {
    isLoading: categoriesLoading,
    isError: categoriesError,
    data: categories,
  } = useGetCategories();
  const { data: entries, isLoading: entriesLoading } =
    useGetTaskCurrentEntry(tasks);

  const addCategoriesToArray = useCallback(
    (groupedTasks) => {
      /*
       * Add tasks grouped by category and to the list
       * 1. Get the categories
       * 2. Get the tasks for each category
       * 3. Get the tasks for each category subgroup
       * 4. For each of the two above add them to the list as one object when not all tasks are completed
       */
      categories.forEach((category) => {
        const localTasks = tasks.filter((task) => {
          // task.category === category._id && !task.hidden
          // Check if the task should be added to the list
          if (task.hidden) return false;
          if (task.category !== category._id) return false;

          const taskCurrentEntry = entries.find(
            (entry) => entry?._id === task.currentEntryId
          );

          // If current entry doesn't exist, it's loading so skip it
          if (!taskCurrentEntry) return false;
          if (usesTime && checkTaskCompleted(task, taskCurrentEntry))
            return false;

          return true;
        });

        if (!localTasks.length) return;

        const categoryOnlyTasks = localTasks.filter(
          (task) => task.group === undefined
        );
        const groupTasks = localTasks.filter(
          (task) => task.group !== undefined
        );

        const repeatGroups = groups.filter((group) =>
          [...new Set(groupTasks.map((task) => task.group))].includes(group._id)
        );

        if (categoryOnlyTasks.length) {
          // Check if any of the tasks are not completed
          const existsNotCompletedTask =
            !usesTime ||
            categoryOnlyTasks.some((task) => {
              const taskCurrentEntry = entries.find(
                (entry) => entry?._id === task.currentEntryId
              );
              if (!taskCurrentEntry) return false;
              return !checkTaskCompleted(task, taskCurrentEntry);
            });

          if (existsNotCompletedTask) {
            if (
              !usesTime ||
              isNaN(category.repeatRate?.number) ||
              checkTime({
                repeatRate: category.repeatRate,
                mostRecentProperDate: categoryOnlyTasks[0].mostRecentProperDate,
              })
            ) {
              // Sort the category tasks based on priority
              categoryOnlyTasks.sort((a, b) => b.priority - a.priority);

              groupedTasks.push({
                priority: category.priority ?? 1,
                tasks: categoryOnlyTasks,
              });
            }
          }
        }

        // Then also check group also tasks
        repeatGroups.forEach((group) => {
          let localGroupTasks = groupTasks.filter(
            (task) => task.group === group._id
          );
          const taskIdsWithEntriesLoading = [];

          if (localGroupTasks.length) {
            // Check if any of the tasks are not completed
            const existsNotCompletedTask =
              !usesTime ||
              localGroupTasks.some((task) => {
                const taskCurrentEntry = entries.find(
                  (entry) => entry?._id === task.currentEntryId
                );
                if (!taskCurrentEntry) {
                  taskIdsWithEntriesLoading.push(task._id);
                  return false;
                }
                return !checkTaskCompleted(task, taskCurrentEntry);
              });

            if (taskIdsWithEntriesLoading.length) {
              localGroupTasks = localGroupTasks.filter((task) =>
                taskIdsWithEntriesLoading.includes(task._id)
              );
            }

            if (existsNotCompletedTask) {
              if (
                !usesTime ||
                isNaN(category.repeatRate?.number) ||
                checkTime({
                  repeatRate: { ...category.repeatRate, ...group.repeatRate },
                  mostRecentProperDate: localGroupTasks[0].mostRecentProperDate,
                })
              ) {
                localGroupTasks.sort((a, b) => b.priority - a.priority);

                groupedTasks.push({
                  priority: category.priority,
                  tasks: localGroupTasks.sort(
                    (a, b) => b.priority - a.priority
                  ),
                });
              }
            }
          }
        });
      });
    },
    [entries, tasks, categories, groups]
  );

  const addTasksToArray = useCallback(
    (groupedTasks) => {
      tasks?.forEach((task) => {
        // Skip the task if it has a category or if it is supposed to be hidden
        if (task.hidden) return;
        if (task.category) return;

        // Check if the task should be added to the list
        const taskCurrentEntry = entries.find(
          (entry) => entry?._id === task.currentEntryId
        );

        // If current entry doesn't exist, it's loading so skip it
        if (!taskCurrentEntry) return;
        if (usesTime && checkTaskCompleted(task, taskCurrentEntry)) return;

        // Check if the task should be rendered at the current date/time:
        // Check if the task repeats
        // And then it check if the task should be rendered in the current date/time
        if (task.repeats) {
          if (task.category) {
            const category = categories.find(
              (cat) => cat._id === task.category
            );

            if (!category?.repeatRate?.number) {
              if (usesTime) {
                if (checkTime(task)) {
                  groupedTasks.push(task);
                }
              } else {
                groupedTasks.push(task);
              }
            }
          } else {
            if (usesTime) {
              if (checkTime(task)) {
                groupedTasks.push(task);
              }
            } else {
              groupedTasks.push(task);
            }
          }
        } else {
          groupedTasks.push(task);
        }
      });
    },
    [entries, tasks, categories]
  );

  const data = useMemo(() => {
    if (tasksError || groupsError || categoriesError) return false;
    if (tasksLoading || groupsLoading || categoriesLoading) return;

    const now = new Date();
    now.setSeconds(0, 0);

    // Get tasks that should be rendered
    const currentTasks = [];

    addCategoriesToArray(currentTasks);
    addTasksToArray(currentTasks);

    // Sort the tasks to be rendered in increasing priority
    currentTasks.sort((a, b) => b.priority - a.priority);

    // Clear previous timeout if it exists
    if (timeout) clearTimeout(timeout);

    // Set when the tasks should re-render
    if (tasksNextUpdate - new Date().getTime() > 0) {
      timeout = setTimeout(() => {
        setShouldReRender((current) => !current);
      }, tasksNextUpdate - new Date().getTime());
    }
    tasksNextUpdate = null;

    return currentTasks;
  }, [
    tasksLoading,
    groupsLoading,
    groups,
    tasks,
    shouldReRender,
    entriesLoading,
    entries,
  ]);

  useEffect(() => {
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return {
    isLoading: tasksLoading || groupsLoading,
    isError: groupsError || tasksError,
    data,
  };
}
