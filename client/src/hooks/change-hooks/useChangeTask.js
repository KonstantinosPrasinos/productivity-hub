import {useMutation, useQueryClient} from "react-query";

const postChangeTask = async (data) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/task/set`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({task: data}),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error((await response.json()).message);
    }

    return response.json();
}

export function useChangeTask() {
    const queryClient = useQueryClient();
    const alertsContext = useContext(AlertsContext);

    return useMutation({
        mutationFn: postChangeTask,
        onSuccess: (newTask) => {
            queryClient.setQueryData(["tasks"], (oldData) => {
                const taskBeforeEdit = oldData.tasks.find(task => task._id === newTask._id);

                return {
                    tasks: [
                            ...oldData.tasks.filter(task => task._id !== newTask._id),
                            {
                                ...newTask,
                                currentEntryId: taskBeforeEdit.currentEntryId,
                                streak: taskBeforeEdit.streak
                            }
                        ]
                }
            })
        },
        onError: err => {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: err.message, title: "Failed to edit task"}})
        }
    })
}