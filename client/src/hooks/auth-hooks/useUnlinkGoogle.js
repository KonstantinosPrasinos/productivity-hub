import {useState} from "react";
import {useMakeFetch} from "../useMakeFetch";

export function useUnlinkGoogle() {
    const [isLoading, setIsLoading] = useState(false);
    const {makeFetch} = useMakeFetch(setIsLoading);

    const unlinkGoogle = async (password) => {
        return await makeFetch('http://localhost:5000/api/user/google/unlink', {password})
    }

    return {unlinkGoogle, isLoading};
}