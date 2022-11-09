import {useContext, useState} from "react";
import {UserContext} from "../context/UserContext";
import {useSettings} from "./useSettings";
import {useDispatch} from "react-redux";
import {removeSettings} from "../state/settingsSlice";
import {AlertsContext} from "../context/AlertsContext";

export function useAuth() {
    const {dispatch} = useContext(UserContext);
    const alertsContext = useContext(AlertsContext);
    const {getSettings} = useSettings();
    const reduxDispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);

    const login = async (email, password) => {
        setIsLoading(true);

        const response = await fetch('http://localhost:5000/api/user/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
            credentials: 'include'
        });

        if (!response.ok) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Incorrect email or password."}});
        } else {
            const data = await response.json();

            dispatch({type: "SET_USER", payload: {id: data.user?._id, email: data.user?.local.email}});
            localStorage.setItem('user', JSON.stringify({id: data.user?._id, email: data.user?.local.email}));

            await getSettings();
        }
        setIsLoading(false);
    }

    const register = async (email, password) => {
        setIsLoading(true);

        const response = await fetch('http://localhost:5000/api/user/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
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

    const logout = async () => {
        const response = await fetch('http://localhost:5000/api/user/logout', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        });

        if (!response.ok) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Failed to log out user."}});
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('settings');
            dispatch({type: "REMOVE_USER"});
            reduxDispatch(removeSettings());
        }
    }

    const resetPasswordEmail = async (email) => {
        setIsLoading(true);

        const response = await fetch('http://localhost:5000/api/user/forgot-password/send-email', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email}),
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

    const setForgotPassword = async (newPassword) => {
        setIsLoading(true);

        const response = await fetch('http://localhost:5000/api/user/forgot-password/set-password', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({newPassword}),
            credentials: 'include'
        });

        const data = await response.json();
        alertsContext.dispatch({type: "ADD_ALERT", payload: {type: response.ok ? "success" : "error", message: data.message}});
        setIsLoading(false);

        return response.ok;
    }

    return {login, logout, register, isLoading, resetPasswordEmail, setForgotPassword}
}