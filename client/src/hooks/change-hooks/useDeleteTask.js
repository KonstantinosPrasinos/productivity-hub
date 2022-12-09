import {useMutation, useQueryClient} from "react-query";

const postDeleteTask = async (taskId) => {
    const response = await fetch('http://localhost:5000/api/task/delete', {
        method: 'POST',
        body: JSON.stringify({taskId}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to delete task.')
    }

    return response.json();
}

export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postDeleteTask,
        onSuccess: data => {
            queryClient.setQueryData(["get-tasks"], (oldData) => {
                return oldData ? {
                    tasks: [...oldData.tasks.filter(task => task._id !== data.taskId)]
                } : oldData
            })
        }
    })
}