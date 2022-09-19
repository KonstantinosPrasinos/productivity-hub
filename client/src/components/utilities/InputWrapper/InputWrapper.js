import styles from './InputWrapper.module.scss'

const InputWrapper = ({children, label}) => {
    return <div className='Stack-Container'>
        <div className='Label'>{label}</div>
        <div className={`Horizontal-Flex-Container ${styles.inputContainer}`}>{children}</div>
    </div>;
}
 
export default InputWrapper;