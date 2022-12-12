import {useQuery, useQueryClient} from "react-query";

const fetchTaskEntries = async () => {
    const response = await fetch('http://localhost:5000/api/entry', {
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
    const queryClient = useQueryClient();

    const queryObject = useQuery(["task-entries", taskId], fetchTaskEntries, {
        staleTime: 30 * 60 * 60 * 1000,
        onSuccess: (data) => {
            queryClient.setQueryData(["task-entries", taskId], (oldData) => {
                const priorities = data.tasks.map(task => task.priority);

                return {...oldData, priorityBounds: {
                        low: Math.min(...priorities),
                        high: Math.max(...priorities)
                    }}
            });
        }
    });


    return {...queryObject, data: queryObject.data?.tasks}
}