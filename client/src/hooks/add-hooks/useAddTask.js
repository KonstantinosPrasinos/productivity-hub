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

    const updateSettingsLowAndHigh = (task) => {
        queryClient.setQueryData(["settings"], (oldData) => {
            const newData = {...oldData};

            if (task.priority < oldData.priorityBounds.low) {
                newData.priorityBounds.low = task.priority;
            }

            if (task.priority > oldData.priorityBounds.high) {
                newData.priorityBounds.high = task.priority;
            }

            return newData;
        })
    }

    return useMutation({
        mutationFn: postTask,
        onSuccess: data => {
            queryClient.setQueryData(["tasks"], (oldData) => {
                updateSettingsLowAndHigh(data);
                return oldData ? {
                    tasks: [...oldData.tasks, data]
                } : oldData
            });
        }
    })
}