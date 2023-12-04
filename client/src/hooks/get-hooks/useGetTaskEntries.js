import {useQueries} from "react-query";

const fetchTaskEntries = async ({queryKey}) => {
    const taskId = queryKey[1];
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/entry/all/${taskId}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    })

    if (!response.ok) {
        throw new Error('Failed to get task entries from server');
    }

    return response.json();
}


export function useGetTaskEntries(taskId) {
    let queries;

    if (Array.isArray(taskId)) {
        queries = taskId.map(id => ({
            queryKey: ["task-entries", id],
            queryFn: fetchTaskEntries,
            staleTime: 30 * 60 * 60 * 1000
        }))
    } else {
        queries = [{
            queryKey: ["task-entries", taskId],
            queryFn: fetchTaskEntries,
            staleTime: 30 * 60 * 60 * 1000
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