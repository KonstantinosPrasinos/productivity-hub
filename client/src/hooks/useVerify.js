import {useContext, useState} from "react";
import {AlertsContext} from "../context/AlertsContext";

export function useVerify() {
    const [isLoading, setIsLoading] = useState(false);
    const alertsContext = useContext(AlertsContext);

    const verifyForgotPassword = async (email, code) => {
        setIsLoading(true);

        const response = await fetch('http://localhost:5000/api/verify/forgot-password', {
            method: 'POST',
            body: JSON.stringify({email, code}),
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: data.message}});
            setIsLoading(false);
            return false;
        } else {
            setIsLoading(false);
            return true;
        }
    }

    const resendForgotPasswordCode = async (email) => {
        const response = await fetch('http://localhost:5000/api/verify/forgot-password/resend', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email}),
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: data.message}});
            return false;
        } else {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "success", message: "Email resent successfully"}});
            return true;
        }
    }

    const verifyEmail = async (email, code) => {
        setIsLoading(true);

        const response = await fetch('http://localhost:5000/api/verify/email', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, code}),
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: data.message}});
            setIsLoading(false);
            return false;
        } else {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "success", message: "Account created successfully."}});
            setIsLoading(false);
            return true;
        }
    }

    const resendEmailCode = async (email) => {
        const response = await fetch('http://localhost:5000/api/verify/email/resend', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email}),
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: data.message}});
            return false;
        } else {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "success", message: "Email resent successfully"}});
            return true;
        }
    }

    return {verifyForgotPassword, verifyEmail, isLoading, resendEmailCode, resendForgotPasswordCode}
}