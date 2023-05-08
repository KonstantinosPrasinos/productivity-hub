import styles from "./Settings.module.scss";
import React, {useContext, useState} from "react";
import Chip from "../../components/buttons/Chip/Chip";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import Button from "../../components/buttons/Button/Button";
import IconButton from "../../components/buttons/IconButton/IconButton";
import {UserContext} from "../../context/UserContext";
import {useAuth} from "../../hooks/useAuth";
import {useGetSettings} from "../../hooks/get-hooks/useGetSettings";
import {useChangeSettings} from "../../hooks/change-hooks/useChangeSettings";
import {AnimatePresence, motion} from "framer-motion";
import {useResetAccount} from "../../hooks/auth-hooks/useResetAccount";
import {useDeleteAccount} from "../../hooks/auth-hooks/useDeleteAccount";
import {useNavigate} from "react-router-dom";
import Modal from "../../components/containers/Modal/Modal";
import {TbBrandGithub, TbBrandTwitter, TbMail, TbBrandLinkedin, TbBrandGoogle} from "react-icons/tb";
import ToggleButton from "../../components/buttons/ToggleButton/ToggleButton";
import DropDownInput from "@/components/inputs/DropDownInput/DropDownInput";

const Settings = () => {
    const {data: settings} = useGetSettings();
    const {email, googleLinked} = useContext(UserContext).state;
    const {mutateAsync: setSettings, isError: isErrorSetSettings} = useChangeSettings();
    const {mutateAsync: resetAccount, isLoading: resetAccountLoading, isError: resetAccountError} = useResetAccount();
    const {mutateAsync: deleteAccount, isLoading: deleteAccountLoading, isError: deleteAccountError} = useDeleteAccount();

    const [selectedTheme, setSelectedTheme] = useState(settings.theme);
    const [confirmDelete, setConfirmDelete] = useState(settings.confirmDeleteTask);
    const [priority, setPriority] = useState(settings.defaults.priority)
    const [goal, setGoal] = useState(settings.defaults.goal);
    const [step, setStep] = useState(settings.defaults.step);

    const [currentPassword, setCurrentPassword] = useState('');
    const [settingsChanges, setSettingsChanges] = useState({});

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [resetModalVisible, setResetModalVisible] = useState(false);

    const {logout} = useAuth();
    const navigate = useNavigate();

    const themeChips = ['Device', 'Light', 'Dark']; // Add black
    const deleteTimeGroupActions = ["Keep repeat", "Remove repeat", "Delete them"]

    const handleSaveChanges = async () => {
        if (!isErrorSetSettings) {
            await setSettings({theme: selectedTheme, confirmDeleteTask, defaults: {step, goal, priority}});
            setSettingsChanges({});
        }
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

    const handleSetConfirmDelete = () => {
        if (settings.confirmDeleteTask !== !confirmDelete) {
            setSettingsChanges({...settingsChanges, confirmDeleteTask: !confirmDelete});
        } else {
            setSettingsChanges((current) => {
                const {confirmDelete, ...rest} = current;

                return rest;
            });
        }

        setConfirmDelete(!confirmDelete);
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
    const handleChangeEmail = () => {
        navigate('/change-email')
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

    const toggleDeleteAccountModal = () => {
        setDeleteModalVisible(current => !current);
    }
    const toggleResetAccountModal = () => {
        setResetModalVisible(current => !current);
    }

    const handleChangePasswordClick = () => {
        navigate('/reset-password');
    }

    const handleResetCancel = () => {
        setCurrentPassword('');
        setResetModalVisible(false);
    }
    const handleResetContinue = async () => {
        await resetAccount(currentPassword);
        if (!resetAccountLoading && !resetAccountError) {
            handleResetCancel();
            await handleLogOut();
        }
    }


    const handleDeleteCancel = () => {
        setCurrentPassword('');
        setDeleteModalVisible(false);
    }
    const handleDeleteContinue = async () => {
        await deleteAccount(currentPassword);
        if (!deleteAccountLoading && !deleteAccountError) {
            await handleLogOut();
        }
    }

    const checkIfContinueActive = () => {
        return currentPassword.length <= 0;
    }

    return (
        <motion.div
            className={`Rounded-Container ${styles.container} Has-Shadow`}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
        >
            <div className={`Stack-Container To-Edge ${styles.subContainer}`}>
                <section className={'Stack-Container Big-Gap'}>
                    <div className={`Headline-Large`}>Profile</div>
                    <div className={'Stack-Container Big-Gap'}>
                        <div className={'Stack-Container'}>
                            <div className={'Title-Small'}>Logout</div>
                            <div className={`Horizontal-Flex-Container Space-Between`}>
                                <div className={'Body-Small Opacity-Very-Low'}>Disconnect your account from this device.</div>
                                <Button filled={false} size={'small'} onClick={handleLogOut}>Logout</Button>
                            </div>
                        </div>
                        <div className={'Title-Large'}>Account Details</div>
                        <section className={`Stack-Container`}>
                            {googleLinked && <div className={'Stack-Container'}>
                                <div className={'Horizontal-Flex-Container Title-Small'}><TbBrandGoogle/>Google Account</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Body-Small Opacity-Very-Low'}>
                                        You are connected using a Google Account with the following email address:
                                        <br />
                                        {email}
                                    </div>
                                </div>
                            </div>}
                            {!googleLinked && <div className={'Stack-Container'}>
                                <div className={'Horizontal-Flex-Container Title-Small'}><TbMail/>Email</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Body-Small Opacity-Very-Low'}>
                                        {email}
                                        <br/>
                                        Note: if you change your email, you will be logged out.
                                    </div>
                                    <Button filled={false} size={'small'} onClick={handleChangeEmail}>Change</Button>
                                </div>
                            </div>}
                            {!googleLinked && <div className={'Stack-Container'}>
                                <div className={'Title-Small'}>Change Password</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Body-Small Opacity-Very-Low'}>
                                        Change the password you use when logging in using your email.
                                        <br/>
                                        Note: this action will log you out.
                                    </div>
                                    <Button filled={false} size={'small'} onClick={handleChangePasswordClick}>Change</Button>
                                </div>
                            </div>}
                        </section>
                        <div className={'Title-Large'}>Danger Zone</div>
                        <section className={`Stack-Container`}>
                            <div className={'Stack-Container'}>
                                <div className={'Title-Small'}>Delete Account</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Body-Small Opacity-Very-Low'}>Delete all the data of your account.</div>
                                    <Button filled={false} size={'small'} onClick={toggleDeleteAccountModal} isWarning={true}>Delete</Button>
                                </div>
                            </div>
                            <div className={'Stack-Container'}>
                                <div className={'Title-Small'}>Reset Account</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Body-Small Opacity-Very-Low'}>Keep your account but delete all the task data and reset settings.</div>
                                    <Button filled={false} size={'small'} onClick={toggleResetAccountModal} isWarning={true}>Reset</Button>
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
                <section className={'Stack-Container Big-Gap'}>
                    <div className={`Headline-Large`}>General</div>
                    <div className={'Stack-Container Big-Gap'}>
                        <div className={'Title-Small'}>App Theme</div>
                        <div className={`Horizontal-Flex-Container Space-Between`}>
                            <div className={'Body-Small Opacity-Very-Low'}>The color theme the app uses.</div>
                            <div className={'Horizontal-Flex-Container'}>{themeChips.map(theme =>
                                <Chip key={theme} value={theme} selected={selectedTheme} setSelected={handleSetTheme}>{theme}</Chip>)}
                            </div>
                        </div>

                        <div className={'Title-Small'}>Show confirm prompt on delete</div>
                        <div className={`Horizontal-Flex-Container Space-Between`}>
                            <div className={'Body-Small Opacity-Very-Low'}>
                                Show a prompt to confirm your action when deleting a task or category.
                                <br />
                                Note: regardless of this option, an undo button appears for 10 seconds after deletion.
                            </div>
                            <div className={'Horizontal-Flex-Container'}>
                                <ToggleButton isToggled={confirmDelete} setIsToggled={handleSetConfirmDelete} />
                            </div>
                        </div>
                        <div className={'Title-Small'}>Delete time-group action</div>
                        <div className={`Horizontal-Flex-Container Space-Between`}>
                            <div className={'Body-Small Opacity-Very-Low'}>
                                What happens to tasks whose time group parent is deleted
                            </div>
                            <div className={'Horizontal-Flex-Container'}>
                                <DropDownInput placeholder={"Keep repeat"}>
                                    {deleteTimeGroupActions.map(action => (action))}
                                </DropDownInput>
                            </div>
                        </div>

                        <div className={'Title-Large'}>Input Fields Default Values</div>
                        <section className={`Stack-Container`}>
                            <div className={'Stack-Container'}>
                                <div className={'Title-Small'}>Priority</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Body-Small Opacity-Very-Low'}>The value all fields labeled priority are filled by default.</div>
                                    <TextBoxInput type={'number'} value={priority} setValue={handleSetPriority}></TextBoxInput>
                                </div>
                            </div>
                            <div className={'Stack-Container'}>
                                <div className={'Title-Small'}>Number Task Step</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Body-Small Opacity-Very-Low'}>The value the step field in a “number” task is filled by default.</div>
                                    <TextBoxInput type={'number'} value={step} setValue={handleSetStep}></TextBoxInput>
                                </div>
                            </div>
                            <div className={'Stack-Container'}>
                                <div className={'Title-Small'}>Goal Number</div>
                                <div className={`Horizontal-Flex-Container Space-Between`}>
                                    <div className={'Body-Small Opacity-Very-Low'}>The value the goal fields are filled by default. </div>
                                    <TextBoxInput type={'number'} value={goal} setValue={handleSetGoal}></TextBoxInput>
                                </div>
                            </div>
                        </section>
                    </div>
                </section>
                <section className={'Stack-Container Big-Gap'}>
                    <div className={`Headline-Large`}>About</div>
                    <div className={'Title-Small'}>App Version<div className={'Body-Small Opacity-Very-Low'}>1.0</div></div>
                    <div className={'Stack-Container Big-Gap'}>
                        <div className={'Title-Small'}>App Details</div>
                        <div className={`Horizontal-Flex-Container Space-Between`}>
                            <div className={'Body-Small Opacity-Very-Low'}>
                                Available as a Web App, on Android and on Windows.
                                You can view the source code for this
                                app <a href={"https://github.com/KonstantinosPrasinos/productivity-hub"} target="_blank">on github</a>.
                            </div>
                        </div>
                    </div>
                    <div className={'Stack-Container Big-Gap'}>
                        <div className={'Title-Small'}>About the App Creator</div>
                        <div className={`Horizontal-Flex-Container Space-Between`}>
                            <div className={'Body-Small Opacity-Very-Low'}>This app was created by Konstantinos Prasinos in order to create a more in depth task tracking experience.</div>
                        </div>
                        <div className={'Horizontal-Flex-Container'}>
                            <IconButton onClick={handleGithubClick}><TbBrandGithub/></IconButton>
                            <IconButton onClick={handleLinkedInClick}><TbBrandLinkedin/></IconButton>
                            <IconButton onClick={handleTwitterClick}><TbBrandTwitter/></IconButton>
                        </div>
                    </div>
                </section>

                {/* Modal for password confirmation in order to delete account*/}
                {deleteModalVisible && <Modal isOverlay={true} dismountFunction={handleDeleteCancel}>
                    <div className={'Stack-Container Big-Gap'} >
                        <div className={'Display'}>Confirm your password</div>
                        <div className={'label'}>In order to delete your account you need to confirm your password.</div>
                        <TextBoxInput
                            type={'password'}
                            width={'max'}
                            size={'large'}
                            placeholder={'Password'}
                            value={currentPassword}
                            setValue={setCurrentPassword}
                        />
                    </div>
                    <div className={`Horizontal-Flex-Container Space-Between`}>
                        <Button
                            size={'large'}
                            filled={false}
                            onClick={handleDeleteCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            size={'large'}
                            filled={!checkIfContinueActive()}
                            onClick={handleDeleteContinue}
                            disabled={checkIfContinueActive()}
                        >
                            Continue
                        </Button>
                    </div>
                </Modal>}

                {/* Modal for password confirmation in order to reset account*/}
                {resetModalVisible && <Modal isOverlay={true} dismountFunction={handleResetCancel}>
                    <div className={'Stack-Container'} >
                        <div className={'Display'}>Confirm your password</div>
                        <div className={'label'}>In order to reset your account you need to confirm your password.</div>
                        <TextBoxInput
                            type={'password'}
                            width={'max'}
                            size={'large'}
                            placeholder={'Password'}
                            value={currentPassword}
                            setValue={setCurrentPassword}
                        />
                    </div>
                    <div className={`Horizontal-Flex-Container Space-Between`}>
                        <Button
                            size={'large'}
                            filled={false}
                            onClick={handleResetCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            size={'large'}
                            filled={!checkIfContinueActive()}
                            onClick={handleResetContinue}
                            disabled={checkIfContinueActive()}
                        >
                            Continue
                        </Button>
                    </div>
                </Modal>}
            </div>

            {/* If any changes have been made render save changes button */}
            <AnimatePresence>
                {Object.keys(settingsChanges).length > 0 &&
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className={styles.saveSettingsContainer}>
                        <Button onClick={handleSaveChanges}>Save changes</Button>
                    </motion.div>

                }
            </AnimatePresence>
        </motion.div>
    );
};

export default Settings;
