import {useDispatch, useSelector} from "react-redux";
import {removeGroup} from "../state/groupsSlice";
import {removeCategory} from "../state/categoriesSlice";
import {setTaskCategory} from "../state/tasksSlice";

export function useSafeDeleteCategory(category) {
    const dispatch = useDispatch();

    const groups = useSelector(selectorState => selectorState?.groups.groups).filter(group => group.parent === category.id);
    const tasks = useSelector(selectorState => selectorState?.tasks.tasks).filter(task => task.category === category.id);

    const safeDeleteCategory = () => {
        // Remove all the children groups
        groups.map(group => dispatch(removeGroup(group.id)));

        // Set category to null for all children tasks
        tasks.map(task => dispatch(setTaskCategory({id: task.id, value: null})));

        // Finally delete the category
        dispatch(removeCategory(category.id));
    }

    return {safeDeleteCategory}
}