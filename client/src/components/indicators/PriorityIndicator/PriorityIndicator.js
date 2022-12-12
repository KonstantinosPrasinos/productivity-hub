import styles from './PriorityIndicator.module.scss';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {useGetSettings} from "../../../hooks/get-hooks/useGetSettings";

const PriorityIndicator = () => {
    const {data: settings} = useGetSettings();

    return (
        <div className={`Horizontal-Flex-Container ${styles.container}`}>
            {settings.priorityBounds.low}
            <TrendingUpIcon />
            {settings.priorityBounds.high}
        </div>
    );
};

export default PriorityIndicator;
