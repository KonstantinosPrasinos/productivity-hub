import {useContext, useEffect, useState} from 'react';
import TextBoxInput from "../../../components/inputs/TextBoxInput/TextBoxInput";
import Button from "../../../components/buttons/Button/Button";
import {useNavigate} from "react-router-dom";
import PasswordStrengthBar from "react-password-strength-bar";
import {AlertsContext} from "../../../context/AlertsContext";
import {useVerify} from "../../../hooks/useVerify";
import SwitchContainer from "../../../components/containers/SwitchContainer/SwitchContainer";
import TextButton from "../../../components/buttons/TextButton/TextButton";
import SurfaceContainer from "../../../components/containers/SurfaceContainer/SurfaceContainer";
import {useAuth} from "../../../hooks/useAuth";
import {UserContext} from "../../../context/UserContext";
import {removeSettings} from "../../../state/settingsSlice";
import {useDispatch} from "react-redux";

const ResetPassword = () => {
    const user = useContext(UserContext);

    const [currentPage, setCurrentPage] = useState(user.state?.id ? 1 : 0);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [reEnterPassword, setReEnterPassword] = useState('');
    const [passwordScore, setPasswordScore] = useState();
    const [verificationCode, setVerificationCode] = useState('');

    const {verifyForgotPassword, resendForgotPasswordCode} = useVerify();
    const {resetPasswordEmail, setForgotPassword} = useAuth();
    const navigate = useNavigate();
    const alertsContext = useContext(AlertsContext);
    const dispatch = useDispatch();

    const validateEmail = () => {
        return email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    const handleKeyDown = (e) => {
        if (e.code === 'Enter') {
            handleNextPage();
        }
    }

    const handleInvalidEmail = () => {
        if (email.length === 0) {
            return null;
        } else return !validateEmail();
    }

    const checkPasswordStrength = () => {
        // Temp
        return true;
    }

    const checkIfFilled = () => {
        switch (currentPage) {
            case 0:
                return validateEmail();
            case 1:
                return verificationCode.length === 6
            case 2:
                return checkPasswordStrength();
            default:
                return true;
        }
    }

    const handleVerificationCode = (e) => {
        if (e.length <= 6) {
            setVerificationCode(e);
        }
    }

    const handleCancel = () => {
        navigate(-1);
    }

    const handleNextPage = async () => {
        switch (currentPage) {
            case 0:
                // Verify email
                if (validateEmail()) {
                    await resetPasswordEmail(email);
                    setCurrentPage(1);
                } else {
                    alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Email is invalid."}});
                }
                break;
            case 1:
                const redirect = await verifyForgotPassword(email, verificationCode);
                if (redirect) {
                    setCurrentPage(2);
                }
                break;
            case 2:
                // Check if password is strong enough
                if (passwordScore !== 0) {
                    if (reEnterPassword === newPassword){
                        const redirect = await setForgotPassword(newPassword);
                        if (redirect) {
                            setCurrentPage(3)
                        }
                    } else {
                        alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Passwords don't match"}});
                    }
                } else {
                    alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Password isn't strong enough"}});
                }
                break;
            case 3:
                if (user.state?.id) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('settings');
                    user.dispatch({type: "REMOVE_USER"});
                    dispatch(removeSettings());
                }
                navigate('/log-in');
                break;
        }
    }

    const handleResendCode = async () => {
        await resendForgotPasswordCode(email);
    }

    const handlePasswordScore = (score) => {
        setPasswordScore(score);
    }

    const handleDisabledButton = () => {
        switch (currentPage) {
            case 0:
                return !validateEmail();
            case 1:
                return !(verificationCode.length === 6);
            case 2:
                return !passwordScore || !newPassword.length || !reEnterPassword.length;
            default:
                return false
        }
    }

    // When the user visits this page while logged in, the input email page is skipped.
    // Because the continue button on said page is not pressed, we need to send the email manually.
    useEffect(async () => {
        if (user.state?.id) {
            await resetPasswordEmail(email);
        }
    }, [])

    return (
        <SurfaceContainer>
            <SwitchContainer selectedTab={currentPage}>
                <div className={'Stack-Container'}>
                    <div className={'Display'}>Enter your email</div>
                    <div className={'Label'}>We will send you a code to verify it's you.</div>
                    <TextBoxInput
                        type={'email'}
                        width={'max'}
                        size={'big'}
                        placeholder={'Email address'}
                        value={email}
                        setValue={setEmail}
                        invalid={handleInvalidEmail()}
                        onKeydown={handleKeyDown}
                    />
                </div>
                <div className={'Stack-Container'}>
                    <div className={'Display'}>We sent you a code</div>
                    <div className={'Label'}>
                        {user.state?.id ?
                            "In order to verify it's you we sent you a verification code." :
                            "If the email you entered exists, is should receive a verification code."
                        }
                        <br />
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
                        <TextButton onClick={handleResendCode}>Didn't receive code?</TextButton>
                    </div>
                </div>
                <div className={'Stack-Container'}>
                    <div className={'Display'}>Enter new password</div>
                    <TextBoxInput
                        type={'password'}
                        width={'max'}
                        size={'big'}
                        placeholder={'New password'}
                        onKeydown={handleKeyDown}
                        value={newPassword}
                        setValue={setNewPassword}
                        invalid={newPassword.length === 0 ? null : (passwordScore === 0) }
                    />
                    <PasswordStrengthBar password={newPassword} onChangeScore={handlePasswordScore} style={{padding: '0 10px', marginTop: 0}} />
                    <TextBoxInput
                        type={'password'}
                        width={'max'}
                        size={'big'}
                        placeholder={'Re-enter password'}
                        onKeydown={handleKeyDown}
                        value={reEnterPassword}
                        setValue={setReEnterPassword}
                    />
                </div>
                <div className={'Stack-Container'}>
                    <div className={'Display'}>Password set successfully</div>
                </div>
            </SwitchContainer>
            <div className={`Horizontal-Flex-Container ${currentPage !== 3 ? 'Space-Between' : 'Align-Center'}`}>
                {currentPage !== 3 ? <Button
                    size={'big'}
                    filled={false}
                    onClick={handleCancel}
                >
                    Cancel
                </Button> : null}
                <Button
                    size={'big'}
                    filled={checkIfFilled()}
                    onClick={handleNextPage}
                    layout={true}
                    disabled={handleDisabledButton()}
                >
                    {currentPage !== 4 ? 'Continue' : 'Finish'}
                </Button>
            </div>
        </SurfaceContainer>
    );
};

export default ResetPassword;
