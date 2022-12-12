import {useDispatch} from "react-redux";
import {removeGroup} from "../state/groupsSlice";
import {removeCategory} from "../state/categoriesSlice";
import {setTaskCategory} from "../state/tasksSlice";
import {useGetTasks} from "./get-hooks/useGetTasks";
import {useGetGroups} from "./get-hooks/useGetGroups";

export function useSafeDeleteCategory(category) {
    const dispatch = useDispatch();


    const {isLoading: groupsLoading, data: unfilteredGroups} = useGetGroups();
    const {isLoading: tasksLoading, data: unfilteredTasks} = useGetTasks();

    const tasks = unfilteredTasks?.filter(task => task.category === category.id);
    const groups = unfilteredGroups?.filter(group => group.parent === category.id);

    const safeDeleteCategory = () => {
        if (tasksLoading || groupsLoading) return;
        // Remove all the children groups
        groups.map(group => dispatch(removeGroup(group.id)));

        // Set category to null for all children tasks
        tasks.map(task => dispatch(setTaskCategory({id: task._id, value: null})));

        // Finally delete the category
        dispatch(removeCategory(category.id));
    }

    return {safeDeleteCategory}
}