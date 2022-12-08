import styles from "./Settings.module.scss";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PaletteIcon from "@mui/icons-material/Palette";
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import InfoIcon from "@mui/icons-material/Info";
import {useContext, useState} from "react";
import InputWrapper from "../../components/utilities/InputWrapper/InputWrapper";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import Chip from "../../components/buttons/Chip/Chip";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import Button from "../../components/buttons/Button/Button";
import IconButton from "../../components/buttons/IconButton/IconButton";
import TwitterIcon from '@mui/icons-material/Twitter';
import CollapsibleContainer from "../../components/utilities/CollapsibleContainer/CollapsibleContainer";
import {ModalContext} from "../../context/ModalContext";
import {useVerify} from "../../hooks/useVerify";
import {AlertsContext} from "../../context/AlertsContext";
import PasswordStrengthBar from "react-password-strength-bar";
import {UserContext} from "../../context/UserContext";
import {useAuth} from "../../hooks/useAuth";
import TextButton from "../../components/buttons/TextButton/TextButton";
import {useSettings} from "../../hooks/useSettings";
import {useGetSettings} from "../../hooks/get-hooks/useGetSettings";

const Settings = () => {
    const {data: settings} = useGetSettings();
    const email = useContext(UserContext).state.email;
    const {setSettingsServer} = useSettings()

    const {verifyPassword} = useVerify();
    const alertsContext = useContext(AlertsContext);
    const modalContext = useContext(ModalContext);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordScore, setNewPasswordScore] = useState();
    const [selectedTheme, setSelectedTheme] = useState(settings.theme);
    const [emailVisible, setEmailVisible] = useState(false);
    const [priority, setPriority] = useState(settings.defaults.priority)
    const [goal, setGoal] = useState(settings.defaults.goal);
    const [step, setStep] = useState(settings.defaults.step);
    const [settingsChanges, setSettingsChanges] = useState({});

    const {logout} = useAuth();

    const themeChips = ['Device', 'Light', 'Dark', 'Black'];

    const clearPasswords = () => {
        setNewPassword('');
        setCurrentPassword('');
    }

    const handleSaveChanges = async () => {
        await setSettingsServer({theme: selectedTheme, defaults: {step, goal, priority}});
    }

    const hiddenEmail = () => {
        const hidden = '*'.repeat(email.substring(0, email.indexOf('@')).length);
        return (hidden.concat(email.substring(email.indexOf('@'), email.length)));
    }

    const handleLogOut = async () => {
        await logout();
    }

    const handleSetTheme = (e) => {
        if (selectedTheme !== e) {
            setSelectedTheme(e);
        }
        if (settings.theme !== e) {
            setSettingsChanges({...settingsChanges, theme: e});
        } else {
            setSettingsChanges((current) => {
                const {theme, ...rest} = current;

                return rest;
            });
        }
    }

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

    const handleSetPriority = (e) => {
        setPriority(e);
        if (e != settings.defaults.priority) {
            setSettingsChanges({...settingsChanges, priority: e});
        } else {
            setSettingsChanges((current) => {
                const {priority, ...rest} = current;

                return rest;
            });
        }
    }

    const handleSetStep = (e) => {
        setStep(e);
        if (e != settings.defaults.step) {
            setSettingsChanges({...settingsChanges, step: e});
        } else {
            setSettingsChanges((current) => {
                const {step, ...rest} = current;

                return rest;
            });
        }
    }

    const handleSetGoal = (e) => {
        setGoal(e);
        if (e != settings.defaults.goal) {
            setSettingsChanges({...settingsChanges, goal: e});
        } else {
            setSettingsChanges((current) => {
                const {goal, ...rest} = current;

                return rest;
            });
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

    const handleToggleEmail = () => {
        setEmailVisible(current => !current);
    }

    return (
        <div className={`Rounded-Container ${styles.container}`}>
            <div className={`Stack-Container To-Edge ${styles.subContainer}`}>
                <div className={`Headline Horizontal-Flex-Container ${styles.header}`}><AccountCircleIcon/>Account</div>
                <section className={'Stack-Container No-Gap'}>
                    <InputWrapper label={'Email'}>
                        <div className={styles.emailWrapper}>
                            <div className={styles.emailLeftSide}>
                                {emailVisible ? email : hiddenEmail()}
                                <TextButton onClick={handleToggleEmail}>{emailVisible ? 'Hide' : 'Reveal'}</TextButton>
                            </div>
                            <Button filled={false} size={'small'} onClick={handleChangeEmail}>Edit</Button>
                        </div>
                    </InputWrapper>
                    <InputWrapper label={'Log Out'}>
                        <Button filled={false} size={'small'} onClick={handleLogOut}>Log out</Button>
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
                            <PasswordStrengthBar password={newPassword} onChangeScore={handlePasswordScore} style={{padding: '0 10px', marginTop: 0}} />
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
                        <Button filled={false} size={'small'} isWarning={true}>Delete Account</Button>
                        <Button filled={false} size={'small'} isWarning={true}>Reset Account</Button>
                    </InputWrapper>
                </section>
                <div className={`Headline Horizontal-Flex-Container ${styles.header}`}><PaletteIcon/>Appearance</div>
                <section className={'Stack-Container No-Gap'}>
                    <InputWrapper label={'Theme'}>
                        {themeChips.map(theme => <Chip key={theme} value={theme} selected={selectedTheme}
                                                       setSelected={handleSetTheme}>{theme}</Chip>)}
                    </InputWrapper>
                </section>
                <div className={`Headline Horizontal-Flex-Container ${styles.header}`}><AutoFixNormalIcon/>Defaults</div>
                <section className={'Stack-Container No-Gap'}>
                    <InputWrapper label={'Priority'}>
                        <TextBoxInput type={'number'} value={priority}
                                      setValue={handleSetPriority}></TextBoxInput>
                    </InputWrapper>
                    <InputWrapper label={'Number Task Step'}>
                        <TextBoxInput type={'number'} value={step}
                                      setValue={handleSetStep}></TextBoxInput>
                    </InputWrapper>
                    <InputWrapper label={'Goal Number'}>
                        <TextBoxInput type={'number'} value={goal}
                                      setValue={handleSetGoal}></TextBoxInput>
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
            {Object.keys(settingsChanges).length > 0 &&
                <div className={styles.saveSettingsContainer}>
                    <Button onClick={handleSaveChanges}>Save changes</Button>
                </div>
            }
        </div>
    );
};

export default Settings;
