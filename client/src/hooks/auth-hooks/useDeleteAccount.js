import {useMutation, useQueryClient} from "react-query";
import {useContext} from "react";
import {AlertsContext} from "../../context/AlertsContext";
import {UserContext} from "../../context/UserContext";

const postDeleteAccount = async (password) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/user/delete`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password}),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(await response.json());
    }

    return response.json();
}

export function useDeleteAccount() {
    const queryClient = useQueryClient();
    const alertsContext = useContext(AlertsContext);
    const userContext = useContext(UserContext);

    return useMutation({
        mutationFn: postDeleteAccount,
        onError: () => {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Failed to delete account"}});
        },
        onSettled: () => {
            localStorage.removeItem("user");
            userContext.dispatch({type: "SET_USER", payload: {}});
            queryClient.invalidateQueries({queryKey: ["tasks"]});
            queryClient.invalidateQueries({queryKey: ["groups"]});
            queryClient.invalidateQueries({queryKey: ["categories"]});
            queryClient.invalidateQueries({queryKey: ["settings"]});
        }
    })
}