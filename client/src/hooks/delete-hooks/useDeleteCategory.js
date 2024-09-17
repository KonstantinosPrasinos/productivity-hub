import { useMutation, useQueryClient } from "react-query";
import { useContext } from "react";
import { AlertsContext } from "@/context/AlertsContext.jsx";
import { useGetGroups } from "@/hooks/get-hooks/useGetGroups.js";
import { useGetCategories } from "@/hooks/get-hooks/useGetCategories.js";

const postDeleteCategory = async (data) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACK_END_IP}/api/category/delete`,
    {
      method: "POST",
      body: JSON.stringify({
        categoryId: data.categoryId,
        deleteTasks: data.deleteTasks,
      }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error((await response.json()).message);
  }

  return response.json();
};

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const alertsContext = useContext(AlertsContext);
  const { data: groups } = useGetGroups();
  const { data: categories } = useGetCategories();

  return useMutation({
    mutationFn: postDeleteCategory,
    onSuccess: async (_, recoveredData) => {
      const { categoryId } = recoveredData;

      const category = categories.find((c) => c._id === categoryId);
      const categoryGroups = groups.filter(
        (group) => group.parent === categoryId,
      );

      queryClient.setQueryData(["tasks"], (oldData) => {
        return oldData
          ? {
              tasks: [
                ...oldData.tasks.map((task) => {
                  const taskGroup = task.group
                    ? categoryGroups.find((group) => group._id === task.group)
                    : null;

                  let repeatRate = category.repeatRate;

                  if (taskGroup) {
                    repeatRate = { ...repeatRate, ...taskGroup.repeatRate };
                  }

                  return task.category === categoryId
                    ? {
                        ...task,
                        category: undefined,
                        group: undefined,
                        repeatRate,
                        longGoal: category?.goal,
                      }
                    : task;
                }),
              ],
            }
          : oldData;
      });
      queryClient.setQueryData(["categories"], (oldData) => {
        return oldData
          ? {
              categories: [
                ...oldData.categories.filter(
                  (category) => category._id !== categoryId,
                ),
              ],
            }
          : oldData;
      });
    },
    onError: (err) => {
      alertsContext.dispatch({
        type: "ADD_ALERT",
        payload: {
          type: "error",
          message: err.message,
          title: "Failed to delete category",
        },
      });
    },
  });
}
