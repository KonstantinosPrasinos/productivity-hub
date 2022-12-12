import {useQuery, useQueryClient} from "react-query";

const fetchTasks = async () => {
    const response = await fetch('http://localhost:5000/api/task', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    })

    if (!response.ok) {
        throw new Error('Failed to get tasks from server');
    }

    return response.json();
}


export function useGetTasks() {
    const queryClient = useQueryClient();

    const queryObject = useQuery(["get-tasks"], fetchTasks, {
        staleTime: 30 * 60 * 60 * 1000,
        onSuccess: (data) => {
            queryClient.setQueryData(["get-settings"], (oldData) => {
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