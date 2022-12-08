import styles from './InputPage.module.scss';
import IconButton from "../../buttons/IconButton/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "../../buttons/Button/Button";
import {useScreenSize} from "../../../hooks/useScreenSize";

const InputPage = ({leftSide, rightSide, toggleState, handleSave}) => {
    const {screenSize} = useScreenSize();
    return (
        <div
            className={`${screenSize === 'small' ? 'Stack-Container' : 'Horizontal-Flex-Container'}
                Rounded-Container
                Symmetrical
                ${styles.container}
                Page`}
        >
            <div className={`Stack-Container ${styles.leftSide}`}>
                {leftSide}
            </div>
            <div
                className={`Stack-Container
                    ${styles.rightSide}
                    ${screenSize === 'small' ? styles.small : ''}
                    ${!toggleState ? styles.isDisabled : ''}`}
            >
                {rightSide}
            </div>
            <div className={`Stack-Container}`}>
                {
                    screenSize === 'big' && <div className={styles.exitButton}><IconButton><CloseIcon /></IconButton></div>
                }

                <div className={`${styles.saveButton} ${screenSize === 'small' && styles.small}`}>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </div>
        </div>
    );
};

export default InputPage;
