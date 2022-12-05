import {useQuery} from "react-query";

const fetchTasks = async () => {
    const response = await fetch('http://localhost:5000/api/task', {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    })

    if (!response.ok) {
        throw new Error('Failed to get tasks from server');
    }

    return response.json();
}

export function useGetTasks() {
    const queryObject = useQuery(["get-tasks"], fetchTasks);

    return {...queryObject, data: queryObject.data?.tasks}
}