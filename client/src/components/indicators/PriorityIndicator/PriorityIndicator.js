import styles from './PriorityIndicator.module.scss';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {useSelector} from "react-redux";

const PriorityIndicator = () => {
    const settings = useSelector((state) => state?.settings);
    return (
        <div className={`Horizontal-Flex-Container ${styles.container}`}>
            {settings.priorityBounds.low}
            <TrendingUpIcon />
            {settings.priorityBounds.high}
        </div>
    );
};

export default PriorityIndicator;
