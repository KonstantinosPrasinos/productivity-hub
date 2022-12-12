import {useQuery} from "react-query";

const fetchGroups = async () => {
    const response = await fetch('http://localhost:5000/api/group', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    })

    if (!response.ok) {
        throw new Error('Failed to get groups from server');
    }

    return response.json();
}

export function useGetGroups() {
    const queryObject = useQuery(["groups"], fetchGroups, {
        staleTime: 30 * 60 * 60 * 1000
    });

    return {...queryObject, data: queryObject.data?.groups};
}