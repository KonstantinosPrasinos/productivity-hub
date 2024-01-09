import styles from './CategoryIndicator.module.scss';
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {useContext, useMemo} from "react";
import {useGetCategories} from "../../../hooks/get-hooks/useGetCategories";
import {useGetGroups} from "../../../hooks/get-hooks/useGetGroups";

const CategoryIndicator = ({categoryId, groupId}) => {
    const miniPagesContext = useContext(MiniPagesContext);

    const {isLoading: categoriesLoading, data: categories} = useGetCategories();
    const {isLoading: groupsLoading, data: groups} = useGetGroups();

    const findCategory = () => {
        if (categoriesLoading) return null;

        return categories?.find(category => category._id === categoryId);
    }

    const findGroup = () => {
        if (!groupId || groupsLoading) return null;

        return groups?.find(group => group._id === groupId)
    }

    const category = useMemo(findCategory, [categoriesLoading, categories]);

    const group = useMemo(findGroup, [groupsLoading, groups]);

    const handleClick = (event) => {
        event.stopPropagation();
        miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'category-view', id: category._id}})
    }

    return (
        <>
            {category && <button
                className={`${styles.container} Horizontal-Flex-Container ${category.color}`}
                onClick={handleClick}
            >
                <div className={styles.text}>{category.title}</div>
                {group && <div>|</div>}
                {group && <div className={styles.text}>{group.title}</div>}
            </button>}
        </>
    );
};

export default CategoryIndicator;
