import {useQuery} from "react-query";

const fetchCategories = async () => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/category`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    })

    if (!response.ok) {
        throw new Error('Failed to get groups from server');
    }

    return response.json();
}

export function useGetCategories() {
    const queryObject = useQuery(["categories"], fetchCategories, {
        staleTime: 30 * 60 * 60 * 1000
    })

    return {...queryObject, data: queryObject.data?.categories};
}