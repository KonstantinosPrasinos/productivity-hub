import {useContext, useState} from "react";
import {AlertsContext} from "../context/AlertsContext";
import {useDispatch, useSelector} from "react-redux";
import {addGroup, setGroups} from "../state/groupsSlice";
import {setHighestPriority, setLowestPriority} from "../state/settingsSlice";

export function useGroup () {
    const dispatch = useDispatch();
    const alertsContext = useContext(AlertsContext);
    const settings = useSelector((state) => state?.settings);
    const [isLoading, setIsLoading] = useState(false);

    const getGroups = async () => {
        setIsLoading(true);

        const response = await fetch('http://localhost:5000/api/group', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        });

        const data = await response.json();
        setIsLoading(false);

        if (!response.ok) {
            alertsContext.dispatch({type: 'ADD_ALERT', payload: {type: 'error', message: data.message}})
            return false;
        }

        dispatch(setGroups(data.groups));
        return true;
    }

    const addGroupToServer = async (group) => {
        const response = await fetch('http://localhost:5000/api/group/create', {
            method: 'POST',
            body: JSON.stringify({group}),
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            return false;
        }

        if (data.priority < settings.priorityBounds.low) {
            dispatch(setLowestPriority(data.priority));
        } else if (data.priority > settings.priorityBounds.high) {
            dispatch(setHighestPriority(data.priority));
        }

        dispatch(addGroup(data));
        return true;
    }

    return {isLoading, getGroups, addGroupToServer};
}