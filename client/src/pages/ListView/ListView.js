import React from 'react';
import Task from "../../components/indicators/Task/Task";
import {AnimatePresence} from "framer-motion";
import {useRenderTasks} from "../../hooks/useRenderTasks";
import styles from './ListView.module.scss';
import CollapsibleContainer from "../../components/utilities/CollapsibleContainer/CollapsibleContainer";
import {useSelector} from "react-redux";

const ListView = () => {
    const {completedTasks, incompleteTasks} = useRenderTasks(true);
    const categories = useSelector(state => state?.categories.categories);
    const groups = useSelector(state => state?.groups.groups);

    return (
        <div className={`Horizontal-Flex-Container ${styles.container}`}>
            <div className={`Stack-Container ${styles.leftSide}`}>
                <AnimatePresence>
                    {incompleteTasks.map((task) => task.hasOwnProperty('timeGroup') ?
                        (<Task key={task.id} tasks={[task]}></Task>) :
                        (<Task key={task.tasks[0].id} tasks={task.tasks}></Task>)
                    )}
                </AnimatePresence>
                {completedTasks.length > 0 && <CollapsibleContainer label={'Completed'}>
                    <AnimatePresence>
                        {completedTasks.map((task) => task.hasOwnProperty('timeGroup') ?
                            (<Task key={task.id} tasks={[task]}></Task>) :
                            (<Task key={task.tasks[0].id} tasks={task.tasks}></Task>)
                        )}
                    </AnimatePresence>
                </CollapsibleContainer>}
            </div>
            <div className={`Stack-Container ${styles.rightSide}`}>
                {categories?.length > 0 ? (
                    categories.map(category => {
                        const categoryGroups = groups.filter(group => group.parent === category.id);

                        return (
                            <div className={'Rounded-Container Stack-Container'}>
                                <div className={'Title'}>{category.title}</div>
                                {categoryGroups.length > 0 && <ul>
                                    {categoryGroups.map(group => <li>{group.title}</li>)}
                                </ul>}
                            </div>
                        )
                    })
                ) : <div>No categories</div>}
            </div>
        </div>
    );
};

export default ListView;
