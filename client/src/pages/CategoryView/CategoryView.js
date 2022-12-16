import React, {useContext, useState} from 'react';
import MiniPageContainer from "../../components/containers/MiniPagesContainer/MiniPageContainer";
import Divider from "../../components/utilities/Divider/Divider";
import EditIcon from '@mui/icons-material/Edit';
import IconButton from "../../components/buttons/IconButton/IconButton";
import Button from "../../components/buttons/Button/Button";
import Chip from "../../components/buttons/Chip/Chip";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './CategoryView.module.scss';
import {useGetGroups} from "../../hooks/get-hooks/useGetGroups";
import CollapsibleContainer from "../../components/containers/CollapsibleContainer/CollapsibleContainer";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import {useDeleteCategory} from "../../hooks/change-hooks/useDeleteCategory";

const CategoryView = ({index, length, category}) => {
    const miniPagesContext = useContext(MiniPagesContext);

    const {data: unfilteredGroups} = useGetGroups();

    const groups = unfilteredGroups?.filter(group => group.parent === category._id);

    const [selectedGroup, setSelectedGroup] = useState();
    const [deletePromptVisible, setDeletePromptVisible] = useState(false);
    const {mutate: deleteCategory} = useDeleteCategory();

    // const [selectedGraph, setSelectedGraph] = useState('Average');
    // const graphOptions = ['Average', 'Total'];
    //
    // const [date, setDate] = useState(new Date);

    // const addToMonth = (adder) => {
    //     const newDate = new Date(date.getTime());
    //     newDate.setMonth(newDate.getMonth() + adder);
    //
    //     setDate(newDate);
    // }

    const handleDeleteButton = () => {
        setDeletePromptVisible(current => !current);
    }

    const handleCancelButton = () => {
        setDeletePromptVisible(false);
    }

    const handleDeleteWithTasks = () => {
        deleteCategory({categoryId: category._id, deleteTasks: true});
        miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''});
    }

    const handleDeleteWithoutTasks = () => {
        deleteCategory({categoryId: category._id, deleteTasks: false});
        miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''});
    }

    return (
        <MiniPageContainer
            index={index}
            length={length}
        >
            <section className={`Horizontal-Flex-Container Space-Between`}>
                <div className={'Horizontal-Flex-Container'}>
                    <div className={`${styles.dot} ${category.color}`}></div>
                    <div className={'Title'}>{category.title}</div>
                </div>
                <div>
                    <IconButton onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'new-category', id: category.id}})}><EditIcon /></IconButton>
                    <IconButton onClick={handleDeleteButton}><DeleteIcon /></IconButton>
                </div>
            </section>
            <CollapsibleContainer hasBorder={false} isVisible={deletePromptVisible}>
                <InputWrapper label={"Are you sure?\n(this will also delete this category's groups)"} type={"vertical"}>
                    <Button filled={false} onClick={handleDeleteWithTasks}>Yes (delete tasks)</Button>
                    <Button filled={false} onClick={handleDeleteWithoutTasks}>Yes (keep tasks)</Button>
                    <Button onClick={handleCancelButton}>Cancel</Button>
                </InputWrapper>
            </CollapsibleContainer>
            <Divider />
            <section className={'Grid-Container Two-By-Two'}>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>Current Streak</div>
                    <div>2 days</div>
                    <div className={'Label'}>Since: 05/10/2022</div>
                </div>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>Best Streak</div>
                    <div>2 days</div>
                    <div className={'Label'}>Ended at: 05/10/2022</div>
                </div>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>Total</div>
                    <div>2 days</div>
                    <div className={'Label'}>Since: 05/10/2022</div>
                </div>
                <div className={'Rounded-Container Stack-Container'}>
                    <div className={'Label'}>Unfilled Days</div>
                    <div>2 days</div>
                    <div className={'Label'}>Ended at: 05/10/2022</div>
                </div>
            </section>
            <Divider />
            <section className={'Horizontal-Flex-Container'}>
                {groups.map(group => <Chip key={group.id} value={group.title} selected={selectedGroup} setSelected={setSelectedGroup}>
                    {group.title}
                </Chip>)}
            </section>
            {/*<section className={'Stack-Container'}>*/}
            {/*    <div className={'Horizontal-Flex-Container'}>*/}
            {/*        {graphOptions.map((option, index) => (*/}
            {/*            <Chip*/}
            {/*                selected={selectedGraph}*/}
            {/*                setSelected={setSelectedGraph}*/}
            {/*                value={option}*/}
            {/*                key={index}*/}
            {/*            >*/}
            {/*                {option}*/}
            {/*            </Chip>*/}
            {/*        ))}*/}
            {/*    </div>*/}
            {/*    <div className={'Horizontal-Flex-Container Space-Between'}>*/}
            {/*        <IconButton onClick={() => addToMonth(-1)}>*/}
            {/*            <ArrowBackIosIcon />*/}
            {/*        </IconButton>*/}
            {/*        <div>*/}
            {/*            {`${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`}*/}
            {/*        </div>*/}
            {/*        <IconButton onClick={() => addToMonth(1)}>*/}
            {/*            <ArrowForwardIosIcon />*/}
            {/*        </IconButton>*/}
            {/*    </div>*/}
            {/*</section>*/}
            <section className={'Horizontal-Flex-Container Space-Between'}>
                <Button filled={false} size={'small'}>
                    See all entries
                </Button>
                <div className={'Label'}>
                    Created at: 02/10/2022
                </div>
            </section>
        </MiniPageContainer>
    );
};

export default CategoryView;
