import {useState} from "react";
import {useMakeFetch} from "../useMakeFetch";

export function useChangeEmail() {
    const [isLoading, setIsLoading] = useState(false);
    const {makeFetch} = useMakeFetch(setIsLoading);
    const verifyPassword = async (password) => {
        return await makeFetch(`${import.meta.env.VITE_BACK_END_IP}/api/security/change-email/verify-password`, {password});
    }

    const sendCode = async (newEmail) => {
        return await makeFetch(`${import.meta.env.VITE_BACK_END_IP}/api/security/change-email/send-code`, {newEmail});
    }

    const verifyCode = async (code) => {
        return await makeFetch(`${import.meta.env.VITE_BACK_END_IP}/api/security/change-email/verify-code`, {code});
    }

    return {isLoading, verifyPassword, sendCode, verifyCode};
}