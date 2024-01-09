import styles from './InputWrapper.module.scss'

const InputWrapper = ({children, label, type, hasPadding = true}) => {
    return <div className={`Stack-Container ${styles.container} ${hasPadding ? styles.hasPadding : ""}`}>
        {label && <div className='Label'>{label}</div>}
        <div className={`${type === 'vertical' ? 'Stack-Container' : 'Horizontal-Flex-Container'} ${styles.inputContainer}`}>{children}</div>
    </div>;
}
 
export default InputWrapper;