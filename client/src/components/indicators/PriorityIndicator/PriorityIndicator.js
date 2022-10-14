import styles from './PriorityIndicator.module.scss';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {useSelector} from "react-redux";

const PriorityIndicator = () => {
    // Placeholders for until I make the needed context
    const {low, high} = useSelector((state) => state.user.priorityBounds);

    return (
        <div className={`Horizontal-Flex-Container ${styles.container}`}>
            {low}
            <TrendingUpIcon />
            {high}
        </div>
    );
};

export default PriorityIndicator;
