import {useMutation, useQueryClient} from "react-query";
import {useCallback, useContext, useRef} from "react";
import debounce from "lodash/debounce.js";
import {AlertsContext} from "../../context/AlertsContext";

const postChangeEntryValue = async (data) => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/entry/set-value`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error((await response.json()).message);
    }

    return response.json();
}

export function useChangeEntryValue() {
    const queryClient = useQueryClient();
    const currentServerValue = useRef();
    const alertsContext = useContext(AlertsContext);

    const mutation = useMutation({
        mutationFn: postChangeEntryValue,
        onSuccess: () => {
            // If the mutation is a success reset serverValue ref
            currentServerValue.current = undefined;
        },
        onError: (err, data) => {
            // If the mutation fails reset the client state to the previous value and send an alert
            queryClient.setQueryData(["task-entries", data.taskId, data.entryId], (oldData) => {
                alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", title: "Failed Change Entry", message: err.message}});

                const entry = {
                    ...oldData.entry,
                    value: currentServerValue.current
                }

                // Reset server value ref
                currentServerValue.current = undefined;

                return {entry};
            });
        }
    })

    const debouncedMutation = useCallback(debounce(mutation.mutate, 300), []);

    const debounceMutate = ({taskId, entryId, value}) => {
        // Set current data to value optimistically
        queryClient.setQueryData(["task-entries", taskId, entryId], (oldData) => {
            // Keep record of server value to rollback in case of error
            if (currentServerValue.current === undefined) {
                currentServerValue.current = oldData.entry.value;
            }

            return {
                entry: {
                    ...oldData.entry,
                    value: value
                }
            }
        });

        debouncedMutation({taskId, entryId, value});
    }

    return {...mutation, mutate: debounceMutate};
}