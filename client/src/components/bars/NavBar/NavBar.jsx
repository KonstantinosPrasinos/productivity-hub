import { useContext, useMemo, useState } from "react";
import styles from "./NavBar.module.scss";
import { TbChevronDown, TbChevronUp, TbInbox, TbPoint, TbRepeat, TbSettings } from "react-icons/tb";
import { AnimatePresence, motion } from "framer-motion";
import { ComponentCommunicationContext } from "@/context/ComponentCommunicationContext";
import { useNavBar } from "./useNavBar";

/**
 * @param {{
 *   categoryClicked?: () => void,
 *   selected: boolean | any,
 *   category: any,
 *   subCategories?: any[],
 *   subCategoryClicked?: (subCategory: any) => void
 * }} props
 */
const CategoryButton = ({ categoryClicked = () => { }, selected, category, subCategories = [], subCategoryClicked = () => { } }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = (event) => {
    event.stopPropagation();
    setExpanded(!expanded);
  }

  const subCategoryVariants = useMemo(() => ({
    open: { opacity: 1, height: "auto" },
    collapsed: { opacity: 0, height: 0 }
  }), []);

  return <motion.div layout className={`${styles.categoryContainer} ${selected && (selected?.selectedSubcategories.length === 0 || selected?.selectedSubcategories.length === subCategories.length) ? styles.categorySelected : ""}`} key={category._id}>
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

const NavBar = () => {
  const { toggleAllSelected, toggleSelectedCategory, toggleSelectedSubCategory, settingsClicked, categories, subCategories } = useNavBar();
  const componentCommunicationContext = useContext(
    ComponentCommunicationContext,
  );

  return <div className={styles.container}>
    <button onClick={toggleAllSelected} className={`${styles.allSelected} ${componentCommunicationContext.state.filters.length === 0 ? styles.categorySelected : ""}`}>
      <span><TbInbox /></span>
      <span>All</span>
    </button>
    <div className={styles.divider}></div>
    <div className={styles.categoriesContainer}>
      {categories?.map((category) => (
        <CategoryButton
          key={category._id}
          category={category}
          categoryClicked={() => toggleSelectedCategory(category)}
          selected={componentCommunicationContext.state.filters.find((filter) => filter._id === category._id)}
          subCategories={subCategories?.filter((subCategory) => subCategory.parent === category._id)}
          subCategoryClicked={(subCategory) => toggleSelectedSubCategory(subCategory)}
        />
      ))}
    </div>
    <div className={styles.spacer}></div>
    <div className={styles.settingsContainer}>
      <motion.button
        onClick={settingsClicked}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 1.0 }}
        className={styles.settingsButton}
      ><TbSettings /></motion.button>
    </div>
  </div>
}

export default NavBar;