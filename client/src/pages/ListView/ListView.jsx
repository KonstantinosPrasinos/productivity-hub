import React, {useContext, useState} from 'react';
import Task from "../../components/indicators/Task/Task";
import {AnimatePresence, motion} from "framer-motion";
import {useRenderTasks} from "../../hooks/useRenderTasks";
import styles from './ListView.module.scss';
import {MiniPagesContext} from "../../context/MiniPagesContext";
import SwitchContainer from "../../components/containers/SwitchContainer/SwitchContainer";
import Chip from "../../components/buttons/Chip/Chip";
import {useGetCategories} from "../../hooks/get-hooks/useGetCategories";
import {useGetGroups} from "../../hooks/get-hooks/useGetGroups";
import LoadingIndicator from "../../components/indicators/LoadingIndicator/LoadingIndicator";
import {useScreenSize} from "../../hooks/useScreenSize";
import {TbPlus} from "react-icons/tb";

const ListView = () => {
    const {screenSize} = useScreenSize();
    const {data: tasks, isLoading: tasksLoading} = useRenderTasks(false);
    const {isLoading: categoriesLoading, data: categories} = useGetCategories();
    const {isLoading: groupsLoading, data: groups} = useGetGroups();

    const chipOptions = ['Tasks', 'Categories'];
    const [selectedSection, setSelectedSection] = useState('Tasks');

    const Tasks = () => {
        if (tasksLoading || categoriesLoading || groupsLoading) return <LoadingIndicator />

        return (<div className={`Stack-Container ${styles.leftSide}`}>
            {tasks.length > 0 && tasks.map((task) => !task.hasOwnProperty('tasks') ? (
                <Task key={task._id} tasks={[task]}></Task>) : (
                <Task key={task.tasks[0]._id} tasks={task.tasks}></Task>
            ))}
            {tasks.length === 0 &&
                <motion.div
                    initial={{opacity: 0, y: 50, scale: 0.3}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    exit={{opacity: 0, scale: 0.5, transition: {duration: 0.2}}}
                    className={`Empty-Indicator-Container`}
                >
                    No tasks
                </motion.div>
            }
        </div>)
    }

    const Categories = () => {
        const miniPagesContext = useContext(MiniPagesContext);

        if (categoriesLoading || groupsLoading) return <LoadingIndicator />

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
            <div className={`Stack-Container ${styles.rightSide}`}>
                {categories?.length > 0 && (categories.map(category => {
                    const categoryGroups = groups?.filter(group => group.parent === category._id);

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.3 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            layout

                            className={`Rounded-Container Stack-Container ${styles.categoryContainer}`}
                            key={category._id}
                            onClick={() => handleCategoryClick(category._id)}
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
                <motion.button
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className={`Empty-Indicator-Container`}
                    layout
                    onClick={handleNewCategoryClick}
                >
                    {categories.length > 0 && "Add category"}
                    {categories.length === 0 && "No categories, add one "}
                    <TbPlus />
                </motion.button>
            </div>
        )
    }

    const SwitchComponent = () => (
        <div className={`Stack-Container ${styles.mobileView}`}>
            <SwitchContainer selectedTab={chipOptions.indexOf(selectedSection)}>
                <Tasks />
                <Categories />
            </SwitchContainer>
        </div>
    )

    return (
        <motion.div
            className={`${screenSize !== 'small' ? 'Horizontal-Flex-Container' : 'Stack-Container'} ${styles.container}`}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.1}}
        >
            {screenSize === 'small' &&
                <div className={`Horizontal-Flex-Container Space-Between ${styles.selectionBar}`}>
                    {chipOptions.map((chip, index) => <Chip size={'large'} key={index} selected={selectedSection} setSelected={setSelectedSection} value={chip}>{chip}</Chip>)}
                </div>
            }
            <AnimatePresence>
                {screenSize !== 'small' ? <Tasks /> : <SwitchComponent />}
                {screenSize !== 'small' && <Categories />}
            </AnimatePresence>
        </motion.div>);
};

export default ListView;
