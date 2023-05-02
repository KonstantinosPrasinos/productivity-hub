import {useQuery} from "react-query";

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


export function useGetTaskEntries(taskId, ) {
    const queryObject = useQuery(["task-entries", taskId], fetchTaskEntries, {
        staleTime: 30 * 60 * 60 * 1000
    });


    return {...queryObject, data: queryObject.data?.entries}
}