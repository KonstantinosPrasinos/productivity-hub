import {useMutation, useQueryClient} from "react-query";
import {useContext} from "react";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import {useHandleDeleteGroups} from "@/hooks/delete-hooks/useHandleDeleteGroups";

const postDeleteGroup = async (data) => {
    const response = await fetch('http://localhost:5000/api/group/delete', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to delete time-group.')
    }

    return response.json();
}

export function useDeleteGroup() {
    const queryClient = useQueryClient();
    const miniPagesContext = useContext(MiniPagesContext);
    const {deleteGroups} = useHandleDeleteGroups();

    return useMutation({
        mutationFn: postDeleteGroup,
        onSuccess: (data, requestObject) => {
            // if needed fill in according to change category
            // deleteGroups(requestObject.groupIds, )
        }
    })
}