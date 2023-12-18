import {useMutation, useQueryClient} from "react-query";
import {useContext} from "react";
import {AlertsContext} from "@/context/AlertsContext.jsx";

const postDeleteEntry = async ({taskId, entryId}) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/entry/delete-single`, {
        method: 'POST',
        body: JSON.stringify({taskId, entryId}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error((await response.json()).message);
    }

    return response.json();
}

export function useDeleteEntry() {
    const queryClient = useQueryClient();
    const alertsContext = useContext(AlertsContext);

    return useMutation({
        mutationFn: postDeleteEntry,
        onSuccess: async (_, variables) => {
            const {taskId} = variables;

            queryClient.setQueryData(["task-entries", taskId], (oldData) => {
                return oldData ? {
                    entries: [...oldData.entries.filter(entry => entry._id !== variables.entryId)]
                } : oldData
            })
        },
        onError: err => {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: err.message, title: "Failed to delete entry"}})
        }
    })
}