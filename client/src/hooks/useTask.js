import {useContext, useEffect, useState} from "react";
import {AlertsContext} from "../context/AlertsContext";
import {useDispatch, useSelector} from "react-redux";
import {addTask, setTasks} from "../state/tasksSlice";

export function useTask () {
    const tasks = useSelector((state) => state?.tasks.tasks);
    const dispatch = useDispatch();
    const alertsContext = useContext(AlertsContext);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (tasks === false) {
            let ignore = false;

            setIsLoading(true);

            fetch('http://localhost:5000/api/task', {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })
                .then(response => response.json())
                .then(json => {
                    if (!ignore) {
                        if (json.tasks) {
                            dispatch(setTasks(json.tasks));
                        } else {
                            alertsContext.dispatch({type: 'ADD_ALERT', payload: {type: 'error', message: json.message}})
                        }

                        setIsLoading(false);
                    }
                })

            return () => {
                ignore = true;
            }
        }
    }, [])

    const addTaskToServer = async (task) => {
        const response = await fetch('http://localhost:5000/api/task/create', {
            method: 'POST',
            body: JSON.stringify({task: {...task, lastEntryDate: undefined, previousEntry: undefined, shortHistory: undefined}}),
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
        } else {
            dispatch(addTask(data));
        }
    }

    return {isLoading, addTaskToServer};
}