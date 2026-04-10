
import { ComponentCommunicationContext } from "@/context/ComponentCommunicationContext"
import { useGetCategories } from "@/hooks/get-hooks/useGetCategories";
import { useGetGroups } from "@/hooks/get-hooks/useGetGroups";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useCallback, useContext } from "react";

export const useNavBar = () => {
    const { screenSize } = useScreenSize();
    const componentCommunicationContext = useContext(
        ComponentCommunicationContext
    );

    const { data: categories } = useGetCategories();
    const { data: subCategories } = useGetGroups();

    const toggleAllSelected = useCallback(() => {
        const filters = componentCommunicationContext.state.filters;

        if (filters.length === 0) {
            return;
        }

        filters.splice(0, filters.length);

        componentCommunicationContext.dispatch({
            type: "SET_TASK_FILTERS",
            payload: filters,
        });
    }, [componentCommunicationContext]);

    const toggleSelectedCategory = useCallback((category) => {
        const filters = componentCommunicationContext.state.filters;

        const filterIndex = filters.findIndex((filter) => filter._id === category._id);

        if (filterIndex === -1) {
            filters.push({ ...category, selectedSubcategories: [] });
        } else {
            filters.splice(filterIndex, 1);
        }

        componentCommunicationContext.dispatch({
            type: "SET_TASK_FILTERS",
            payload: filters,
        });
    }, [componentCommunicationContext]);

    const toggleSelectedSubCategory = useCallback((subCategory) => {
        const filters = componentCommunicationContext.state.filters;

        const categoryFilterIndex = filters.findIndex((filter) => filter._id === subCategory.parent);

        if (categoryFilterIndex === -1) {
            const category = categories.find((category) => category._id === subCategory.parent);
            filters.push({ ...category, selectedSubcategories: [subCategory] });
        } else {
            const subCategoryIndex = filters[categoryFilterIndex].selectedSubcategories.findIndex((s) => s._id === subCategory._id);

            if (subCategoryIndex === -1) {
                filters[categoryFilterIndex].selectedSubcategories.push(subCategory);
            } else {
                filters[categoryFilterIndex].selectedSubcategories.splice(subCategoryIndex, 1);
            }
        }

        componentCommunicationContext.dispatch({
            type: "SET_TASK_FILTERS",
            payload: filters,
        });
    }, [componentCommunicationContext]);

    const settingsClicked = () => {
        // TODO: create settings minipage
    }

    return {
        toggleAllSelected,
        toggleSelectedCategory,
        toggleSelectedSubCategory,
        settingsClicked,
        categories,
        subCategories
    }
}