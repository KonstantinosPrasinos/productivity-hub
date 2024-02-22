import {useMutation, useQueryClient} from "react-query";
import {useContext} from "react";
import {AlertsContext} from "@/context/AlertsContext.jsx";

const postTask = async (task) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/task/create`, {
        method: 'POST',
        body: JSON.stringify({task: {...task, currentEntryValue: undefined, streak: undefined}}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error((await response.json()).message);
    }

    return response.json();
}



export function useAddTask() {
    const queryClient = useQueryClient();
    const alertsContext = useContext(AlertsContext);

    const updateSettingsLowAndHigh = (task) => {
        queryClient.setQueryData(["settings"], (oldData) => {
            const newData = {...oldData};

            if (task.priority < oldData.priorityBounds.low) {
                newData.priorityBounds.low = task.priority;
            }

            if (task.priority > oldData.priorityBounds.high) {
                newData.priorityBounds.high = task.priority;
            }

            return newData;
        })
    }

    return useMutation({
        mutationFn: postTask,
        onSuccess: data => {
            queryClient.setQueryData(["tasks"], (oldData) => {
                updateSettingsLowAndHigh(data);
                return oldData ? {
                    tasks: [...oldData.tasks, {...data, hidden: false}]
                } : oldData
            });
        },
        onError: err => {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: err.message, title: "Failed to create task"}})
        }
    })
}