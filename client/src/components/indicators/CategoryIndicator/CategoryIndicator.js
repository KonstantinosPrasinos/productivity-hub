import styles from './CategoryIndicator.module.scss';
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {useContext} from "react";

const CategoryIndicator = ({category, group, color, categoryId}) => {
    const miniPagesContext = useContext(MiniPagesContext);

    return (
        <button
            className={`${styles.container} Horizontal-Flex-Container ${color}`}
            onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'category-view', id: categoryId}})}
        >
            <div>{category}</div>
            {group && <div>|</div>}
            {group && <div>{group}</div>}
        </button>
    );
};

export default CategoryIndicator;
