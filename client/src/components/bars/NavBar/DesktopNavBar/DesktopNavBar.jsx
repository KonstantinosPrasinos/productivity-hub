import { ComponentCommunicationContext } from "@/context/ComponentCommunicationContext";
import { AnimatePresence, motion } from "framer-motion"
import { useContext } from "react";
import { TbInbox, TbSettings } from "react-icons/tb";
import { useNavBar } from "../useNavBar";
import styles from "./DesktopNavBar.module.scss";
import CategorySelector from "../CategoryButton/CategorySelector";
import { MiniPagesContext } from "@/context/MiniPagesContext";

const DesktopNavBar = () => {
    const { toggleAllSelected, toggleSelectedCategory, toggleSelectedSubCategory, settingsClicked, categories, subCategories } = useNavBar();
    const componentCommunicationContext = useContext(
        ComponentCommunicationContext,
    );
    const miniPagesContext = useContext(MiniPagesContext);

    return <div className={styles.container}>
        <button onClick={toggleAllSelected} className={`${styles.allSelected} ${componentCommunicationContext.state.filters.length === 0 ? styles.categorySelected : ""}`}>
            <span><TbInbox /></span>
            <span>All</span>
        </button>
        <div className={styles.divider}></div>
        <div className={styles.categoriesContainer}>
            {categories?.map((category) => (
                <CategorySelector
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

export default DesktopNavBar;