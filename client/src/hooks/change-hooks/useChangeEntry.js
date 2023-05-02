import {useMutation, useQueryClient} from "react-query";

const postChangeEntry = async (data) => {
    const response = await fetch('http://localhost:5000/api/entry/set', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to edit settings.')
    }

    return response.json();
}

export function useChangeEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postChangeEntry,
        onSuccess: (newEntry) => {
            const currentDate = new Date();
            const date = new Date(newEntry.date);

            const areSameDay = date.getFullYear() === currentDate.getFullYear() &&
                date.getMonth() === currentDate.getMonth() &&
                date.getDate() === currentDate.getDate();

            if (areSameDay) {
                queryClient.setQueryData(["task-entries", newEntry.taskId, newEntry._id], () => {
                    return {entry: newEntry};
                });
            } else {
                queryClient.setQueryData(["task-entries", newEntry.taskId], (oldData) => {
                    return oldData ? {
                        entries: [...oldData.entries.filter(entry => entry._id !== newEntry._id), newEntry]
                    } : oldData
                })
            }
        }
    })
}