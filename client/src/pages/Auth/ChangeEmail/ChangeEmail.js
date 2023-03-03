import {useContext, useState} from 'react';
import TextBoxInput from "../../../components/inputs/TextBoxInput/TextBoxInput";
import Button from "../../../components/buttons/Button/Button";
import {useNavigate} from "react-router-dom";
import SwitchContainer from "../../../components/containers/SwitchContainer/SwitchContainer";
import TextButton from "../../../components/buttons/TextButton/TextButton";
import {UserContext} from "../../../context/UserContext";
import {useChangeEmail} from "../../../hooks/auth-hooks/useChangeEmail";
import {useQueryClient} from "react-query";
import Modal from "../../../components/containers/Modal/Modal";

const ChangeEmail = () => {
    const user = useContext(UserContext);
    const queryClient = useQueryClient();

    const [currentPage, setCurrentPage] = useState(0);
    const [newEmail, setNewEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const [password, setPassword] = useState('');

    const {verifyPassword, verifyCode, sendCode} = useChangeEmail();
    const navigate = useNavigate();

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
        if (newEmail.length > 0) {
            return !validateEmail();
        }
        return true;
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
        switch (currentPage) {
            case 0:
                // Enter password tab.
                if (await verifyPassword(password)) {
                    setCurrentPage(1);
                }
                break;
            case 1:
                // Enter new email tab.
                if (await sendCode(newEmail)) {
                    setCurrentPage(2);
                }
                break;
            case 2:
                // Enter verification code tab
                if (await verifyCode(verificationCode)) {
                    setCurrentPage(3);
                }
                break;
            case 3:
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
        await sendCode(newEmail);
    }

    const checkIfContinueActive = () => {
        switch (currentPage) {
            case 0:
                return password.length < 1;
            case 1:
                return handleInvalidEmail();
            case 2:
                return !(verificationCode.length === 6);
            default:
                return false
        }
    }

    return (
        <Modal>
            <SwitchContainer selectedTab={currentPage}>
                {/* We want to inform the user that an email will be sent to them, they also need to agree to it. */}
                <div className={'Stack-Container Big-Gap'}>
                    <div className={'Display'}>Enter your password</div>
                    <div className={'Label'}>
                        To change your email, you first need to enter your password below.
                    </div>
                    <TextBoxInput
                        type={'password'}
                        width={'max'}
                        size={'big'}
                        placeholder={'New password'}
                        onKeydown={handleKeyDown}
                        value={password}
                        setValue={setPassword}
                    />
                </div>
                <div className={'Stack-Container Big-Gap'}>
                    <div className={'Display'}>Enter new email</div>
                    <div className={'Label'}>
                        Please enter the new email you want to use below.
                        <br />
                        We will send your new email a verification code in order to make sure you are it's owner.
                    </div>
                    <TextBoxInput
                        type={'email'}
                        width={'max'}
                        size={'big'}
                        placeholder={'New email'}
                        onKeydown={handleKeyDown}
                        value={newEmail}
                        setValue={setNewEmail}
                        invalid={newEmail.length === 0 ? null : handleInvalidEmail()}
                    />
                </div>
                <div className={'Stack-Container Big-Gap'}>
                    <div className={'Display'}>We sent you a code</div>
                    <div className={'Label'}>
                        If the email you entered exists, is should receive a verification code.
                        <br/>
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
                <div className={'Stack-Container Big-Gap'}>
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

export default ChangeEmail;