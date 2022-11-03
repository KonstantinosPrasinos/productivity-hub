import {useContext} from "react";
import {UserContext} from "../context/UserContext";
import {useSettings} from "./useSettings";

export function useAuth() {
    const {dispatch} = useContext(UserContext);
    const {getSettings} = useSettings();

    const login = async (email, password) => {
        const response = await fetch('http://localhost:5000/api/user/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
            credentials: 'include'
        });

        if (!response.ok) {

        } else {
            const data = await response.json();

            dispatch({type: "SET_USER", payload: {id: data.user?._id, email: data.user?.local.email}});
            localStorage.setItem('user', JSON.stringify({id: data.user?._id, email: data.user?.local.email}));

            await getSettings();
        }
    }

    return {login}
}