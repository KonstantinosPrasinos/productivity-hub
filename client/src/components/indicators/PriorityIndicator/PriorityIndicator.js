import styles from './PriorityIndicator.module.scss';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const PriorityIndicator = () => {
    // Placeholders for until I make the needed context
    const low = 1;
    const high = 10;

    return (
        <div className={`Horizontal-Flex-Container ${styles.container}`}>
            {low}
            <TrendingUpIcon />
            {high}
        </div>
    );
};

export default PriorityIndicator;
