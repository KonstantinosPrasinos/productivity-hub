import {useMutation, useQueryClient} from "react-query";

const postDeleteEntry = async ({taskId, entryId}) => {
    const response = await fetch('http://localhost:5000/api/entry/delete-single', {
        method: 'POST',
        body: JSON.stringify({taskId, entryId}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to delete task.')
    }

    return response.json();
}

export function useDeleteEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postDeleteEntry,
        onSuccess: async (_, variables) => {
            const {taskId} = variables;

            queryClient.setQueryData(["task-entries", taskId], (oldData) => {
                return oldData ? {
                    entries: [...oldData.entries.filter(entry => entry._id !== variables.entryId)]
                } : oldData
            })
        }
    })
}