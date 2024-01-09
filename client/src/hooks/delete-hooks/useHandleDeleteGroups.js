import {useQueryClient} from "react-query";
import {useContext} from "react";
import {MiniPagesContext} from "@/context/MiniPagesContext";

export function useHandleDeleteGroups() {
    const queryClient = useQueryClient();
    const miniPagesContext = useContext(MiniPagesContext);

    const deleteGroups = (deletedGroupIds, affectedTaskIds, action) => {
        // Remove the deleted group from cache
        queryClient.setQueryData(["groups"], (oldData) => {
            return oldData ? {
                groups: [...oldData.groups?.filter(group => deletedGroupIds.indexOf(group._id) === -1)]
            } : oldData
        })

        // Complete the action selected by the user for the children tasks of the deleted time-groups
        if (affectedTaskIds.length > 0) {
            queryClient.setQueryData(["tasks"], (oldData) => {
                switch (action) {
                    case "Keep their repeat details":
                        // Only remove the group field from the task
                        return oldData ? {
                            tasks: [
                                ...oldData.tasks?.map(task => {
                                    if (affectedTaskIds.indexOf(task._id) === -1)
                                        return task;
                                    return {...task, group: undefined}
                                })
                            ]
                        } : oldData
                    case "Remove their repeat details":
                        // Remove the group, big time-period and number, and reset the time, small time-period and starting date of the task
                        return oldData ? {
                            tasks: [
                                ...oldData.tasks?.map(task => {
                                    if (affectedTaskIds.indexOf(task._id) === -1)
                                        return task;
                                    return {
                                        ...task,
                                        repeatRate: {
                                            group: undefined,
                                            time: {},
                                            smallTimePeriod: [],
                                            startingDate: [],
                                            bigTimePeriod: undefined,
                                            number: undefined
                                        }
                                    }
                                })
                            ]
                        } : oldData
                    case "Delete them":
                        // Delete all the affected tasks
                        for (const taskId of affectedTaskIds) {
                            miniPagesContext.dispatch({type: 'REMOVE_SPECIFIC_PAGE', payload: {type: 'task-view', id: taskId}});
                        }
                        return oldData ? {
                            tasks: [
                                ...oldData.tasks?.filter(task => affectedTaskIds.indexOf(task._id) === -1)
                            ]
                        } : oldData
                }
            })
        }
    }

    return {deleteGroups};
}