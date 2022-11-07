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

        if (!response.ok) {

        } else {
            const data = await response.json();

            dispatch(setSettings(data));

            localStorage.setItem('settings', JSON.stringify(data));
        }
    }

    return {getSettings};
}