import {useMutation, useQueryClient} from "react-query";
import {useCallback, useContext} from "react";
import {AlertsContext} from "../../context/AlertsContext";
import { debounce } from "lodash";

const postChangeSettings = async (newSettings) => {
    // @ts-ignore
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/settings/update`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({settings: newSettings}),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error((await response.json()).message);
    }

    return response.json();
}

export function useChangeSettings() {
    const queryClient = useQueryClient();
    const alertsContext = useContext(AlertsContext);

    const mutation = useMutation({
        mutationFn: postChangeSettings,
        onMutate: async () => {
            // Get previous settings
            const previousSettings = queryClient.getQueryData(["settings"]);

            // Return previous settings as context to revert to in case of error
            return {previousSettings};
        },
        onSuccess: (newSettings, _, context) => {
            // @ts-ignore
            queryClient.setQueryData(["settings"], {...newSettings, priorityBounds: context.priorityBounds});
        },
        // @ts-ignore
        onError: (error, newSettings, context) => {
            // On error revert to previous settings
            queryClient.setQueryData(["settings"], context.previousSettings);
            // And create an error notification
            alertsContext.dispatch({
                type: "ADD_ALERT", payload: {
                    type: "error",
                    title: "Failed to change settings",
                    // @ts-ignore
                    message: error.message
                }
            })
        }
    });

    const debouncedMutation = useCallback(debounce(mutation.mutate, 300), []);

    return { ...mutation, mutate: debouncedMutation };
}