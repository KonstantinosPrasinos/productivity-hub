import {useContext, useState} from "react";
import {AlertsContext} from "../context/AlertsContext";
import {useDispatch} from "react-redux";
import {addTask, setTasks} from "../state/tasksSlice";

export function useTask () {
    const dispatch = useDispatch();
    const alertsContext = useContext(AlertsContext);
    const [isLoading, setIsLoading] = useState(false);

    const getTasks = async () => {
        setIsLoading(true);

        const response = await fetch('http://localhost:5000/api/task', {
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

        dispatch(setTasks(data.tasks));
        return true;
    }

    const addTaskToServer = async (task) => {
        const response = await fetch('http://localhost:5000/api/task/create', {
            method: 'POST',
            body: JSON.stringify({task: {...task, lastEntryDate: undefined, previousEntry: undefined, shortHistory: undefined, id: undefined}}),
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
        } else {
            dispatch(addTask(data));
        }
    }

    return {isLoading, getTasks, addTaskToServer};
}