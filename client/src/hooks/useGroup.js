import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {addGroup, setGroups} from "../state/groupsSlice";
import {setHighestPriority, setLowestPriority} from "../state/settingsSlice";

export function useGroup () {
    const groups = useSelector((state) => state?.groups.groups);
    const dispatch = useDispatch();
    const settings = useSelector((state) => state?.settings);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (groups === false) {
            let ignore = false;

            setIsLoading(true);

            fetch('http://localhost:5000/api/group', {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })
                .then(response => response.json())
                .then(json => {
                    if (!ignore) {
                        dispatch(setGroups(json.groups))
                    }

                    setIsLoading(false);
                })

            return () => {
                ignore = true;
            }
        }
    }, [])

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

    return {isLoading, addGroupToServer};
}