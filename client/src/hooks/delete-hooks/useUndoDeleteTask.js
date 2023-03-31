import {useMutation, useQueryClient} from "react-query";

const postUndoDeleteTask = async (taskId) => {
    const response = await fetch('http://localhost:5000/api/task/undo-delete', {
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

export function useUndoDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postUndoDeleteTask,
        onSuccess: (_, recoveredTaskId) => {
            queryClient.setQueryData(["tasks"], (oldData) => {
                return oldData ? {
                    tasks: [...oldData.tasks.map(task => {
                        if (task._id === recoveredTaskId) {
                            return {...task, hidden: false};
                        }
                        return task;
                    })]
                } : oldData
            })
        }
    })
}