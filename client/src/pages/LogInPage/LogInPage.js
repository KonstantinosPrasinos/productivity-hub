import React, {useContext, useEffect, useState} from 'react';
import styles from './LogInPage.module.scss';
import Button from "../../components/buttons/Button/Button";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import CollapsibleContainer from "../../components/utilities/CollapsibleContainer/CollapsibleContainer";
import {useNavigate} from "react-router-dom";
import {AlertsContext} from "../../context/AlertsContext";
import PasswordStrengthBar from "react-password-strength-bar";
import SwitchContainer from "../../components/utilities/SwitchContainer/SwitchContainer";
import {useVerify} from "../../hooks/useVerify";
import TextButton from "../../components/buttons/TextButton/TextButton";
import {useAuth} from "../../hooks/useAuth";
import {UserContext} from "../../context/UserContext";

const LogInPage = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const {login} = useAuth();
    const {verifyVerificationCode} = useVerify();

    const [currentPage, setCurrentPage] = useState(0);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const [passwordScore, setPasswordScore] = useState();
    const alertsContext = useContext(AlertsContext);
    const user = useContext(UserContext).state;
    const navigate = useNavigate();

    const handleVerificationCode = (e) => {
        if (e.length <= 6) {
            setVerificationCode(e);
        }
    }

    const handleKeyDown = (e) => {
        if (e.code === 'Enter') {
            handleContinue();
        }
    }

    const handleChangeAction = () => {
        if (currentPage === 0) {
            setCurrentPage(1);
        } else {
            setRepeatPassword('');
            setCurrentPage(0);
        }
    }

    const handleContinue = () => {
        if (selectedTab === 0) {
            if (currentPage === 0) {
                // Attempt login
                const temp = login(email, password);
            } else {
                if (passwordScore !== 0) {
                    if (password === repeatPassword) {
                        setSelectedTab(1);
                    } else {
                        alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Passwords don't match"}});
                    }
                } else {
                    alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Password isn't strong enough"}});
                }
            }
        } else {
            if (verifyVerificationCode(verificationCode)) {
                alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "success", message: "Account created successfully"}});
                setSelectedTab(0);
                setCurrentPage(0);
            } else {
                alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Verification code is invalid"}});
            }
        }
    }

    const handleVerificationContinue = () => {
        if (verificationCode.length === 6) {
            handleContinue();
        } else {
            setVerificationCode('');
            setCurrentPage(0);
            setSelectedTab(0);
        }
    }

    const handlePasswordScoreChange = (score) => {
        setPasswordScore(score);
    }

    const handleForgotPassword = () => {
        navigate('/password-reset')
    }

    useEffect(() => {
        if (user.id) {
            navigate('/');
        }
    }, [user])

    return (
        <div className={'Overlay Opaque'}>
            <div className={`Surface ${styles.surface}`}>
                <SwitchContainer selectedTab={selectedTab}>
                    <div className={styles.container}>
                        <div className={'Display'}>Welcome to Productivity Hub</div>
                        <TextBoxInput type={'email'} width={'max'} size={'big'} placeholder={'Email address'} value={email} setValue={setEmail}/>
                        <TextBoxInput
                            type={'password'}
                            width={'max'}
                            size={'big'}
                            placeholder={'Password'}
                            value={password}
                            setValue={setPassword}
                            onKeydown={handleKeyDown}
                        />
                        <CollapsibleContainer isVisible={currentPage === 1} hasBorder={false}>
                            <PasswordStrengthBar password={password} onChangeScore={handlePasswordScoreChange} />
                            <TextBoxInput
                                type={'password'}
                                width={'max'}
                                size={'big'}
                                placeholder={'Repeat password'}
                                value={repeatPassword}
                                setValue={setRepeatPassword}
                                onKeydown={handleKeyDown}
                            />
                        </CollapsibleContainer>
                        <div className={'Horizontal-Flex-Container Space-Between'}>
                            <Button filled={false} onClick={handleChangeAction}>{currentPage === 0 ? 'Register' : 'Log in'}</Button>
                            <Button filled={false} onClick={handleForgotPassword}>Forgot password</Button>
                        </div>
                        <Button filled={true} width={'max'} size={'big'} onClick={handleContinue}>{currentPage === 0 ? 'Log in' : 'Register'}</Button>
                    </div>
                    <div className={`${styles.container} ${styles.spaceBetween}`}>
                        <div className={'Display'}>We sent you a code</div>
                        <div className={'Label'}>
                            If the email you entered exists, is should receive a verification code.
                            Enter the code below to verify your email.
                        </div>
                        <div>
                            <TextBoxInput
                                width={'max'}
                                size={'big'}
                                placeholder={'Verification code'}
                                value={verificationCode}
                                setValue={handleVerificationCode}
                                onKeydown={handleKeyDown}
                            />
                            <TextButton>Didn't receive code?</TextButton>
                        </div>
                        <Button
                            width={'max'}
                            size={'big'}
                            filled={verificationCode.length === 6}
                            onClick={handleVerificationContinue}
                        >
                            {verificationCode.length === 6 ? 'Continue' : 'Cancel'}
                        </Button>
                    </div>
                </SwitchContainer>
            </div>
        </div>
    );
};

export default LogInPage;
