import {useMutation, useQueryClient} from "react-query";

const postUndoDeleteTask = async (taskId) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/task/undo-delete`, {
        method: 'POST',
        body: JSON.stringify({taskId}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error((await response.json()).message);
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
        },
        onError: err => {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: err.message, title: "Failed to undo task deletion"}})
        }
    })
}