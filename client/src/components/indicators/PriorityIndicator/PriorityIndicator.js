import styles from './PriorityIndicator.module.scss';
import {useGetSettings} from "../../../hooks/get-hooks/useGetSettings";
import {TbTrendingUp} from "react-icons/tb";

const PriorityIndicator = () => {
    const {data: settings} = useGetSettings();

    return (
        <div className={`Horizontal-Flex-Container ${styles.container}`}>
            {settings.priorityBounds.low}
            <TbTrendingUp />
            {settings.priorityBounds.high}
        </div>
    );
};

export default PriorityIndicator;
