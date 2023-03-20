import {useContext, useEffect, useState} from 'react';
import TextBoxInput from "../../../components/inputs/TextBoxInput/TextBoxInput";
import Button from "../../../components/buttons/Button/Button";
import {useNavigate} from "react-router-dom";
import PasswordStrengthBar from "react-password-strength-bar";
import {AlertsContext} from "../../../context/AlertsContext";
import SwitchContainer from "../../../components/containers/SwitchContainer/SwitchContainer";
import TextButton from "../../../components/buttons/TextButton/TextButton";
import Modal from "../../../components/containers/Modal/Modal";
import {UserContext} from "../../../context/UserContext";
import {useResetPassword} from "../../../hooks/auth-hooks/useResetPassword";
import {useQueryClient} from "react-query";

const ResetPassword = () => {
    const user = useContext(UserContext);
    const alertsContext = useContext(AlertsContext);
    const queryClient = useQueryClient();

    const [currentPage, setCurrentPage] = useState(user.state?.id ? 1 : null);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [reEnterPassword, setReEnterPassword] = useState('');
    const [passwordScore, setPasswordScore] = useState();
    const [verificationCode, setVerificationCode] = useState('');

    const {sendCode, verifyCode, setPassword} = useResetPassword();
    const navigate = useNavigate();

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

    const handleVerificationCodeInput = (e) => {
        if (e.length <= 6) {
            setVerificationCode(e);
        }
    }

    const handleCancel = () => {
        navigate(-1);
    }

    const handleNextPage = async () => {
        setCurrentPage(current => current + 1);
        switch (currentPage) {
            case 0:
                // Enter email tab,
                if (validateEmail()) {
                    await sendCode(email);
                    setCurrentPage(2);
                } else {
                    alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Email is invalid."}});
                }
                break;
            case 1:
                // Confirm send email tab.
                if (user.state?.id) {
                    await sendCode(user.state?.email);
                }
                setCurrentPage(2);
                break;
            case 2:
                // Enter verification code tab
                const redirect = await verifyCode(verificationCode, user.state?.id ? user.state?.email : email);
                if (redirect) {
                    setCurrentPage(2);
                }
                break;
            case 3:
                // Enter new password tab
                // Check if password is strong enough
                if (passwordScore !== 0) {
                    if (reEnterPassword === newPassword){
                        const redirect = await setPassword(user.state?.id ? user.state?.email : email, verificationCode, newPassword);
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
            case 4:
                // Ending tab.
                if (user.state?.id) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('settings');
                    user.dispatch({type: "REMOVE_USER"});
                    queryClient.removeQueries(["settings"]);
                }
                navigate('/log-in');
                break;
        }
    }

    const handleResendCode = async () => {
        await sendCode(user.state?.id ? user.state?.email : email);
    }

    const handlePasswordScore = (score) => {
        setPasswordScore(score);
    }

    const checkIfContinueActive = () => {
        switch (currentPage) {
            case 0:
                return !validateEmail();
            case 1:
                return false;
            case 2:
                return !(verificationCode.length === 6);
            case 3:
                return !passwordScore || !newPassword.length || !reEnterPassword.length;
            default:
                return false
        }
    }

    useEffect(() => {
        if (!user.state?.isLoading) {
            setCurrentPage(user.state?.id ? 1 : 0);
        }
    }, [user.state?.isLoading])

    return (
        <Modal isLoading={user.state?.isLoading && true}>
            <SwitchContainer selectedTab={currentPage}>
                <div className={'Stack-Container Big-Gap'}>
                    {/* When the user is signed in, this tab (0) is skipped. */}
                    <div className={'Display'}>Enter your email</div>
                    <div className={'Label'}>We will send you a code to verify it's you.</div>
                    <TextBoxInput
                        type={'email'}
                        width={'max'}
                        size={'large'}
                        placeholder={'Email address'}
                        value={email}
                        setValue={setEmail}
                        invalid={email.length === 0 ? null : handleInvalidEmail()}
                        onKeydown={handleKeyDown}
                    />
                </div>
                {/*
                    We want to inform the user that an email will be sent to them, they also need to agree to it.
                    When the user is not logged in the first tab asks them to input their email and informs them of this action.
                    Since this tab is skipped when the user is logged in, a new tab is added to accomplish this.
                    Said tab (1) is skipped when not logged in.
                */}
                <div className={'Stack-Container Big-Gap'}>
                    {/* When the user is not signed in, this tab (1) is skipped. */}
                    <div className={'Display'}>Verify your email</div>
                    <div className={'Label'}>
                        To change your password, we need you to verify your email address.
                        <br />
                        If you continue we will send a verification code to {user.state?.email}.
                    </div>
                </div>
                <div className={'Stack-Container Big-Gap'}>
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
                            size={'large'}
                            placeholder={'Verification code'}
                            value={verificationCode}
                            setValue={handleVerificationCodeInput}
                            onKeydown={handleKeyDown}
                        />
                        <TextButton onClick={handleResendCode}>Didn't receive code?</TextButton>
                    </div>
                </div>
                <div className={'Stack-Container Big-Gap'}>
                    <div className={'Display'}>Enter new password</div>
                    <TextBoxInput
                        type={'password'}
                        width={'max'}
                        size={'large'}
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
                        size={'large'}
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
            <div className={`Horizontal-Flex-Container ${currentPage !== 4 ? 'Space-Between' : 'Align-Center'}`}>
                {currentPage !== 4 ? <Button
                    size={'large'}
                    filled={false}
                    onClick={handleCancel}
                >
                    Cancel
                </Button> : null}
                <Button
                    size={'large'}
                    filled={!checkIfContinueActive()}
                    onClick={handleNextPage}
                    disabled={checkIfContinueActive()}
                >
                    {currentPage !== 4 ? 'Continue' : 'Finish'}
                </Button>
            </div>
        </Modal>
    );
};

export default ResetPassword;