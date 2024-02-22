import {useMutation, useQueryClient} from "react-query";
import {useContext} from "react";
import {AlertsContext} from "@/context/AlertsContext.jsx";

const postEntry = async (entry) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/entry/create`, {
        method: 'POST',
        body: JSON.stringify({...entry}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error((await response.json()).message);
    }

    return response.json();
}



export function useAddEntry() {
    const queryClient = useQueryClient();
    const alertsContext = useContext(AlertsContext);

    return useMutation({
        mutationFn: postEntry,
        onSuccess: data => {
            queryClient.setQueryData(["task-entries", data.entry.taskId], (oldData) => {
                return oldData ? {
                    entries: [...oldData.entries, data.entry]
                } : oldData
            });
        },
        onError: err => {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: err.message, title: "Failed to add entry"}})
        }
    })
}