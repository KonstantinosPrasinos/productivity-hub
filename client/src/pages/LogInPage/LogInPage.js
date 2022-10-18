import React, {useState} from 'react';
import styles from './LogInPage.module.scss';
import Button from "../../components/buttons/Button/Button";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import CollapsibleContainer from "../../components/utilities/CollapsibleContainer/CollapsibleContainer";
import {useNavigate} from "react-router-dom";

const LogInPage = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const navigate = useNavigate();

    const handleLogInAction = () => {
        if (currentPage === 0) {
            setCurrentPage(1);
        } else {
            setCurrentPage(0);
        }
    }

    const handleForgotPassword = () => {
        navigate('/password-reset')
    }

    return (
        <div className={'Overlay Opaque'}>
            <div className={`Surface ${styles.surface}`}>
                <div className={'Display'}>Welcome to Productivity Hub</div>
                <TextBoxInput type={'email'} width={'max'} size={'big'} placeholder={'Email address'}/>
                <TextBoxInput type={'password'} width={'max'} size={'big'} placeholder={'Password'}/>
                <CollapsibleContainer isVisible={currentPage === 1} hasBorder={false}>
                    <TextBoxInput type={'password'} width={'max'} size={'big'} placeholder={'Repeat password'}/>
                </CollapsibleContainer>
                <div className={'Horizontal-Flex-Container Space-Between'}>
                    <Button filled={false} onClick={handleLogInAction}>{currentPage === 0 ? 'Register' : 'Log in'}</Button>
                    <Button filled={false} onClick={handleForgotPassword}>Forgot password</Button>
                </div>
                <Button filled={true} width={'max'} size={'big'}>{currentPage === 0 ? 'Log in' : 'Register'}</Button>
            </div>
        </div>
    );
};

export default LogInPage;
