import React, {useContext, useState} from 'react';
import styles from './LogInPage.module.scss';
import Button from "../../components/buttons/Button/Button";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import CollapsibleContainer from "../../components/utilities/CollapsibleContainer/CollapsibleContainer";
import {useNavigate} from "react-router-dom";
import {AlertsContext} from "../../context/AlertsContext";
import PasswordStrengthBar from "react-password-strength-bar";

const LogInPage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [passwordScore, setPasswordScore] = useState();
    const alertsContext = useContext(AlertsContext);
    const navigate = useNavigate();

    const handleChangeAction = () => {
        if (currentPage === 0) {
            setCurrentPage(1);
        } else {
            setRepeatPassword('');
            setCurrentPage(0);
        }
    }

    const handleContinue = () => {
        if (currentPage === 0) {
            // Attempt login
        } else {
            if (passwordScore !== 0) {
                if (password === repeatPassword) {
                    // Attempt register
                } else {
                    alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Passwords don't match"}});
                }
            } else {
                alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Passwords don't match"}});
            }
        }

    }

    const handlePasswordScoreChange = (score) => {
        setPasswordScore(score);
    }

    const handleForgotPassword = () => {
        navigate('/password-reset')
    }

    return (
        <div className={'Overlay Opaque'}>
            <div className={`Surface ${styles.surface}`}>
                <div className={'Display'}>Welcome to Productivity Hub</div>
                <TextBoxInput type={'email'} width={'max'} size={'big'} placeholder={'Email address'} value={email} setValue={setEmail}/>
                <TextBoxInput type={'password'} width={'max'} size={'big'} placeholder={'Password'} value={password} setValue={setPassword}/>
                <CollapsibleContainer isVisible={currentPage === 1} hasBorder={false}>
                    <PasswordStrengthBar password={password} onChangeScore={handlePasswordScoreChange} />
                    <TextBoxInput type={'password'} width={'max'} size={'big'} placeholder={'Repeat password'} value={repeatPassword} setValue={setRepeatPassword}/>
                </CollapsibleContainer>
                <div className={'Horizontal-Flex-Container Space-Between'}>
                    <Button filled={false} onClick={handleChangeAction}>{currentPage === 0 ? 'Register' : 'Log in'}</Button>
                    <Button filled={false} onClick={handleForgotPassword}>Forgot password</Button>
                </div>
                <Button filled={true} width={'max'} size={'big'} onClick={handleContinue}>{currentPage === 0 ? 'Log in' : 'Register'}</Button>
            </div>
        </div>
    );
};

export default LogInPage;
