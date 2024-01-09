import {useContext, useState} from "react";
import {AlertsContext} from "../context/AlertsContext";

export function useVerify() {
    const [isLoading, setIsLoading] = useState(false);
    const alertsContext = useContext(AlertsContext);

    const verifyEmail = async (email, code) => {
        setIsLoading(true);

        const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/security/register/verify-code`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, code}),
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", title: "Failed to Create Account", message: data.message}});
            setIsLoading(false);
            return false;
        } else {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "success", title: "Account created successfully", message: "You can now log in."}});
            setIsLoading(false);
            return true;
        }
    }

    const resendEmailCode = async (email) => {
        const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/security/register/resend-code`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email}),
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", title: "Failed to Resend Code", message: data.message}});
            return false;
        } else {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "success", title: "Code Sent Successfully", message: "Please check your email."}});
            return true;
        }
    }

    return {verifyEmail, isLoading, resendEmailCode}
}