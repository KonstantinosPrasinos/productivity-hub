import {useState} from 'react';
import styles from './ResetPassword.module.scss';
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import Button from "../../components/buttons/Button/Button";
import {useNavigate} from "react-router-dom";
import Pagination from "../../components/utilities/Pagination/Pagination";

const ResetPassword = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    const navigate = useNavigate();

    const validateEmail = () => {
        return email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

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

    const handleNextPage = () => {
        switch (currentPage) {
            case 0:
                // Verify email
                if (validateEmail()) {
                    setCurrentPage(1);
                }
                break;
            case 1:
                // Verify code
                setCurrentPage(2);
                break;
            case 2:
                // Check if password is strong enough
                setCurrentPage(3)
                break;
            case 3:
                navigate(-1);
                break;
        }
    }

    return (
        <div className={`Overlay Opaque`}>
            <div className={`Surface ${styles.surface}`}>
                <Pagination currentPage={currentPage}>
                    <div className={'Stack-Container'}>
                        <div className={'Display'}>Enter your email</div>
                        <div className={'Label'}>We will send you a password to verify it's you.</div>
                        <TextBoxInput type={'email'} width={'max'} size={'big'} placeholder={'Email address'} value={email} setValue={setEmail}/>
                    </div>
                    <div className={'Stack-Container'}>
                        <div className={'Display'}>We sent you a code</div>
                        <div className={'Label'}>
                            If the email you entered exists, is should receive a verification code.
                            Enter the code below to verify your email.
                        </div>
                        <TextBoxInput width={'max'} size={'big'} placeholder={'Verification code'} value={verificationCode} setValue={handleVerificationCode}/>
                    </div>
                    <div className={'Stack-Container'}>
                        <div className={'Display'}>Enter new password</div>
                        <TextBoxInput type={'password'} width={'max'} size={'big'} placeholder={'New password'}/>
                        <TextBoxInput type={'password'} width={'max'} size={'big'} placeholder={'Re-enter password'}/>
                    </div>
                    <div className={'Stack-Container'}>
                        <div className={'Display'}>Password set successfully</div>
                    </div>
                </Pagination>
                <div className={`Horizontal-Flex-Container ${currentPage !== 3 ? 'Space-Between' : 'Align-Center'}`}>
                    {currentPage !== 3 ? <Button
                        size={'big'}
                        filled={false}
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button> : null}
                    <Button size={'big'} filled={checkIfFilled()} onClick={handleNextPage} layout={true}>{currentPage !== 4 ? 'Continue' : 'Finish'}</Button>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
