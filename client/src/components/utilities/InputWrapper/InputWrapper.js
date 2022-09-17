const InputWrapper = ({children, label}) => {
    return <div className='Stack-Container'>
        <div className='Label'>{label}</div>
        <div className='Horizontal-Flex-Container'>{children}</div>
    </div>;
}
 
export default InputWrapper;