import {useQuery} from "react-query";

const fetchSettings = async () => {
    const response = await fetch('http://localhost:5000/api/settings', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to get settings from server');
    }

    return response.json();
}

export function useGetSettings(isAuthed) {
    return useQuery(["settings"], fetchSettings, {
        staleTime: 30 * 60 * 60 * 1000,
        enabled: isAuthed
    });
}