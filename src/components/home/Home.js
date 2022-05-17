import GroupCard from './GroupCard';
import CategoriesTracker from './CategoriesTracker';

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate} from 'react-router-dom';

import { setSelectedGroup } from '../../app/uiSlice';

const Home = () => {
    const groups = useSelector((state) => state.content.groups);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const renderCards = () => {
        return groups.map(group => {
            return <GroupCard group={group.id} key={group.id}></GroupCard>
        })
    }
    
    const renderNoGroups = () => {
        return (<div className='title' onClick={() => {dispatch(setSelectedGroup(null)); navigate('/groups/new')}}>
            <div className='new-list'>Add new +</div>
        </div>)
    }

    return (
        <div className='home'>
            <div className="groups">
                <div className="groups-container">
                    {groups.length !== 0 ? renderCards() : renderNoGroups()}
                </div>
            </div>
            <div className="graphs">
                <CategoriesTracker />
            </div>
        </div>
    );
}
 
export default Home;