import {useContext, useState} from "react";
import {UserContext} from "../context/UserContext";
import {AlertsContext} from "../context/AlertsContext";
import {useQueryClient} from "react-query";

export function useAuth() {
    const {dispatch} = useContext(UserContext);
    const alertsContext = useContext(AlertsContext);
    const queryClient = useQueryClient();

    const [isLoading, setIsLoading] = useState(false);

    const login = async (email, password) => {
        setIsLoading(true);

        const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/user/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password}),
            credentials: 'include'
        });

        if (!response.ok) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: (await response.json()).message}});
        } else {
            const data = await response.json();
            const date = new Date();
            date.setMonth(date.getMonth() + 1);
            date.setHours(date.getHours() - 1);
            dispatch({type: "SET_USER", payload: {id: data.user?._id, email: data.user?.local.email, googleLinked: data.user?.googleLinked}});
            localStorage.setItem('user', JSON.stringify({id: data.user?._id, email: data.user?.local.email, validUntil: date, googleLinked: data.user?.googleLinked}));
        }
        setIsLoading(false);
    }

    const loginGoogle = async (data) => {
        setIsLoading(true);

        const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/user/google`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
            credentials: 'include'
        });

        if (!response.ok) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: (await response.json()).message}});
        } else {
            const data = await response.json();
            const date = new Date();
            console.log(data);
            date.setMonth(date.getMonth() + 1);
            date.setHours(date.getHours() - 1);
            dispatch({type: "SET_USER", payload: {id: data.user?._id, email: data.user?.local.email, googleLinked: data.user?.googleLinked}});
            localStorage.setItem('user', JSON.stringify({id: data.user?._id, email: data.user?.local.email, validUntil: date, googleLinked: data.user?.googleLinked}));
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
            queryClient.removeQueries();
        }
    }

    const resetAccount = async (password) => {
        const response = await fetch('http://localhost:5000/api/user/reset', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({password}),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: data.message}});
            return;
        }

        await queryClient.invalidateQueries({queryKey: ["tasks"]});
        await queryClient.invalidateQueries({queryKey: ["groups"]});
        await queryClient.invalidateQueries({queryKey: ["categories"]});
    }

    return {login, logout, register, isLoading, resetAccount, loginGoogle}
}