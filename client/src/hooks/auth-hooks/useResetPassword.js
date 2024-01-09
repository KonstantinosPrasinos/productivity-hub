import {useState} from "react";
import {useMakeFetch} from "../useMakeFetch";

export function useResetPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const {makeFetch} = useMakeFetch(setIsLoading);
    const sendCode = async (email) => {
        return await makeFetch(`${import.meta.env.VITE_BACK_END_IP}/api/security/reset-password/send-code`, {email});
    }

    const verifyCode = async (code, email) => {
        return await makeFetch(`${import.meta.env.VITE_BACK_END_IP}/api/security/reset-password/verify-code`, {code, email});
    }

    const setPassword = async (email, code, newPassword) => {
        return await makeFetch(`${import.meta.env.VITE_BACK_END_IP}/api/security/reset-password/set-password`, {email, code, newPassword});
    }

    return {isLoading, sendCode, verifyCode, setPassword};
}