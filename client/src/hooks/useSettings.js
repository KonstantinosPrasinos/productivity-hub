import {useDispatch} from "react-redux";
import {setSettings} from "../state/settingsSlice";

export function useSettings () {
    const dispatch = useDispatch();

    const getSettings = async () => {
        const response = await fetch('http://localhost:5000/api/settings', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {

        } else {
            dispatch(setSettings({...data, priorityBounds: {low: 1, high: 1}}));

            localStorage.setItem('settings', JSON.stringify({...data, priorityBounds: {low: 1, high: 1}}));
        }
    }

    const setSettingsServer = async (settings) => {
        const response = await fetch('http://localhost:5000/api/settings/update', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({settings}),
            credentials: 'include'
        });

        dispatch(setSettings({...settings, priorityBounds: {low: 1, high: 1}}));

        localStorage.setItem('settings', JSON.stringify({...settings, priorityBounds: {low: 1, high: 1}}));

        const data = await response.json();

        if (!response.ok) {

        }
    }

    return {getSettings, setSettingsServer};
}