import {useQueries} from "react-query";
import {useContext} from "react";
import {AlertsContext} from "@/context/AlertsContext.jsx";

const fetchTaskCurrentEntry = async ({queryKey}) => {
    const entryId = queryKey[2];

    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/entry/${entryId}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    })

    if (!response.ok) {
        throw new Error((await response.json()).message);
    }

    return response.json();
}


export function useGetTaskCurrentEntry(taskId, entryId) {
    const alertsContext = useContext(AlertsContext);
    let queries;

    if (Array.isArray(taskId)) {
        queries = [];

        for (const index in taskId) {
            queries.push({
                queryKey: ["task-entries", taskId[index], entryId[index]],
                queryFn: fetchTaskCurrentEntry,
                staleTime: 30 * 60 * 60 * 1000,
                onError: err => {
                    alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: err.message, title: "Failed to get task entries"}})
                }
            })
        }
    } else {
        queries = [{
            queryKey: ["task-entries", taskId, entryId],
            queryFn: fetchTaskCurrentEntry,
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
                return entry.data?.entry
            }),
            isLoading
        };
    }

    return {...queryObject[0], data: queryObject[0].data?.entry}
}