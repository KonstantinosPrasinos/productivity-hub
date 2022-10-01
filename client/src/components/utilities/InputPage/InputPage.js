import {useContext} from 'react';
import styles from './InputPage.module.scss';
import {ScreenSizeContext} from "../../../context/ScreenSizeContext";
import IconButton from "../../buttons/IconButton/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "../../buttons/Button/Button";

const InputPage = ({leftSide, rightSide, toggleState, handleSave}) => {
    const screenSizeContext = useContext(ScreenSizeContext);
    return (
        <div
            className={`${screenSizeContext.state === 'small' ? 'Stack-Container' : 'Horizontal-Flex-Container'}
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
                    ${screenSizeContext.state === 'small' ? styles.small : ''}
                    ${!toggleState ? styles.isDisabled : ''}`}
            >
                {rightSide}
            </div>
            <div className={`Stack-Container}`}>
                {
                    screenSizeContext.state === 'big' && <div className={styles.exitButton}><IconButton><CloseIcon /></IconButton></div>
                }

                <div className={`${styles.saveButton} ${screenSizeContext.state === 'small' && styles.small}`}>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </div>
        </div>
    );
};

export default InputPage;
