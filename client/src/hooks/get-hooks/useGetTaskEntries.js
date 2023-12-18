import {useQueries} from "react-query";
import {useContext} from "react";
import {AlertsContext} from "@/context/AlertsContext.jsx";

const fetchTaskEntries = async ({queryKey}) => {
    const taskId = queryKey[1];
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/entry/all/${taskId}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    })

    if (!response.ok) {
        throw new Error((await response.json()).message);
    }

    return response.json();
}


export function useGetTaskEntries(taskId) {
    const alertsContext = useContext(AlertsContext);
    let queries;

    if (Array.isArray(taskId)) {
        queries = taskId.map(id => ({
            queryKey: ["task-entries", id],
            queryFn: fetchTaskEntries,
            staleTime: 30 * 60 * 60 * 1000,
            onError: err => {
                alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: err.message, title: "Failed to get task entries"}})
            }
        }))
    } else {
        queries = [{
            queryKey: ["task-entries", taskId],
            queryFn: fetchTaskEntries,
            staleTime: 30 * 60 * 60 * 1000,
            onError: err => {
                alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: err.message, title: "Failed to get task entries"}})
            }
        }]
    }

    const queryObject = useQueries(queries);

    if (Array.isArray(taskId)) {
        let isLoading = false;

        return {
            data: queryObject.map(entry => {
                if (entry.isLoading) isLoading = true;
                return entry.data?.entries
            }),
            isLoading
        };
    }

    return {...queryObject[0], data: queryObject[0].data?.entries}
}