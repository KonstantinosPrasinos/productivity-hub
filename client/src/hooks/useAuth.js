import {useContext} from "react";
import {UserContext} from "../context/UserContext";
import {useSettings} from "./useSettings";
import {useDispatch} from "react-redux";
import {removeSettings} from "../state/settingsSlice";

export function useAuth() {
    const {dispatch} = useContext(UserContext);
    const {getSettings} = useSettings();
    const reduxDispatch = useDispatch();

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

    const register = async (email, password) => {
        const response = await fetch('http://localhost:5000/api/user/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
            credentials: 'include'
        });

        if (!response.ok) {

        } else {
            return true;
        }
    }

    const logout = async () => {
        const response = await fetch('http://localhost:5000/api/user/logout', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        });

        if (!response.ok) {

        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('settings');
            dispatch({type: "REMOVE_USER"});
            reduxDispatch(removeSettings());
        }
    }

    return {login, logout, register}
}