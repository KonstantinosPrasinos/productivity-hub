const InputWrapper = ({children, label}) => {
    return <div className='Stack-Container'>
        <div className='Label'>{label}</div>
        {children}
    </div>;
}
 
export default InputWrapper;