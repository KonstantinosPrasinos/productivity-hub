import styles from "./Settings.module.scss";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PaletteIcon from "@mui/icons-material/Palette";
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import InfoIcon from "@mui/icons-material/Info";
import {useContext, useEffect, useState} from "react";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import Chip from "../../components/buttons/Chip/Chip";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import Button from "../../components/buttons/Button/Button";
import {useDispatch, useSelector} from "react-redux";
import IconButton from "../../components/buttons/IconButton/IconButton";
import TwitterIcon from '@mui/icons-material/Twitter';
import {setDefaultGoal, setDefaultPriority, setDefaultStep, setTheme} from "../../state/userSlice";
import CollapsibleContainer from "../../components/utilities/CollapsibleContainer/CollapsibleContainer";
import {ModalContext} from "../../context/ModalContext";
import {useVerify} from "../../hooks/useVerify";
import {AlertsContext} from "../../context/AlertsContext";
import PasswordStrengthBar from "react-password-strength-bar";

const Settings = () => {
    const {theme, defaults} = useSelector((state) => state?.user.settings);
    const email = useSelector((state) => state?.user.email);

    const {verifyPassword} = useVerify();
    const alertsContext = useContext(AlertsContext);
    const modalContext = useContext(ModalContext);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordScore, setNewPasswordScore] = useState();
    const [selectedTheme, setSelectedTheme] = useState(theme);

    const dispatch = useDispatch();

    const themeChips = ['Device', 'Light', 'Dark', 'Black'];

    const clearPasswords = () => {
        setNewPassword('');
        setCurrentPassword('');
    }

    useEffect(() => {
        if (theme !== selectedTheme) {
            dispatch(setTheme(selectedTheme));
        }
    }, [selectedTheme]);

    const handleSavePassword = () => {
        if (verifyPassword(currentPassword)) {
            if (newPasswordScore > 0) {
                setChangePasswordVisible(current => !current)
                clearPasswords()
                alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "success", message: "Password updated!"}});
            } else {
                alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Password is not strong enough"}});
            }
        } else {
            alertsContext.dispatch({type: "ADD_ALERT", payload: {type: "error", message: "Password isn't strong enough"}});
        }
    }

    const handleCancelPasswordChange = () => {
        clearPasswords();
        setChangePasswordVisible(current => !current);
    }

    const handlePasswordScore = (score) => {
        setNewPasswordScore(score);
    }

    const handleChangeEmail = () => {
        modalContext.dispatch({type: 'TOGGLE_MODAL'});
    }

    const handleProjectClick = () => {
        window.open('https://github.com/KonstantinosPrasinos/productivity-hub');
    }

    const handleGithubClick = () => {
        window.open('https://github.com/KonstantinosPrasinos/');
    }

    const handleLinkedInClick = () => {
        window.open('https://www.linkedin.com/in/konstantinos-prasinos-ab2a201bb/')
    }

    const handleTwitterClick = () => {
        window.open('https://twitter.com/ConstantDeenos');
    }

    return (
        <div className={`Rounded-Container ${styles.container} Stack-Container To-Edge`}>
            <div className={`Headline Horizontal-Flex-Container ${styles.header}`}><AccountCircleIcon/>Account</div>
            <section className={'Stack-Container No-Gap'}>
                <InputWrapper label={'Email'}>
                    {email}
                </InputWrapper>
                <InputWrapper label={'ChangeEmail'}>
                    <Button filled={false} size={'small'} onClick={handleChangeEmail}>Change your Email</Button>
                </InputWrapper>
                <InputWrapper label={'Password'}>
                    <Button filled={false} size={'small'} onClick={handleCancelPasswordChange}>Change your Password</Button>
                </InputWrapper>
                <CollapsibleContainer isVisible={changePasswordVisible}>
                    <InputWrapper label={'Current Password'}>
                        <TextBoxInput width={'max'} value={currentPassword} setValue={setCurrentPassword} placeholder={'Current password'}/>
                    </InputWrapper>
                    <InputWrapper label={'New Password'} type={'vertical'}>
                        <TextBoxInput
                            width={'max'}
                            value={newPassword}
                            setValue={setNewPassword}
                            placeholder={'New password'}
                            invalid={newPassword.length ? newPasswordScore === 0 : null}
                        />
                        <PasswordStrengthBar password={newPassword} onChangeScore={handlePasswordScore} />
                    </InputWrapper>
                    <InputWrapper>
                        <Button filled={false} size={'small'} onClick={handleSavePassword}>Save</Button>
                        <Button filled={false} size={'small'} onClick={() => setChangePasswordVisible(current => !current)}>Cancel</Button>
                    </InputWrapper>
                </CollapsibleContainer>
                <InputWrapper label={'Your Data'}>
                    <Button filled={false} size={'small'}>Download Data</Button>
                </InputWrapper>
                <InputWrapper label={'Account Removal'}>
                    <Button filled={false} size={'small'}>Delete Account</Button>
                </InputWrapper>
            </section>
            <div className={`Headline Horizontal-Flex-Container ${styles.header}`}><PaletteIcon/>Appearance</div>
            <section className={'Stack-Container No-Gap'}>
                <InputWrapper label={'Theme'}>
                    {themeChips.map(theme => <Chip key={theme} value={theme} selected={selectedTheme}
                                                   setSelected={setSelectedTheme}>{theme}</Chip>)}
                </InputWrapper>
            </section>
            <div className={`Headline Horizontal-Flex-Container ${styles.header}`}><AutoFixNormalIcon/>Defaults</div>
            <section className={'Stack-Container No-Gap'}>
                <InputWrapper label={'Priority'}>
                    <TextBoxInput type={'number'} value={defaults.priority}
                                  setValue={(e) => dispatch(setDefaultPriority(e))}></TextBoxInput>
                </InputWrapper>
                <InputWrapper label={'Number Task Step'}>
                    <TextBoxInput type={'number'} value={defaults.step}
                                  setValue={(e) => dispatch(setDefaultStep(e))}></TextBoxInput>
                </InputWrapper>
                <InputWrapper label={'Goal Number'}>
                    <TextBoxInput type={'number'} value={defaults.goal}
                                  setValue={(e) => dispatch(setDefaultGoal(e))}></TextBoxInput>
                </InputWrapper>
            </section>
            <div className={`Headline Horizontal-Flex-Container ${styles.header}`}><InfoIcon/>About</div>
            <InputWrapper label={'App'} type={'vertical'}>
                Available as a Web App, on Android and on Windows.
                You can view the source code for this app on the github page below.
                <Button onClick={handleProjectClick}>Project Source Code<GitHubIcon/></Button>
            </InputWrapper>
            <InputWrapper label={'Creator'} type={'vertical'}>
                This app was created by Konstantinos Prasinos.
                <div className={'Horizontal-Flex-Container'}>
                    <IconButton onClick={handleGithubClick}><GitHubIcon/></IconButton>
                    <IconButton onClick={handleLinkedInClick}><LinkedInIcon/></IconButton>
                    <IconButton onClick={handleTwitterClick}><TwitterIcon/></IconButton>
                </div>
            </InputWrapper>
        </div>
    );
};

export default Settings;
