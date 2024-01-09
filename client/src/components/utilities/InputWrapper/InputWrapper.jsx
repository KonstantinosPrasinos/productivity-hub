import styles from './InputWrapper.module.scss'
import Tooltip from "@/components/utilities/Tooltip/Tooltip.jsx";
import PropTypes from "prop-types";

const InputWrapper = ({children, label, type, hasPadding = true, tooltipMessage}) => {
    return <div className={`Stack-Container ${styles.container} ${hasPadding ? styles.hasPadding : ""}`}>
        {
            label &&
            <div className={"Horizontal-Flex-Container"}>
                <div className='Label'>{label}</div>
                {tooltipMessage && <Tooltip message={tooltipMessage} />}
            </div>
        }
        <div className={`${type === 'vertical' ? 'Stack-Container' : 'Horizontal-Flex-Container'} ${styles.inputContainer}`}>{children}</div>
    </div>;
}

InputWrapper.propTypes = {
    tooltipMessage: PropTypes.string,
    label: PropTypes.string,
    hasPadding: PropTypes.bool,
    type: PropTypes.oneOf(["vertical", "horizontal"])
}
 
export default InputWrapper;