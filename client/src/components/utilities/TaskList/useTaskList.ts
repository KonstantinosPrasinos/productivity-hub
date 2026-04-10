import { ComponentCommunicationContext } from "@/context/ComponentCommunicationContext";
import { useGetCategories } from "@/hooks/get-hooks/useGetCategories";
import { useGetGroups } from "@/hooks/get-hooks/useGetGroups";
import { useScreenSize } from "@/hooks/useScreenSize";
import type { Task } from "@/types/Task";
import { useContext, useMemo } from "react";


export function useTaskList(tasks: Task[] = []) {
    const { data: categories } = useGetCategories();
    const { data: subCategories } = useGetGroups();
    const { screenSize } = useScreenSize();
    const componentCommunicationContext = useContext(
        ComponentCommunicationContext,
    );

    const toggleSearchVisibility = () => {
        componentCommunicationContext.dispatch({
            type: "SET_SEARCH_SCREEN_VISIBLE",
            payload: !componentCommunicationContext.state.searchScreenVisible,
        });
    };

    const setSearchFilter = (value: string) => {
        componentCommunicationContext.dispatch({
            type: "SET_SEARCH_QUERY",
            payload: value,
        });
    }

    const setCategoryFilter = (value: any) => {
        componentCommunicationContext.dispatch({
            type: "SET_TASK_FILTERS",
            payload: value,
        });
    };

    const filteredTasks = useMemo(() => {
        if (
            componentCommunicationContext.state.filters.length == 0 &&
            componentCommunicationContext.state.searchQuery.length === 0
        )
            return tasks;

        return tasks.reduce((reducedTasks: Task[], currentTask: Task) => {
            if (currentTask.hasOwnProperty("tasks") && currentTask.tasks) {
                const matchesCategory =
                    componentCommunicationContext.state.filters.length === 0 ||
                    componentCommunicationContext.state.filters.find(
                        (tempFilter) => tempFilter._id === currentTask?.tasks?.[0]?.category
                    );

                const matchesSubcategory =
                    matchesCategory === true ||
                    matchesCategory?.selectedSubcategories?.length === 0 ||
                    matchesCategory?.selectedSubcategories
                        .map((tempFilter: any) => tempFilter._id)
                        .includes(currentTask?.tasks?.[0]?.group);

                if (matchesSubcategory && matchesCategory) {
                    let taskFilteredBySearch: Task;

                    if (componentCommunicationContext.state.searchQuery.length === 0) {
                        taskFilteredBySearch = currentTask;
                    } else {
                        taskFilteredBySearch = {
                            ...currentTask,
                            tasks: currentTask.tasks.filter((tempTask) =>
                                tempTask.title
                                    .toLowerCase()
                                    .includes(componentCommunicationContext.state.searchQuery.toLowerCase()),
                            ),
                        };
                    }

                    if (taskFilteredBySearch.tasks && taskFilteredBySearch.tasks.length !== 0)
                        reducedTasks.push(taskFilteredBySearch);
                }
            } else {
                // _id of -1 is for when the "no category" option is selected. Then show all tasks with no category
                const showNoCategory =
                    componentCommunicationContext.state.filters.length === 0 ||
                    componentCommunicationContext.state.filters.some(
                        (category) => category._id === "-1",
                    );

                const matchesSearch =
                    componentCommunicationContext.state.searchQuery.length === 0 ||
                    currentTask.title.toLowerCase().includes(componentCommunicationContext.state.searchQuery.toLowerCase());

                if (showNoCategory && matchesSearch) reducedTasks.push(currentTask);
            }

            return reducedTasks;
        }, []);
    }, [componentCommunicationContext.state.filters, tasks, componentCommunicationContext.state.searchQuery]);

    return {
        filteredTasks,
        categories,
        subCategories,
        setCategoryFilter,
        setSearchFilter,
        toggleSearchVisibility,
        screenSize,
        searchScreenVisible: componentCommunicationContext.state.searchScreenVisible,
        categoryFilter: componentCommunicationContext.state.filters,
        searchQuery: componentCommunicationContext.state.searchQuery,
    }
}