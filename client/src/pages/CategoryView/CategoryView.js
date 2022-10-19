import React, {useContext, useState} from 'react';
import MiniPageContainer from "../../components/utilities/MiniPagesContainer/MiniPageContainer";
import {useDispatch, useSelector} from "react-redux";
import Divider from "../../components/utilities/Divider/Divider";
import EditIcon from '@mui/icons-material/Edit';
import IconButton from "../../components/buttons/IconButton/IconButton";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Button from "../../components/buttons/Button/Button";
import Chip from "../../components/buttons/Chip/Chip";
import {MiniPagesContext} from "../../context/MiniPagesContext";
import DeleteIcon from '@mui/icons-material/Delete';
import {removeCategory} from "../../state/categoriesSlice";
import styles from './CategoryView.module.scss';

const CategoryView = ({index, length, category}) => {
    const dispatch = useDispatch();
    const miniPagesContext = useContext(MiniPagesContext);

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

    const handleDelete = () => {
        miniPagesContext.dispatch({type: 'REMOVE_PAGE', payload: ''});
        dispatch(removeCategory(category));
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
                    <IconButton onClick={() => miniPagesContext.dispatch({type: 'ADD_PAGE', payload: {type: 'new-category', id: category.title}})}><EditIcon /></IconButton>
                    <IconButton onClick={handleDelete}><DeleteIcon /></IconButton>
                </div>
            </section>
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
