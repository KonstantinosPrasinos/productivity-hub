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

const ChangeEmail = () => {
    const user = useContext(UserContext);

    const [currentPage, setCurrentPage] = useState(user.state?.id ? 1 : 0);
    const [newEmail, setNewEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const {verifyCodeResetPassword, resendCodeResetPassword} = useVerify();
    const {ChangeEmailEmail, setResetPassword} = useAuth();
    const navigate = useNavigate();
    const alertsContext = useContext(AlertsContext);
    const dispatch = useDispatch();

    const validateEmail = () => {
        return newEmail.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    const handleKeyDown = (e) => {
        if (e.code === 'Enter') {
            handleNextPage();
        }
    }

    const handleInvalidEmail = () => {
        if (newEmail.length === 0) {
            return false;
        } else return !validateEmail();
    }

    const checkIfFilled = () => {
        switch (currentPage) {
            case 0:
                return validateEmail();
            case 1:
                return true;
            case 2:
                return verificationCode.length === 6
            case 3:
                return handleInvalidEmail();
            default:
                return true;
        }
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
        // switch (currentPage) {
        //     case 0:
        //         // Enter email tab,
        //         if (validateEmail()) {
        //             await ChangeEmailEmail(user.state?.email);
        //             setCurrentPage(2);
        //         } else {
        //             alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Email is invalid."}});
        //         }
        //         break;
        //     case 1:
        //         // Confirm send email tab.
        //         if (user.state?.id) {
        //             await ChangeEmailEmail(user.state?.email);
        //         }
        //         setCurrentPage(2);
        //         break;
        //     case 2:
        //         // Enter verification code tab
        //         const redirect = await verifyCodeResetPassword(user.state?.email, verificationCode);
        //         if (redirect) {
        //             setCurrentPage(2);
        //         }
        //         break;
        //     case 3:
        //         // Enter new password tab
        //         // Check if password is strong enough
        //         if (passwordScore !== 0) {
        //             if (reEnterPassword === newPassword){
        //                 const redirect = await setResetPassword(newPassword);
        //                 if (redirect) {
        //                     setCurrentPage(3)
        //                 }
        //             } else {
        //                 alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Passwords don't match"}});
        //             }
        //         } else {
        //             alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Password isn't strong enough"}});
        //         }
        //         break;
        //     case 4:
        //         // Ending tab.
        //         if (user.state?.id) {
        //             localStorage.removeItem('user');
        //             localStorage.removeItem('settings');
        //             user.dispatch({type: "REMOVE_USER"});
        //             dispatch(removeSettings());
        //         }
        //         navigate('/log-in');
        //         break;
        // }
    }

    const handleResendCode = async () => {
        await resendCodeResetPassword(user.state?.email);
    }

    const handleDisabledButton = () => {
        // switch (currentPage) {
        //     case 0:
        //         return !validateEmail();
        //     case 1:
        //         return false;
        //     case 2:
        //         return !(verificationCode.length === 6);
        //     case 3:
        //         return !passwordScore || !newPassword.length || !reEnterPassword.length;
        //     default:
        //         return false
        // }
    }

    return (
        <SurfaceContainer>
            <SwitchContainer selectedTab={currentPage}>
                {/* We want to inform the user that an email will be sent to them, they also need to agree to it. */}
                <div className={'Stack-Container'}>
                    <div className={'Display'}>Verify your email</div>
                    <div className={'Label'}>
                        To change your email, we need you to verify your old email address.
                        <br />
                        If you continue we will send a verification code to {user.state?.email}.
                    </div>
                </div>
                <div className={'Stack-Container'}>
                    <div className={'Display'}>We sent you a code</div>
                    <div className={'Label'}>
                        In order to verify it's you we sent you a verification code.
                        <br />
                        Enter the code below to verify your email.
                    </div>
                    <div>
                        <TextBoxInput
                            width={'max'}
                            size={'big'}
                            placeholder={'Verification code'}
                            value={verificationCode}
                            setValue={handleVerificationCodeInput}
                            onKeydown={handleKeyDown}
                        />
                        <TextButton onClick={handleResendCode}>Didn't receive code?</TextButton>
                    </div>
                </div>
                <div className={'Stack-Container'}>
                    <div className={'Display'}>Enter new email</div>
                    <TextBoxInput
                        type={'email'}
                        width={'max'}
                        size={'big'}
                        placeholder={'New email'}
                        onKeydown={handleKeyDown}
                        value={newEmail}
                        setValue={setNewEmail}
                        invalid={handleInvalidEmail()}
                    />
                </div>
                <div className={'Stack-Container'}>
                    <div className={'Display'}>Email set successfully</div>
                </div>
            </SwitchContainer>
            <div className={`Horizontal-Flex-Container ${currentPage !== 4 ? 'Space-Between' : 'Align-Center'}`}>
                {currentPage !== 4 ? <Button
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

export default ChangeEmail;