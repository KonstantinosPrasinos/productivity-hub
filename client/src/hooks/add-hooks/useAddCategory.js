import {useMutation, useQueryClient} from "react-query";
import {useContext} from "react";
import {AlertsContext} from "@/context/AlertsContext.jsx";

const postCategory = async (data) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/category/create`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error((await response.json()).message);
    }

    return response.json();
}

export function useAddCategory() {
    const queryClient = useQueryClient();
    const alertsContext = useContext(AlertsContext);

    return useMutation({
        mutationFn: postCategory,
        onSuccess: data => {
            queryClient.setQueryData(["categories"], (oldData) => {
                if (oldData?.categories?.length) {
                    return {
                        categories: [...oldData.categories, data.newCategory],
                    }
                }
                return {
                    categories: [data.newCategory]
                }
            });

            if (data.newGroups) {
                queryClient.setQueryData(["groups"], (oldData) => {
                    return oldData ? {
                        groups: [...oldData.groups, ...data.newGroups]
                    } : oldData
                });
            }
        },
        onError: err => {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: err.message, title: "Failed to create category"}})
        }
    })
}