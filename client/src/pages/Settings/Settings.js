import styles from "./Settings.module.scss";
import {useContext, useState} from "react";
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import Chip from "../../components/buttons/Chip/Chip";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import Button from "../../components/buttons/Button/Button";
import IconButton from "../../components/buttons/IconButton/IconButton";
import TwitterIcon from '@mui/icons-material/Twitter';
import {ModalContext} from "../../context/ModalContext";
import {useVerify} from "../../hooks/useVerify";
import {AlertsContext} from "../../context/AlertsContext";
import {UserContext} from "../../context/UserContext";
import {useAuth} from "../../hooks/useAuth";
import {useGetSettings} from "../../hooks/get-hooks/useGetSettings";
import {useChangeSettings} from "../../hooks/change-hooks/useChangeSettings";
import {motion} from "framer-motion";
import {useResetAccount} from "../../hooks/auth-hooks/useResetAccount";
import {useDeleteAccount} from "../../hooks/auth-hooks/useDeleteAccount";
import EmailIcon from '@mui/icons-material/Email';
import GoogleIcon from '@mui/icons-material/Google';

const Settings = () => {
    const {data: settings} = useGetSettings();
    const email = useContext(UserContext).state.email;
    const {mutate: setSettings} = useChangeSettings();
    const {mutate: resetAccount} = useResetAccount();
    const {mutate: deleteAccount} = useDeleteAccount();

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
    const [dangerAreaVisible, setDangerAreaVisible] = useState('none');

    const {logout} = useAuth();

    const themeChips = ['Device', 'Light', 'Dark']; // Add black

    const clearPasswords = () => {
        setNewPassword('');
        setCurrentPassword('');
    }

    const handleSaveChanges = async () => {
        await setSettings({theme: selectedTheme, defaults: {step, goal, priority}});
        setSettingsChanges({});
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

    const handleToggleDangerArea = (type) => {
        clearPasswords();
        setDangerAreaVisible((current) => {
            if (current !== 'none') {
                return 'none';
            }
            return type;
        });
    }

    const handleAccountRemoval = () => {
        clearPasswords();
        setDangerAreaVisible('none');
        switch (dangerAreaVisible) {
            case 'reset':
                resetAccount(currentPassword);
                break;
            case 'delete':
                deleteAccount(currentPassword);
                break;
            default:
                break;
        }
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
        <motion.div
            className={`Rounded-Container ${styles.container}`}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.1}}
        >
            <div className={`Stack-Container To-Edge ${styles.subContainer}`}>
                <section className={'Stack-Container BigGap'}>
                    <div className={`Horizontal-Flex-Container Title`}>Profile</div>
                    <div className={'Stack-Container BigGap'}>
                        <div className={'Stack-Container'}>
                            <div className={'Horizontal-Flex-Container'}>Logout</div>
                            <div className={`Horizontal-Flex-Container Space-Between`}>
                                <div className={'Label'}>Disconnect your account from this device.</div>
                                <Button filled={false} size={'small'} onClick={handleLogOut}>Logout</Button>
                            </div>
                        </div>
                        <div className={styles.subSectionTitle}>Account Details</div>
                        <section className={`Stack-Container ${styles.subSection}`}>
                            <div className={'Stack-Container'}>
                                <div className={'Horizontal-Flex-Container'}><GoogleIcon />Google Account</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Label'}>{email}</div>
                                    <Button filled={false} size={'small'} onClick={handleChangeEmail}>Unlink</Button>
                                </div>
                            </div>
                            <div className={'Stack-Container'}>
                                <div className={'Horizontal-Flex-Container'}><EmailIcon />Email</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Label'}>{email}</div>
                                    <Button filled={false} size={'small'} onClick={handleChangeEmail}>Change</Button>
                                </div>
                            </div>
                            <div className={'Stack-Container'}>
                                <div className={'Horizontal-Flex-Container'}>Email Password</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Label'}>Change the password you use when logging in using your email.</div>
                                    <Button filled={false} size={'small'} onClick={handleChangeEmail}>Change</Button>
                                </div>
                            </div>
                        </section>
                        <div className={styles.subSectionTitle}>Danger Zone</div>
                        <section className={`Stack-Container ${styles.subSection}`}>
                            <div className={'Stack-Container'}>
                                <div className={'Horizontal-Flex-Container'}>Delete Account</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Label'}>Delete all the data of your account.</div>
                                    <Button filled={false} size={'small'} onClick={handleChangeEmail} isWarning={true}>Delete</Button>
                                </div>
                            </div>
                            <div className={'Stack-Container'}>
                                <div className={'Horizontal-Flex-Container'}>Reset Account</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Label'}>Keep your account but delete all the task data and reset settings.</div>
                                    <Button filled={false} size={'small'} onClick={handleChangeEmail} isWarning={true}>Reset</Button>
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
                <section className={'Stack-Container BigGap'}>
                    <div className={`Horizontal-Flex-Container Title`}>General</div>
                    <div className={'Stack-Container BigGap'}>
                        <div className={'Horizontal-Flex-Container'}>App Theme</div>
                        <div className={`Horizontal-Flex-Container Space-Between`}>
                            <div className={'Label'}>The color theme the app uses.</div>
                            <div className={'Horizontal-Flex-Container'}>{themeChips.map(theme =>
                                <Chip key={theme} value={theme} selected={selectedTheme} setSelected={handleSetTheme}>{theme}</Chip>)}
                            </div>
                        </div>
                        <div className={styles.subSectionTitle}>Input Fields Default</div>
                        <section className={`Stack-Container ${styles.subSection}`}>
                            <div className={'Stack-Container'}>
                                <div className={'Horizontal-Flex-Container'}>Priority</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Label'}>The value all fields labeled priority are filled by default.</div>
                                    <TextBoxInput type={'number'} value={priority} setValue={handleSetPriority}></TextBoxInput>
                                </div>
                            </div>
                            <div className={'Stack-Container'}>
                                <div className={'Horizontal-Flex-Container'}>Number Task Step</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Label'}>The value the step field in a “number” task is filled by default.</div>
                                    <TextBoxInput type={'number'} value={step} setValue={handleSetStep}></TextBoxInput>
                                </div>
                            </div>
                            <div className={'Stack-Container'}>
                                <div className={'Horizontal-Flex-Container'}>Goal Number</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Label'}>The value the goal fields are filled by default. </div>
                                    <TextBoxInput type={'number'} value={goal} setValue={handleSetGoal}></TextBoxInput>
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
                <section className={'Stack-Container BigGap'}>
                    <div className={`Horizontal-Flex-Container Title`}>About</div>
                    <div className={'Horizontal-Flex-Container'}>App Version<div className={'Label'}>1.0</div></div>
                    <div className={'Stack-Container BigGap'}>
                        <div className={'Horizontal-Flex-Container'}>App Details</div>
                        <div className={`Horizontal-Flex-Container Space-Between`}>
                            <div className={'Label'}>Available as a Web App, on Android and on Windows.
                                You can view the source code for this app on github.</div>
                        </div>
                    </div>
                    <div className={'Stack-Container BigGap'}>
                        <div className={'Horizontal-Flex-Container'}>About the App Creator</div>
                        <div className={`Horizontal-Flex-Container Space-Between`}>
                            <div className={'Label'}>This app was created by Konstantinos Prasinos in order to create a more in depth task tracking experience.</div>
                        </div>
                        <div className={'Horizontal-Flex-Container'}>
                            <IconButton onClick={handleGithubClick}><GitHubIcon/></IconButton>
                            <IconButton onClick={handleLinkedInClick}><LinkedInIcon/></IconButton>
                            <IconButton onClick={handleTwitterClick}><TwitterIcon/></IconButton>
                        </div>
                    </div>
                </section>




                {/*<section className={'Stack-Container No-Gap'}>*/}
                {/*    <InputWrapper label={`Email (Click to ${emailVisible ? 'hide' : 'reveal'})`}>*/}
                {/*        <div className={styles.emailWrapper}>*/}
                {/*            <div className={styles.emailLeftSide} onClick={handleToggleEmail}>*/}
                {/*                {emailVisible ? email : hiddenEmail()}*/}
                {/*            </div>*/}
                {/*            <Button filled={false} size={'small'} onClick={handleChangeEmail}>Edit</Button>*/}
                {/*        </div>*/}
                {/*    </InputWrapper>*/}
                {/*    <InputWrapper label={'Log Out'}>*/}
                {/*        <Button filled={false} size={'small'} onClick={handleLogOut}>Log out</Button>*/}
                {/*    </InputWrapper>*/}
                {/*    <InputWrapper label={'Password'}>*/}
                {/*        <Button filled={false} size={'small'} onClick={handleCancelPasswordChange}>Change your Password</Button>*/}
                {/*    </InputWrapper>*/}
                {/*    <CollapsibleContainer isVisible={changePasswordVisible}>*/}
                {/*        <InputWrapper label={'Current Password'}>*/}
                {/*            <TextBoxInput width={'max'} value={currentPassword} setValue={setCurrentPassword} placeholder={'Current password'}/>*/}
                {/*        </InputWrapper>*/}
                {/*        <InputWrapper label={'New Password'} type={'vertical'}>*/}
                {/*            <TextBoxInput*/}
                {/*                width={'max'}*/}
                {/*                value={newPassword}*/}
                {/*                setValue={setNewPassword}*/}
                {/*                placeholder={'New password'}*/}
                {/*                invalid={newPassword.length ? newPasswordScore === 0 : null}*/}
                {/*            />*/}
                {/*            <PasswordStrengthBar password={newPassword} onChangeScore={handlePasswordScore} style={{padding: '0 10px', marginTop: 0}} />*/}
                {/*        </InputWrapper>*/}
                {/*        <InputWrapper>*/}
                {/*            <Button filled={false} size={'small'} onClick={handleSavePassword}>Save</Button>*/}
                {/*            <Button filled={false} size={'small'} onClick={() => setChangePasswordVisible(current => !current)}>Cancel</Button>*/}
                {/*        </InputWrapper>*/}
                {/*    </CollapsibleContainer>*/}
                {/*    <InputWrapper label={'Your Data'}>*/}
                {/*        <Button filled={false} size={'small'}>Download Data</Button>*/}
                {/*    </InputWrapper>*/}
                {/*    <InputWrapper label={'Account Removal'}>*/}
                {/*        <Button filled={false} size={'small'} isWarning={true} onClick={() => {*/}
                {/*            handleToggleDangerArea('delete');*/}
                {/*        }}>Delete Account</Button>*/}
                {/*        <Button filled={false} size={'small'} isWarning={true} onClick={() => {*/}
                {/*            handleToggleDangerArea('reset');*/}
                {/*        }}>Reset Account</Button>*/}
                {/*    </InputWrapper>*/}
                {/*    <CollapsibleContainer isVisible={dangerAreaVisible !== 'none'}>*/}
                {/*        <InputWrapper label={"Input your password to confirm"}>*/}
                {/*            <TextBoxInput width={'max'} value={currentPassword} setValue={setCurrentPassword} type={"password"} placeholder={'Current password'}/>*/}
                {/*        </InputWrapper>*/}
                {/*        <InputWrapper>*/}
                {/*            <Button filled={false} size={'small'} onClick={handleAccountRemoval}>Confirm</Button>*/}
                {/*            <Button filled={false} size={'small'} onClick={() => {*/}
                {/*                handleToggleDangerArea('none');*/}
                {/*            }}>Cancel</Button>*/}
                {/*        </InputWrapper>*/}
                {/*    </CollapsibleContainer>*/}
                {/*</section>*/}
                {/*<div className={`Headline Horizontal-Flex-Container ${styles.header}`}><PaletteIcon/>Appearance</div>*/}
                {/*<section className={'Stack-Container No-Gap'}>*/}
                {/*    <InputWrapper label={'Theme'}>*/}
                {/*        {themeChips.map(theme => <Chip key={theme} value={theme} selected={selectedTheme} setSelected={handleSetTheme}>{theme}</Chip>)}*/}
                {/*    </InputWrapper>*/}
                {/*</section>*/}
                {/*<div className={`Headline Horizontal-Flex-Container ${styles.header}`}><AutoFixNormalIcon/>Defaults</div>*/}
                {/*<section className={'Stack-Container No-Gap'}>*/}
                {/*    <InputWrapper label={'Priority'}>*/}
                {/*        <TextBoxInput type={'number'} value={priority}*/}
                {/*                      setValue={handleSetPriority}></TextBoxInput>*/}
                {/*    </InputWrapper>*/}
                {/*    <InputWrapper label={'Number Task Step'}>*/}
                {/*        <TextBoxInput type={'number'} value={step} setValue={handleSetStep}></TextBoxInput>*/}
                {/*    </InputWrapper>*/}
                {/*    <InputWrapper label={'Goal Number'}>*/}
                {/*        <TextBoxInput type={'number'} value={goal}*/}
                {/*                      setValue={handleSetGoal}></TextBoxInput>*/}
                {/*    </InputWrapper>*/}
                {/*</section>*/}
                {/*<div className={`Headline Horizontal-Flex-Container ${styles.header}`}><InfoIcon/>About</div>*/}
                {/*<InputWrapper label={'App'} type={'vertical'}>*/}
                {/*    Available as a Web App, on Android and on Windows.*/}
                {/*    You can view the source code for this app on the github page below.*/}
                {/*    <Button onClick={handleProjectClick}>Project Source Code<GitHubIcon/></Button>*/}
                {/*</InputWrapper>*/}
                {/*<InputWrapper label={'Creator'} type={'vertical'}>*/}
                {/*    This app was created by Konstantinos Prasinos.*/}
                {/*    <div className={'Horizontal-Flex-Container'}>*/}
                {/*        <IconButton onClick={handleGithubClick}><GitHubIcon/></IconButton>*/}
                {/*        <IconButton onClick={handleLinkedInClick}><LinkedInIcon/></IconButton>*/}
                {/*        <IconButton onClick={handleTwitterClick}><TwitterIcon/></IconButton>*/}
                {/*    </div>*/}
                {/*</InputWrapper>*/}
            </div>
            {Object.keys(settingsChanges).length > 0 &&
                <div className={styles.saveSettingsContainer}>
                    <Button onClick={handleSaveChanges}>Save changes</Button>
                </div>
            }
        </motion.div>
    );
};

export default Settings;
