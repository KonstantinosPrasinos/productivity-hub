import React, {useContext} from 'react';
import NewTask from "../../../pages/NewTask/NewTask";
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {AnimatePresence} from 'framer-motion'
import NewCategory from "../../../pages/NewCategory/NewCategory";
import TaskView from "../../../pages/TaskView/TaskView";
import {useSelector} from "react-redux";

const MiniPagesHandler = () => {
    const miniPagesContext = useContext(MiniPagesContext);
    const tasks = useSelector((state) => state?.tasks.tasks);

    const renderPage = (page, index) => {
        switch (page.type) {
            case 'new-task':
                return (<NewTask key={index} index={index} length={miniPagesContext.state.length} />)
            case 'new-category':
                return (<NewCategory key={index} index={index} length={miniPagesContext.state.length} />)
            case 'task-view':
                return (<TaskView key={index} index={index} length={miniPagesContext.state.length} task={tasks.find(task => task.id === page.id)} />)
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
