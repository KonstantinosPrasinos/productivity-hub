import {useMutation, useQueryClient} from "react-query";

const postCategory = async (data) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/category/create`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to add category to server');
    }

    return response.json();
}

export function useAddCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postCategory,
        onSuccess: data => {
            queryClient.setQueryData(["categories"], (oldData) => {
                if (oldData?.categories?.length) {
                    return {
                        categories: [...oldData.categories, data.newCategory],
                    }
                }
                return {
                    categories: [data]
                }
            });

            if (data.newGroups) {
                queryClient.setQueryData(["groups"], (oldData) => {
                    return oldData ? {
                        groups: [...oldData.groups, ...data.newGroups]
                    } : oldData
                });
            }
        }
    })
}