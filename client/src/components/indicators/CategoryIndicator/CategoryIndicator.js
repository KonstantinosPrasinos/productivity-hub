import styles from './CategoryIndicator.module.scss';
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {useContext} from "react";

const CategoryIndicator = ({category, group}) => {
    const miniPagesContext = useContext(MiniPagesContext);

    return (
        <button
            className={`${styles.container} Horizontal-Flex-Container ${category.color}`}
            onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'category-view', id: category.title}})}
        >
            <div className={styles.text}>{category}</div>
            {group && <div>|</div>}
            {group && <div className={styles.text}>{group.title}</div>}
        </button>
    );
};

export default CategoryIndicator;
