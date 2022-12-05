import React, {useContext, useState} from 'react';
import Task from "../../components/indicators/Task/Task";
import {AnimatePresence, motion} from "framer-motion";
import {useRenderTasks} from "../../hooks/useRenderTasks";
import styles from './ListView.module.scss';
import {MiniPagesContext} from "../../context/MiniPagesContext";
import {ScreenSizeContext} from "../../context/ScreenSizeContext";
import SwitchContainer from "../../components/utilities/SwitchContainer/SwitchContainer";
import Chip from "../../components/buttons/Chip/Chip";
import {useGetCategories} from "../../hooks/get-hooks/useGetCategories";
import {useGetGroups} from "../../hooks/get-hooks/useGetGroups";

const ListView = () => {
    const miniPagesContext = useContext(MiniPagesContext);
    const screenSizeContext = useContext(ScreenSizeContext);
    const {data, isLoading} = useRenderTasks(false);
    const {isLoading: categoriesLoading, data: categories} = useGetCategories();
    const {isLoading: groupsLoading, data: groups} = useGetGroups();

    const chipOptions = ['Tasks', 'Categories'];
    const [selectedSection, setSelectedSection] = useState('Tasks');

    const renderTasks = () => (<div className={`Centered Stack-Container ${styles.leftSide}`}>
        <AnimatePresence initial={false} exitBeforeEnter>
            {data !== false && !isLoading && data.map((task) => !task.hasOwnProperty('tasks') ? (
                <Task key={task._id} tasks={[task]}></Task>) : (
                <Task key={task.tasks[0].id} tasks={task.tasks}></Task>))}
            {data !== false && !isLoading && data.length === 0 && <motion.div
                initial={{opacity: 0, y: 50, scale: 0.3}}
                animate={{opacity: 1, y: 0, scale: 1}}
                exit={{opacity: 0, scale: 0.5, transition: {duration: 0.2}}}
                className={`Empty-Indicator-Container`}
            >
                No tasks
            </motion.div>}
        </AnimatePresence>
    </div>)

    const renderCategories = () => (<div className={`Stack-Container Centered ${styles.rightSide}`}>
        <AnimatePresence initial={false} exitBeforeEnter>
            {categories?.length > 0 ? (categories.map(category => {
                const categoryGroups = groups?.filter(group => group.parent === category.id);

                return (<motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    layout

                    className={`Rounded-Container Stack-Container ${styles.categoryContainer}`}
                    key={category.id}
                    onClick={() => {
                        miniPagesContext.dispatch({
                            type: 'ADD_PAGE', payload: {type: 'category-view', id: category.id}
                        })
                    }}
                >
                    <div className={'Horizontal-Flex-Container'}>
                        <div className={`${category.color} ${styles.categoryCircle}`}></div>
                        <div className={'Title'}>{category.title}</div>
                    </div>
                    {categoryGroups.length > 0 && <ul>
                        {categoryGroups.map((group, index) => <li key={index}>{group.title}</li>)}
                    </ul>}
                </motion.div>)
            })) : <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                className={`Empty-Indicator-Container`}
                layout
            >
                No categories
            </motion.div>}
        </AnimatePresence>
    </div>)

    const renderSwitchComponent = () => (
        <div className={`Stack-Container ${styles.mobileView}`}>
            <SwitchContainer selectedTab={chipOptions.indexOf(selectedSection)}>
                {renderTasks()}
                {renderCategories()}
            </SwitchContainer>
        </div>
    )

    return (<div className={`${screenSizeContext.state !== 'small' ? 'Horizontal-Flex-Container' : 'Stack-Container'} ${styles.container}`}>
        {screenSizeContext.state === 'small' &&
            <div className={`Horizontal-Flex-Container Space-Between ${styles.selectionBar}`}>
                {chipOptions.map((chip, index) => <Chip size={'big'} key={index} selected={selectedSection} setSelected={setSelectedSection} value={chip}>{chip}</Chip>)}
            </div>
        }
            {screenSizeContext.state !== 'small' ? renderTasks() : renderSwitchComponent()}
            {screenSizeContext.state !== 'small' && renderCategories()}
        </div>);
};

export default ListView;
