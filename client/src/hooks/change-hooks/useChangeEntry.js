import {useMutation, useQueryClient} from "react-query";
import {useCallback} from "react";
import {debounce} from "lodash";

const postChangeEntryValue = async (data) => {
    const response = await fetch('http://localhost:5000/api/entry/set', {
        method: 'POST',
        body: JSON.stringify({entryId: data.entryId, taskId: data.taskId, value: data.value}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to change entry value.')
    }

    return response.json();
}

export function useChangeEntry() {
    const queryClient = useQueryClient();

    const debouncedChangeEntry = useCallback(debounce(postChangeEntryValue, 300), []);

    return useMutation({
        mutationFn: debouncedChangeEntry,
        onMutate: async (data) => { // data has taskId, entryId and value
            await queryClient.cancelQueries({queryKey: ["task-entries", data.taskId, data.entryId]});

            const entryPreviously = queryClient.getQueryData(["task-entries", data.taskId, data.entryId]);

            queryClient.setQueryData(["task-entries", data.taskId, data.entryId], (oldData) => {
                console.log({
                    entry: {
                        ...oldData.entry,
                        value: data.value
                    }
                })
                return {
                    entry: {
                        ...oldData.entry,
                        value: data.value
                    }
                }
            })

            console.log(entryPreviously, data);

            return {entryPreviously};
        },
        onSuccess: (data, variables, context) => {
            console.log(data, variables, context);
            // queryClient.invalidateQueries({queryKey: ["task-entries", taskId]});
        },
        onError: (err, newEntry, context) => {
            // Todo alert for update failed
            console.log(newEntry, context.entryPreviously);
            // queryClient.setQueryData(["tasks"], context.entryPreviously);
        }
    })
}