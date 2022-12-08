import styles from './CategoryIndicator.module.scss';
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {useContext} from "react";
import {useGetCategories} from "../../../hooks/get-hooks/useGetCategories";
import {useGetGroups} from "../../../hooks/get-hooks/useGetGroups";

const CategoryIndicator = ({categoryId, groupId}) => {
    const miniPagesContext = useContext(MiniPagesContext);

    const {isLoading: categoriesLoading, data: categories} = useGetCategories();
    const {isLoading: groupsLoading, data: groups} = useGetGroups();

    const category = categories?.find(category => category.id === categoryId)

    let group = null;
    if (groupId) group = groups?.find(group => group.id === groupId)

    return (
        <>
            {!categoriesLoading && !groupsLoading && <button
                className={`${styles.container} Horizontal-Flex-Container ${category.color}`}
                onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'category-view', id: category.title}})}
            >
                <div className={styles.text}>{category}</div>
                {group && <div>|</div>}
                {group && <div className={styles.text}>{group.title}</div>}
            </button>}
        </>
    );
};

export default CategoryIndicator;
