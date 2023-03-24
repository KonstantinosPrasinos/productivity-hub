import {useQuery} from "react-query";

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
    const queryObject = useQuery(["task-entries", taskId, entryId], fetchTaskCurrentEntry, {
        staleTime: 30 * 60 * 60 * 1000,
    });

    return {...queryObject, data: queryObject.data?.entry}
}