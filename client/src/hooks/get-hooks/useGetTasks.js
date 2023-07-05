import {useQuery, useQueryClient} from "react-query";
import {useContext} from "react";
import {UserContext} from "@/context/UserContext";

const fetchTasks = async () => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/task`, {
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
    const user = useContext(UserContext);

    const queryObject = useQuery(["tasks"], fetchTasks, {
        staleTime: 30 * 60 * 60 * 1000,
        enabled: user.state?.id !== undefined,
        onSuccess: (data) => {
            // Update the priority lowest and highest used value
            queryClient.setQueryData(["settings"], (oldData) => {
                const priorities = data.tasks.map(task => task.priority);

                return {
                    ...oldData,
                    priorityBounds: {
                        low: priorities.length > 0 ? Math.min(...priorities) : 1,
                        high: priorities.length > 0 ? Math.max(...priorities) : 1
                    }
                }
            });
        }
    });


    return {...queryObject, data: queryObject.data?.tasks}
}