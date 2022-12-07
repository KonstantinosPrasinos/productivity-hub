import {useMutation, useQueryClient} from "react-query";

const postTask = async (task) => {
    const response = await fetch('http://localhost:5000/api/task/create', {
        method: 'POST',
        body: JSON.stringify({task: {...task, currentEntryValue: undefined, streak: undefined}}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to add task to server');
    }

    return response.json();
}

export function useAddTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postTask,
        onSuccess: data => {
            queryClient.setQueryData(["get-tasks"], (oldData) => {
                return oldData ? {
                    tasks: [...oldData.tasks, data]
                } : oldData
            });
        }
    })
}