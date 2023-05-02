import {useMutation, useQueryClient} from "react-query";

const postChangeGroup = async (data) => {
    const response = await fetch('http://localhost:5000/api/group/set', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({groups: data}),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to edit settings.')
    }

    return response.json();
}

export function useChangeGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postChangeGroup,
        onSuccess: (newGroup) => {
            queryClient.setQueryData(["groups"], (oldData) => {
                return {
                    groups: [
                        ...oldData.groups.filter(group => {
                            if (!newGroup.newGroups.find(tempGroup => tempGroup._id === group._id)) {
                                return group;
                            }
                        }),
                        ...newGroup.newGroups
                    ]
                }
            })
        }
    })
}