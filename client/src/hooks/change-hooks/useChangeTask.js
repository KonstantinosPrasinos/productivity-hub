import {useMutation, useQueryClient} from "react-query";

const postChangeTask = async (data) => {
    const response = await fetch('http://localhost:5000/api/task/set', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({task: data}),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to edit settings.')
    }

    return response.json();
}

export function useChangeTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postChangeTask,
        onSuccess: (newTask) => {
            queryClient.setQueryData(["tasks"], (oldData) => {
                const taskBeforeEdit = oldData.tasks.find(task => task._id === newTask._id)

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
        }
    })
}