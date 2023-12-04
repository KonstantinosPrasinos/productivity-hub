import {useQueries} from "react-query";

const fetchTaskCurrentEntry = async ({queryKey}) => {
    const entryId = queryKey[2];

    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/entry/${entryId}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    })

    if (!response.ok) {
        throw new Error('Failed to get task entries from server');
    }

    return response.json();
}


export function useGetTaskCurrentEntry(taskId, entryId) {
    let queries;

    if (Array.isArray(taskId)) {
        queries = [];

        for (const index in taskId) {
            queries.push({
                queryKey: ["task-entries", taskId[index], entryId[index]],
                queryFn: fetchTaskCurrentEntry,
                staleTime: 30 * 60 * 60 * 1000
            })
        }
    } else {
        queries = [{
            queryKey: ["task-entries", taskId, entryId],
            queryFn: fetchTaskCurrentEntry,
            staleTime: 30 * 60 * 60 * 1000
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