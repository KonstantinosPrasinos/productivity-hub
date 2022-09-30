import React, {useContext} from 'react';
import NewTask from "../../../pages/NewTask/NewTask";
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {AnimatePresence} from 'framer-motion'

const MiniPagesHandler = () => {
    const miniPagesContext = useContext(MiniPagesContext);

    const renderPage = (page, index) => {
        switch (page) {
            case 'new-task':
                return (<NewTask key={index} index={index} length={miniPagesContext.state.length} />)
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
