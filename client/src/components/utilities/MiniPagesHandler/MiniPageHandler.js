import React, {useContext} from 'react';
import NewTask from "../../../pages/NewTask/NewTask";
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {AnimatePresence} from 'framer-motion'
import NewCategory from "../../../pages/NewCategory/NewCategory";
import TaskView from "../../../pages/TaskView/TaskView";
import {useSelector} from "react-redux";
import CategoryView from "../../../pages/CategoryView/CategoryView";

const MiniPagesHandler = () => {
    const miniPagesContext = useContext(MiniPagesContext);
    const tasks = useSelector((state) => state?.tasks.tasks);
    const categories = useSelector(state => state?.categories.categories);

    const renderPage = (page, index) => {
        switch (page.type) {
            case 'new-task':
                return (<NewTask key={index} index={index} length={miniPagesContext.state.length} id={page.id} />)
            case 'new-category':
                return (<NewCategory key={index} index={index} length={miniPagesContext.state.length} id={page.id} />)
            case 'task-view':
                return (<TaskView key={index} index={index} length={miniPagesContext.state.length} task={tasks.find(task => task._id === page.id)} />)
            case 'category-view':
                return (<CategoryView key={index} index={index} length={miniPagesContext.state.length} category={categories.find(category => category.id === page.id)} />)
            default: return ''
        }
    }

    return (
        <AnimatePresence>
            {miniPagesContext.state.length > 0 && miniPagesContext.state.map((page, index) => renderPage(page, index))}
        </AnimatePresence>
    );
};

export default MiniPagesHandler;
