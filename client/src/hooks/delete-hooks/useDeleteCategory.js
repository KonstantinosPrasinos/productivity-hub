import {useMutation, useQueryClient} from "react-query";
import {useContext} from "react";
import {AlertsContext} from "@/context/AlertsContext.jsx";

const postDeleteCategory = async (data) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/category/delete`, {
        method: 'POST',
        body: JSON.stringify({categoryId: data.categoryId, deleteTasks: data.deleteTasks}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error((await response.json()).message);
    }

    return response.json();
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    const alertsContext = useContext(AlertsContext);

    return useMutation({
        mutationFn: postDeleteCategory,
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({queryKey: ["tasks"]});
            await queryClient.invalidateQueries({queryKey: ["groups"]});
            queryClient.setQueryData(["categories"], (oldData) => {
                return oldData ? {
                    categories: [...oldData.categories.filter(category => category._id !== data.categoryId)]
                } : oldData
            })
        },
        onError: err => {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: err.message, title: "Failed to delete category"}})
        }
    })
}