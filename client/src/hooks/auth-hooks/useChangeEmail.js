import {useState} from "react";
import {useMakeFetch} from "../useMakeFetch";

export function useChangeEmail() {
    const [isLoading, setIsLoading] = useState(false);
    const {makeFetch} = useMakeFetch(setIsLoading);
    const verifyPassword = async (password) => {
        return await makeFetch('http://localhost:5000/api/user/change-email/verify-password', {password});
    }

    const sendCode = async (newEmail) => {
        return await makeFetch('http://localhost:5000/api/user/change-email/send-code', {newEmail});
    }

    const verifyCode = async (code) => {
        return await makeFetch('http://localhost:5000/api/user/change-email/verify-code', {code});
    }

    return {isLoading, sendCode, verifyCode};
}