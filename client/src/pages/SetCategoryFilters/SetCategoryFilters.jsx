import React, { useContext, useRef } from "react";
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import { MiniPagesContext } from "../../context/MiniPagesContext";
import styles from "./SetCategoryFilters.module.scss";
import { ComponentCommunicationContext } from "@/context/ComponentCommunicationContext";
import { useNavBar } from "@/components/bars/NavBar/useNavBar";
import CategorySelector from "@/components/bars/NavBar/CategoryButton/CategorySelector";
import { TbInbox } from "react-icons/tb";

const SetCategoryFilters = ({ index, length, id }) => {
  const miniPagesContext = useContext(MiniPagesContext);
  const headerRef = useRef(null);

  const { toggleSelectedCategory, toggleSelectedSubCategory, categories, subCategories, toggleAllSelected } = useNavBar();
  const componentCommunicationContext = useContext(ComponentCommunicationContext)

  const handleSave = () => {
    miniPagesContext.dispatch({ type: "REMOVE_PAGE", payload: "" });
  };

  return (
    <MiniPageContainer
      onClickSave={handleSave}
      index={index}
      length={length}
      collapsedFocusedElement={headerRef}
    >
      <div className={styles.header} ref={headerRef}>
        Set category filters
      </div>
      <div className={styles.menu}>
        <button onClick={toggleAllSelected} className={`${styles.allSelected} ${componentCommunicationContext.state.filters.length === 0 ? styles.categorySelected : ""}`}>
          <span><TbInbox /></span>
          <span>All</span>
        </button>
        {categories?.map((category) => (
          <CategorySelector
            type="mobile"
            key={category._id}
            category={category}
            categoryClicked={() => toggleSelectedCategory(category)}
            selected={componentCommunicationContext.state.filters.find((filter) => filter._id === category._id)}
            subCategories={subCategories?.filter((subCategory) => subCategory.parent === category._id)}
            subCategoryClicked={(subCategory) => toggleSelectedSubCategory(subCategory)}
          />
        ))}
        <div className={styles.bottomPadding}></div>
      </div>
    </MiniPageContainer>
  );
};

export default SetCategoryFilters;
