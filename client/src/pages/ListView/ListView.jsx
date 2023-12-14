import React, {useCallback, useContext, useState} from 'react';
import Task from "../../components/indicators/Task/Task";
import {AnimatePresence, motion} from "framer-motion";
import {useRenderTasks} from "../../hooks/render-tasks-hook/useRenderTasks";
import styles from './ListView.module.scss';
import {MiniPagesContext} from "../../context/MiniPagesContext";
import {useGetCategories} from "../../hooks/get-hooks/useGetCategories";
import {useGetGroups} from "../../hooks/get-hooks/useGetGroups";
import {useScreenSize} from "../../hooks/useScreenSize";
import {TbPlus, TbRefresh} from "react-icons/tb";
import SwitchContainer from "@/components/containers/SwitchContainer/SwitchContainer.jsx";

const CategoriesView = () => {
    const {isLoading: categoriesLoading, data: categories} = useGetCategories();
    const {isLoading: groupsLoading, data: groups} = useGetGroups();

    const miniPagesContext = useContext(MiniPagesContext);

    const handleCategoryClick = useCallback((categoryId) => {
        miniPagesContext.dispatch({
            type: 'ADD_PAGE', payload: {type: 'category-view', id: categoryId}
        })
    }, []);

    const handleNewCategoryClick = useCallback(() => {
        miniPagesContext.dispatch({
            type: 'ADD_PAGE', payload: {type: 'new-category'}
        })
    }, []);
    
    return (
        <div className={`Stack-Container ${styles.rightSide}`}>
            {!categoriesLoading && !groupsLoading && <>
                <motion.button
                    className={`Empty-Indicator-Container Clickable`}
                    onClick={handleNewCategoryClick}
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    layout
                >
                    {categories.length > 0 && "Add category"}
                    {categories.length === 0 && "No categories, add one "}
                    <TbPlus/>
                </motion.button>
                <AnimatePresence>
                    {categories?.length > 0 && (categories.map(category => {
                        const categoryGroups = groups?.filter(group => group.parent === category._id);

                        return (
                            <motion.div
                                className={`Rounded-Container Has-Shadow Has-Hover Stack-Container ${styles.categoryContainer}`}
                                key={category._id}
                                onClick={() => handleCategoryClick(category._id)}
                                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                layout
                            >
                                <div className={'Horizontal-Flex-Container Space-Between'}>
                                    <div className={'Horizontal-Flex-Container'}>
                                        <div className={`${category.color} ${styles.categoryCircle}`}></div>
                                        <div className={'Title'}>{category.title}</div>
                                    </div>
                                    {category?.repeatRate?.number && <TbRefresh />}
                                </div>
                                {categoryGroups.length > 0 && <ul>
                                    {categoryGroups.map((group, index) => <li key={index}>{group.title}</li>)}
                                </ul>}
                            </motion.div>
                        )
                    }))}
                </AnimatePresence>
            </>}
        </div>
    );
}

const TasksView = () => {
    const {data: tasks, isLoading: tasksLoading} = useRenderTasks(false);
    
    return (
        <div className={`Stack-Container ${styles.leftSide}`}>
            {!tasksLoading && tasks.length === 0 &&
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className={`Empty-Indicator-Container`}
                >
                    No tasks for now
                </motion.div>
            }
            <AnimatePresence>
                {!tasksLoading && tasks.length > 0 && tasks.map((task) => !task.hasOwnProperty('tasks') ?
                    (<Task key={task._id} tasks={[task]}></Task>) :
                    (<Task key={task.tasks[0]._id} tasks={task.tasks}></Task>)
                )}
            </AnimatePresence>
        </div>
    );
}

const ListView = () => {
    const {screenSize} = useScreenSize();
    const [selectedSection, setSelectedSection] = useState(0);

    return (
        <motion.div
            className={`${screenSize !== 'small' ? 'Horizontal-Flex-Container' : 'Stack-Container'} ${styles.container}`}
        >
            {screenSize === 'small' && <>
                <div className={styles.selectionBarContainer}>
                    <div className={`${styles.selectionBar} ${selectedSection !== 0 ? styles.selection1 : ""}`}>
                        <button
                            onClick={() => setSelectedSection(0)}
                        >
                            <span>Tasks</span>
                        </button>
                        <button
                            onClick={() => setSelectedSection(1)}
                        >
                            <span>Categories</span>
                        </button>
                        {/*  Leave space for potential filter  */}
                    </div>
                </div>
                <div className={styles.smallScreenContainer}>
                    <SwitchContainer selectedTab={selectedSection}>
                        <TasksView />
                        <CategoriesView />
                    </SwitchContainer>
                </div>
            </>}
            {screenSize !== 'small' && <>
                <TasksView />
                <CategoriesView />
            </>}
        </motion.div>);
};

export default ListView;
