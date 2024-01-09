import {useQuery} from "react-query";
import {useContext} from "react";
import {UserContext} from "@/context/UserContext";
import {AlertsContext} from "@/context/AlertsContext.jsx";

const fetchGroups = async () => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/group`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    })

    if (!response.ok) {
        throw new Error((await response.json()).message);
    }

    return response.json();
}

export function useGetGroups() {
    const user = useContext(UserContext);
    const alertsContext = useContext(AlertsContext);
    const queryObject = useQuery(["groups"], fetchGroups, {
        staleTime: 30 * 60 * 60 * 1000,
        enabled: user.state?.id !== undefined,
        onError: err => {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: err.message, title: "Failed to get groups"}})
        }
    });

    return {...queryObject, data: queryObject.data?.groups};
}