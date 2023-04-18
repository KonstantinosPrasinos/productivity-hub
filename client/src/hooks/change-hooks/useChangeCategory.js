import {useMutation, useQueryClient} from "react-query";

const postChangeCategory = async (data) => {
    const response = await fetch('http://localhost:5000/api/category/set', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({category: data}),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to edit settings.')
    }

    return response.json();
}

export function useChangeCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postChangeCategory,
        onSuccess: (newCategory) => {
            queryClient.setQueryData(["categories"], (oldData) => {
                return {
                    categories: [
                        ...oldData.categories.filter(category => category._id !== newCategory.newCategory._id),
                        {
                            ...newCategory.newCategory
                        }
                    ]
                }
            })
        }
    })
}