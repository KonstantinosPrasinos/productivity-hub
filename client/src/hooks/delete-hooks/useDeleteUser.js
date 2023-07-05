import {useGetSettings} from "../get-hooks/useGetSettings";
import {useMemo} from "react";
import {useGetTasks} from "../get-hooks/useGetTasks";
import {useGetGroups} from "../get-hooks/useGetGroups";

const postDeleteUser = async () => {
    const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/user/delete`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to delete user.')
    }

    return response.json();
}

export function useDeleteUser() {
    const {refetch: refetchSettings, isLoading: settingsLoading} = useGetSettings();
    const {refetch: refetchTasks, isLoading: tasksLoading} = useGetTasks();
    const {refetch: refetchGroups, isLoading: groupsLoading} = useGetGroups();

    const isLoading = useMemo(() => {
        return tasksLoading || groupsLoading || settingsLoading;
    }, [settingsLoading, groupsLoading, settingsLoading]);

    const deleteUser = () => {
        const userDeleted = postDeleteUser();

        if (userDeleted) {
            refetchSettings()
            refetchTasks();
            refetchGroups();
        }
    }

    return {isLoading, deleteUser};
}