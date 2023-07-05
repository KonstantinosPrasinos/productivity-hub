import {useMutation, useQueryClient} from "react-query";

const postDeleteTask = async (taskId) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/task/delete`, {
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
        onSuccess: (_, recoveredTaskId) => {
            queryClient.setQueryData(["tasks"], (oldData) => {
                return oldData ? {
                    tasks: [...oldData.tasks.map(task => {
                        if (task._id === recoveredTaskId) {
                            return {...task, hidden: true};
                        }
                        return task;
                    })]
                } : oldData
            })
        }
    })
}