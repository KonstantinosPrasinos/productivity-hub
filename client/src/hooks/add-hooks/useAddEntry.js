import {useMutation, useQueryClient} from "react-query";

const postEntry = async (entry) => {
    const response = await fetch('http://localhost:5000/api/entry/create', {
        method: 'POST',
        body: JSON.stringify({...entry}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to add entry to server');
    }

    return response.json();
}



export function useAddEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postEntry,
        onSuccess: data => {
            queryClient.setQueryData(["task-entries", data.entry.taskId], (oldData) => {
                return oldData ? {
                    entries: [...oldData.entries, data.entry]
                } : oldData
            });
        }
    })
}