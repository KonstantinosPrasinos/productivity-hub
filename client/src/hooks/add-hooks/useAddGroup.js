import {useMutation, useQueryClient} from "react-query";

const postGroup = async (group) => {
    const response = await fetch('http://localhost:5000/api/group/create', {
        method: 'POST',
        body: JSON.stringify({group}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to add group to server');
    }

    return response.json();
}

export function useAddGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postGroup,
        onSuccess: data => {
            queryClient.setQueryData(["get-groups"], (oldData) => {
                return oldData ? {
                    groups: [...oldData.tasks, data]
                } : oldData
            });
        }
    })
}