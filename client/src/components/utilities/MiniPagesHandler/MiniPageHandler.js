import React, {useContext} from 'react';
import NewTask from "../../../pages/NewTask/NewTask";
import {MiniPagesContext} from "../../../context/MiniPagesContext";
import {AnimatePresence} from 'framer-motion'

const MiniPagesHandler = () => {
    const miniPagesContext = useContext(MiniPagesContext);

    const renderPage = (page, id) => {
        switch (page) {
            case 'new-task':
                return (<NewTask key={id} />)
            default: return ''
        }
    }

    return (
        <AnimatePresence>
            {miniPagesContext.state.length > 0 &&
                miniPagesContext.state.map((page, id) => miniPagesContext.state[miniPagesContext.state.length-1].id === page.id &&
                    renderPage(page, id)
                )}
        </AnimatePresence>
    );
};

export default MiniPagesHandler;
