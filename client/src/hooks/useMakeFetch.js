import {useContext} from "react";
import {AlertsContext} from "../context/AlertsContext";

export function useMakeFetch(setIsLoading) {
    const alertsContext = useContext(AlertsContext);

    const makeFetch = async (url, input) => {
        setIsLoading(true);

        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: input ? JSON.stringify(input) : undefined,
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: data.message}});
            setIsLoading(false);
            return false;
        }

        setIsLoading(false);
        return true;
    }

    return {makeFetch};
}