import styles from './CategoryIndicator.module.scss';

const CategoryIndicator = ({category, group, color}) => {

    return (
        <div className={`${styles.container} Horizontal-Flex-Container ${color}`}>
            <div>{category}</div>
            {group && <div>|</div>}
            {group && <div>{group}</div>}
        </div>
    );
};

export default CategoryIndicator;
