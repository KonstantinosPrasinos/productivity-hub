import {useMutation, useQueryClient} from "react-query";

const postCategory = async (category) => {
    const response = await fetch('http://localhost:5000/api/category/create', {
        method: 'POST',
        body: JSON.stringify({category}),
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
                        categories: [...oldData.categories, data],
                    }
                }
                return {
                    categories: [data]
                }
            });
        }
    })
}