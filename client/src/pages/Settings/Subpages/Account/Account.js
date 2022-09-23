import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InputWrapper from "../../../../components/utilities/InputWrapper/InputWrapper";
import FilledButton from "../../../../components/buttons/FilledButton/FilledButton";
import TextButton from "../../../../components/buttons/TextButton/TextButton";

import styles from './Account.module.scss';

const Account = () => {
    return (
        <div className={`Stack-Container ${styles.container}`}>
            <div className={`Horizontal-Flex-Container ${styles.accountContainer}`}>
                <AccountCircleIcon sx={{fontSize: '4em'}} />
                <div className={styles.email}>konstantinos.prasinos@gmail.com</div>
            </div>
            <InputWrapper type={'vertical'} label={'Manage Account'}>
                <TextButton to={'/change-email'}>Change Email</TextButton>
                <TextButton to={'/reset-password'}>Reset Password</TextButton>
                <TextButton type={'important'} to={'/delete-account'}>Delete Account</TextButton>
            </InputWrapper>
            <InputWrapper type={'vertical'} label={'Task Data'}>
                <TextButton to={'/download-data'}>Download your task data</TextButton>
            </InputWrapper>
        </div>
    );
};

export default Account;
