import styles from './TextBoxInput.module.scss';

const TextBoxInput = ({placeholder, type = 'text'}) => {
    return (<div className={`${styles.container} Horizontal-Flex-Container Rounded-Container`}>
        <input type="text" className={styles.input} placeholder={placeholder} />
    </div>);
}
 
export default TextBoxInput;