import { useCallback, useContext, useMemo } from "react";
import { ComponentCommunicationContext } from "@/context/ComponentCommunicationContext";
import { MiniPagesContext } from "@/context/MiniPagesContext";

export const useMobileNavBar = () => {
    const miniPagesContext = useContext(MiniPagesContext);
    const componentCommunicationContext = useContext(ComponentCommunicationContext);

    const setSearchFilter = (value) => {
        componentCommunicationContext.dispatch({
            type: "SET_SEARCH_QUERY",
            payload: value,
        });
    };

    const navBarVisible = useMemo(() => {
        return miniPagesContext.state.length === 0 || miniPagesContext.state[miniPagesContext.state.length - 1].type === "set-category-filters";
    }, [miniPagesContext.state]);

    const navBarExpanded = useMemo(() => {
        return miniPagesContext.state.length > 0 && miniPagesContext.state[miniPagesContext.state.length - 1].type === "set-category-filters";
    }, [miniPagesContext.state]);

    const handleCreateClick = useCallback(() => {
        miniPagesContext.dispatch({
            type: "ADD_PAGE",
            payload: { type: "new-task" },
        });
    }, [miniPagesContext]);

    const handleMenuClick = useCallback(() => {
        if (miniPagesContext.state.length > 0 && miniPagesContext.state[miniPagesContext.state.length - 1].type === "set-category-filters") {
            miniPagesContext.dispatch({
                type: "REMOVE_PAGE",
                payload: "",
            });
        } else {
            miniPagesContext.dispatch({
                type: "ADD_PAGE",
                payload: { type: "set-category-filters" },
            });
        }
    }, [miniPagesContext]);

    const settingsClicked = () => {
        miniPagesContext.dispatch({
            type: "ADD_PAGE",
            payload: { type: "settings" },
        });
    };

    return {
        searchQuery: componentCommunicationContext.state.searchQuery,
        setSearchFilter,
        navBarVisible,
        navBarExpanded,
        handleCreateClick,
        handleMenuClick,
        settingsClicked
    };
};
