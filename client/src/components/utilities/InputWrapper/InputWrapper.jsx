import styles from './InputWrapper.module.scss'

const InputWrapper = ({children, label, type}) => {
    return <div className={`Stack-Container ${styles.container}`}>
        {label && <div className='Label'>{label}</div>}
        <div className={`${type === 'vertical' ? 'Stack-Container' : 'Horizontal-Flex-Container'} ${styles.inputContainer}`}>{children}</div>
    </div>;
}
 
export default InputWrapper;