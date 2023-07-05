import React, {useContext, useState} from 'react';
import Task from "../../components/indicators/Task/Task";
import {AnimatePresence, motion} from "framer-motion";
import {useRenderTasks} from "../../hooks/useRenderTasks";
import styles from './ListView.module.scss';
import {MiniPagesContext} from "../../context/MiniPagesContext";
import Chip from "../../components/buttons/Chip/Chip";
import {useGetCategories} from "../../hooks/get-hooks/useGetCategories";
import {useGetGroups} from "../../hooks/get-hooks/useGetGroups";
import {useScreenSize} from "../../hooks/useScreenSize";
import {TbPlus} from "react-icons/tb";

const ListView = () => {
    const miniPagesContext = useContext(MiniPagesContext);
    const {screenSize} = useScreenSize();
    const {data: tasks, isLoading: tasksLoading} = useRenderTasks(false);
    const {isLoading: categoriesLoading, data: categories} = useGetCategories();
    const {isLoading: groupsLoading, data: groups} = useGetGroups();

    const chipOptions = ['Tasks', 'Categories'];
    const [selectedSection, setSelectedSection] = useState('Tasks');

    const handleCategoryClick = (categoryId) => {
        miniPagesContext.dispatch({
            type: 'ADD_PAGE', payload: {type: 'category-view', id: categoryId}
        })
    }

    const handleNewCategoryClick = () => {
        miniPagesContext.dispatch({
            type: 'ADD_PAGE', payload: {type: 'new-category'}
        })
    }

    return (
        <motion.div
            className={`${screenSize !== 'small' ? 'Horizontal-Flex-Container' : 'Stack-Container'} ${styles.container}`}
        >
            {screenSize === 'small' &&
                <div className={`Horizontal-Flex-Container Space-Between ${styles.selectionBar}`}>
                    {chipOptions.map((chip, index) => <Chip size={'large'} key={index} selected={selectedSection} setSelected={setSelectedSection} value={chip}>{chip}</Chip>)}
                </div>
            }
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
            {screenSize !== 'small' && <div className={`Stack-Container ${styles.rightSide}`}>
                <motion.button
                    className={`Empty-Indicator-Container Clickable`}
                    onClick={handleNewCategoryClick}
                    initial={{ opacity: 0, scale: 0.3}}
                    animate={{ opacity: 1, scale: 1}}
                    exit={{ opacity: 0, scale: 0.3}}
                    transition={{duration: 0.4, type: "spring"}}
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
                                className={`Rounded-Container Has-Shadow Stack-Container ${styles.categoryContainer}`}
                                key={category._id}
                                onClick={() => handleCategoryClick(category._id)}
                                initial={{ opacity: 0, scale: 0.3}}
                                animate={{ opacity: 1, scale: 1}}
                                exit={{ opacity: 0, scale: 0.3}}
                                transition={{duration: 0.4, type: "spring"}}
                                layout
                            >
                                <div className={'Horizontal-Flex-Container'}>
                                    <div className={`${category.color} ${styles.categoryCircle}`}></div>
                                    <div className={'Title'}>{category.title}</div>
                                </div>
                                {categoryGroups.length > 0 && <ul>
                                    {categoryGroups.map((group, index) => <li key={index}>{group.title}</li>)}
                                </ul>}
                            </motion.div>
                        )
                    }))}
                </AnimatePresence>
            </div>}

            {/*{screenSize !== 'small' ? <Tasks /> : <SwitchComponent />}*/}
            {/*<Tasks />*/}
            {/*{screenSize !== 'small' && <Categories />}*/}
        </motion.div>);
};

export default ListView;
