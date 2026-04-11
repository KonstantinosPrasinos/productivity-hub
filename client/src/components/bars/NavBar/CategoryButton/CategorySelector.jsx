import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { TbChevronUp, TbChevronDown, TbRepeat, TbPoint } from "react-icons/tb";
import styles from "./CategorySelector.module.scss";

/**
 * @param {{
 *   categoryClicked?: () => void,
 *   selected: boolean | any,
 *   category: any,
 *   subCategories?: any[],
 *   subCategoryClicked?: (subCategory: any) => void
 *   type?: "desktop" | "mobile"
 * }} props
 */
const CategorySelector = ({ categoryClicked = () => { }, selected, category, subCategories = [], subCategoryClicked = () => { }, type = "desktop" }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = (event) => {
        event.stopPropagation();
        setExpanded(!expanded);
    }

    const subCategoryVariants = useMemo(() => ({
        open: { opacity: 1, height: "auto" },
        collapsed: { opacity: 0, height: 0 }
    }), []);

    return <motion.div layout className={`${styles.categoryContainer} ${type === "mobile" ? styles.mobileCategoryContainer : styles.desktopCategoryContainer} ${selected && (selected?.selectedSubcategories.length === 0 || selected?.selectedSubcategories.length === subCategories.length) ? styles.categorySelected : ""}`} key={category._id}>
        <div className={styles.categoryButton} onClick={categoryClicked}>
            <span className={`${styles.categoryDot} ${category.color}`} ></span>
            <span className={styles.categoryTitle}>{category.title}</span>
            <div className={styles.spacer}></div>
            {subCategories.length > 0 && <button className={styles.categoryIcon} onClick={toggleExpanded}>{expanded ? <TbChevronUp /> : <TbChevronDown />}</button>}
        </div>
        <AnimatePresence initial={false}>
            {expanded && (
                <motion.div
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={subCategoryVariants}
                    style={{ overflow: "hidden" }}
                >
                    {subCategories.map((subCategory) => (
                        <button key={subCategory._id} className={`${styles.subCategoryButton} ${selected && selected?.selectedSubcategories.includes(subCategory) ? styles.categorySelected : ""}`} onClick={() => subCategoryClicked(subCategory)}>
                            <span className={styles.subCategoryIcon}>{subCategory?.repeatRate?.startingDate.length > 0 ? <TbRepeat /> : <TbPoint />}</span>
                            <span className={styles.subCategoryTitle}>{subCategory.title}</span>
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
}

export default CategorySelector;