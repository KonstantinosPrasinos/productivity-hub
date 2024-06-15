import styles from "./Settings.module.scss";
import React, { memo, useCallback, useContext, useState } from "react";
import TextBoxInput from "../../components/inputs/TextBoxInput/TextBoxInput";
import Button from "../../components/buttons/Button/Button";
import { UserContext } from "../../context/UserContext";
import { useAuth } from "../../hooks/useAuth";
import { useGetSettings } from "../../hooks/get-hooks/useGetSettings";
import { useChangeSettings } from "../../hooks/change-hooks/useChangeSettings";
import { AnimatePresence, motion } from "framer-motion";
import { useResetAccount } from "../../hooks/auth-hooks/useResetAccount";
import { useDeleteAccount } from "../../hooks/auth-hooks/useDeleteAccount";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/containers/Modal/Modal";
import {
  TbBrandGithub,
  TbBrandLinkedin,
  TbChevronRight,
  TbLogout,
  TbDeviceFloppy,
} from "react-icons/tb";
import ToggleButton from "../../components/buttons/ToggleButton/ToggleButton";
import DropDownInput from "@/components/inputs/DropDownInput/DropDownInput";

const SettingsTile = memo(
  ({ onClick, title, description, children, isWarning = false }) => {
    if (onClick)
      return (
        <button
          onClick={onClick}
          className={`${styles.tile} ${isWarning ? styles.isWarning : ""}`}
        >
          <div className={styles.tileText}>
            <span className={styles.tileTitle}>{title}</span>
            <span className={styles.tileDescription}>{description}</span>
          </div>
          <div className={styles.tileAction}>{children}</div>
        </button>
      );
    return (
      <div className={`${styles.tile} ${isWarning ? styles.isWarning : ""}`}>
        <div className={styles.tileText}>
          <span className={styles.tileTitle}>{title}</span>
          <span className={styles.tileDescription}>{description}</span>
        </div>
        <div className={styles.tileAction}>{children}</div>
      </div>
    );
  }
);

const ThemeTile = memo(({ selectedTheme, setSelectedTheme }) => {
  const setLightTheme = useCallback(() => {
    setSelectedTheme("Light");
  }, [setSelectedTheme]);

  const setDarkTheme = useCallback(() => {
    setSelectedTheme("Dark");
  }, [setSelectedTheme]);

  const setDeviceTheme = useCallback(() => {
    setSelectedTheme("Device");
  }, [setSelectedTheme]);

  return (
    <div className={styles.themeSelector}>
      <button className={styles.themeButton} onClick={setDeviceTheme}>
        <div className={`${styles.themeButtonDecoration}`}>
          <div
            className={`${styles.deviceThemeDecoration} ${styles.deviceThemeLight}`}
          >
            <div className={styles.themeDecorationContainer}>
              <div className={styles.themeDecorationText}></div>
              <div className={styles.themeDecorationCheckbox}></div>
            </div>
          </div>
          <div
            className={`${styles.deviceThemeDecoration} ${styles.deviceThemeDark}`}
          >
            <div className={styles.themeDecorationContainer}>
              <div className={styles.themeDecorationText}></div>
              <div className={styles.themeDecorationCheckbox}></div>
            </div>
          </div>
        </div>
        <div
          className={`${styles.themeButtonLabel} ${
            selectedTheme === "Device" ? styles.selected : ""
          }`}
        >
          Device
        </div>
      </button>
      <button className={styles.themeButton} onClick={setLightTheme}>
        <div className={`${styles.themeButtonDecoration} ${styles.lightMode}`}>
          <div className={styles.themeDecorationContainer}>
            <div className={styles.themeDecorationText}></div>
            <div className={styles.themeDecorationCheckbox}></div>
          </div>
        </div>
        <div
          className={`${styles.themeButtonLabel} ${
            selectedTheme === "Light" ? styles.selected : ""
          }`}
        >
          Light
        </div>
      </button>
      <button className={styles.themeButton} onClick={setDarkTheme}>
        <div className={`${styles.themeButtonDecoration} ${styles.darkMode}`}>
          <div className={styles.themeDecorationContainer}>
            <div className={styles.themeDecorationText}></div>
            <div className={styles.themeDecorationCheckbox}></div>
          </div>
        </div>
        <div
          className={`${styles.themeButtonLabel} ${
            selectedTheme === "Dark" ? styles.selected : ""
          }`}
        >
          Dark
        </div>
      </button>
    </div>
  );
});

const deleteTimeGroupActions = [
  { display: "Keep repeat", actual: "Keep their repeat details" },
  { display: "Remove repeat", actual: "Remove their repeat details" },
  { display: "Delete them", actual: "Delete them" },
];

const Settings = () => {
  const { data: settings } = useGetSettings();

  const getDeleteActionDefault = useCallback(() => {
    for (const action of deleteTimeGroupActions) {
      if (action.actual === settings.defaults.deleteGroupAction) return action;
    }

    return deleteTimeGroupActions[0];
  }, [settings]);

  const { email, googleLinked } = useContext(UserContext).state;
  const { mutateAsync: setSettings, isError: isErrorSetSettings } =
    useChangeSettings();
  const {
    mutateAsync: resetAccount,
    isLoading: resetAccountLoading,
    isError: resetAccountError,
  } = useResetAccount();
  const {
    mutateAsync: deleteAccount,
    isLoading: deleteAccountLoading,
    isError: deleteAccountError,
  } = useDeleteAccount();

  const [selectedTheme, setSelectedTheme] = useState(settings.theme);
  const [confirmDelete, setConfirmDelete] = useState(settings.confirmDelete);
  const [deleteAction, setDeleteAction] = useState(getDeleteActionDefault());
  const [priority, setPriority] = useState(settings.defaults.priority);
  const [goal, setGoal] = useState(settings.defaults.goal);
  const [step, setStep] = useState(settings.defaults.step);

  const [currentPassword, setCurrentPassword] = useState("");
  const [settingsChanges, setSettingsChanges] = useState({});

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSaveChanges = useCallback(async () => {
    if (!isErrorSetSettings) {
      let tempDeleteAction;

      if (typeof deleteAction === "string") {
        tempDeleteAction = deleteAction;
      } else {
        tempDeleteAction = deleteAction.actual;
      }

      await setSettings({
        theme: selectedTheme,
        confirmDelete,
        defaults: { step, goal, priority, deleteGroupAction: tempDeleteAction },
      });
      setSettingsChanges({});
    }
  }, [
    isErrorSetSettings,
    deleteAction,
    setSettings,
    selectedTheme,
    confirmDelete,
    step,
    goal,
    priority,
    setSettingsChanges,
  ]);

  const handleSetTheme = useCallback(
    (e) => {
      if (selectedTheme !== e) {
        setSelectedTheme(e);
      }
      if (settings.theme !== e) {
        setSettingsChanges({ ...settingsChanges, theme: e });
      } else {
        setSettingsChanges((current) => {
          const { theme, ...rest } = current;

          return rest;
        });
      }
    },
    [selectedTheme, setSelectedTheme, setSettingsChanges, settings]
  );

  const handleSetConfirmDelete = useCallback(() => {
    if (settings.confirmDelete !== !confirmDelete) {
      setSettingsChanges({ ...settingsChanges, confirmDelete: !confirmDelete });
    } else {
      setSettingsChanges((current) => {
        const { confirmDelete, ...rest } = current;

        return rest;
      });
    }

    setConfirmDelete(!confirmDelete);
  }, [settings, confirmDelete, setSettingsChanges]);

  const handleSetDeleteAction = useCallback(
    (action) => {
      if (settings.defaults.deleteGroupAction !== action.actual) {
        setSettingsChanges({
          ...settingsChanges,
          deleteGroupAction: action.actual,
        });
      } else {
        setSettingsChanges((current) => {
          const { deleteGroupAction, ...rest } = current;

          return rest;
        });
      }
      setDeleteAction(action);
    },
    [setSettingsChanges, setDeleteAction, settings]
  );

  const handleSetPriority = useCallback(
    (e) => {
      setPriority(e);
      if (e != settings.defaults.priority) {
        setSettingsChanges({ ...settingsChanges, priority: e });
      } else {
        setSettingsChanges((current) => {
          const { priority, ...rest } = current;

          return rest;
        });
      }
    },
    [setPriority, setSettingsChanges, settings]
  );

  const handleSetStep = useCallback(
    (e) => {
      setStep(e);
      if (e != settings.defaults.step) {
        setSettingsChanges({ ...settingsChanges, step: e });
      } else {
        setSettingsChanges((current) => {
          const { step, ...rest } = current;

          return rest;
        });
      }
    },
    [setStep, setSettingsChanges, settings]
  );

  const handleSetGoal = useCallback(
    (e) => {
      setGoal(e);
      if (e != settings.defaults.goal) {
        setSettingsChanges({ ...settingsChanges, goal: e });
      } else {
        setSettingsChanges((current) => {
          const { goal, ...rest } = current;

          return rest;
        });
      }
    },
    [setGoal, setSettingsChanges, settings]
  );

  const handleChangeEmail = useCallback(() => {
    navigate("/change-email");
  }, [navigate]);

  const toggleDeleteAccountModal = useCallback(() => {
    setDeleteModalVisible((current) => !current);
  }, [setDeleteModalVisible]);

  const toggleResetAccountModal = useCallback(() => {
    setResetModalVisible((current) => !current);
  }, [setResetModalVisible]);

  const handleChangePasswordClick = useCallback(() => {
    navigate("/reset-password");
  }, [navigate]);

  const handleResetCancel = useCallback(() => {
    setCurrentPassword("");
    setResetModalVisible(false);
  }, [setCurrentPassword, setResetModalVisible]);

  const handleResetContinue = useCallback(async () => {
    await resetAccount(currentPassword);
    if (!resetAccountLoading && !resetAccountError) {
      handleResetCancel();
      await logout();
    }
  }, [
    handleResetCancel,
    resetAccount,
    logout,
    resetAccountLoading,
    resetAccountError,
  ]);

  const handleDeleteCancel = useCallback(() => {
    setCurrentPassword("");
    setDeleteModalVisible(false);
  }, [setCurrentPassword, setDeleteModalVisible]);

  const handleDeleteContinue = useCallback(async () => {
    await deleteAccount(currentPassword);
    if (!deleteAccountLoading && !deleteAccountError) {
      await logout();
    }
  }, [
    deleteAccount,
    currentPassword,
    deleteAccountLoading,
    deleteAccountError,
    logout,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.settingsGroup}>
        <span className={styles.tileGroupTitle}>Account</span>
        <div className={styles.tileGroup}>
          <SettingsTile title={"Logout"} onClick={logout}>
            <TbLogout />
          </SettingsTile>
          {!googleLinked && (
            <>
              <SettingsTile
                title={"Change email"}
                description={email}
                onClick={handleChangeEmail}
              >
                <TbChevronRight />
              </SettingsTile>
              <SettingsTile
                title={"Change password"}
                onClick={handleChangePasswordClick}
              >
                <TbChevronRight />
              </SettingsTile>
            </>
          )}
          {googleLinked && (
            <SettingsTile
              title={"Google account email"}
              description={email}
            ></SettingsTile>
          )}
        </div>
        <div className={styles.tileGroup}>
          <SettingsTile
            title={"Reset account"}
            isWarning={true}
            onClick={toggleResetAccountModal}
          >
            <TbChevronRight />
          </SettingsTile>
          <SettingsTile
            title={"Delete account"}
            isWarning={true}
            onClick={toggleDeleteAccountModal}
          >
            <TbChevronRight />
          </SettingsTile>
        </div>
      </div>
      <div className={styles.settingsGroup}>
        <span className={styles.tileGroupTitle}>General</span>
        <div className={styles.tileGroup}>
          <ThemeTile
            selectedTheme={selectedTheme}
            setSelectedTheme={handleSetTheme}
          />
        </div>
        <div className={styles.tileGroup}>
          <SettingsTile title={"Confirm delete"}>
            <ToggleButton
              isToggled={confirmDelete}
              setIsToggled={handleSetConfirmDelete}
            />
          </SettingsTile>
          <SettingsTile title={"Category delete action"}>
            <DropDownInput
              placeholder={"Keep repeat"}
              selected={deleteAction.display}
            >
              {deleteTimeGroupActions.map((action) => (
                <button
                  key={action.display}
                  className={"DropDownOption"}
                  onClick={() => handleSetDeleteAction(action)}
                >
                  {action.display}
                </button>
              ))}
            </DropDownInput>
          </SettingsTile>
        </div>
        <div className={styles.tileGroup}>
          <SettingsTile title={"Priority default value"}>
            <TextBoxInput
              type={"number"}
              value={priority}
              setValue={handleSetPriority}
            />
          </SettingsTile>
          <SettingsTile title={"Number task default step"}>
            <TextBoxInput
              type={"number"}
              value={step}
              setValue={handleSetStep}
            />
          </SettingsTile>
          <SettingsTile title={"Default goal value"}>
            <TextBoxInput
              type={"number"}
              value={goal}
              setValue={handleSetGoal}
            />
          </SettingsTile>
        </div>
      </div>
      <div className={styles.settingsGroup}>
        <span className={styles.tileGroupTitle}>Keyboard shortcuts</span>
        <div className={styles.tileGroup}>
          <SettingsTile title={"Create new task"}>
            <div className={"Horizontal-Flex-Container Small-Gap"}>
              <div className={styles.emptyChip}>Ctrl</div>
              <div className={styles.emptyChip}>Enter</div>
            </div>
          </SettingsTile>
          <SettingsTile title={"Create new category"}>
            <div className={"Horizontal-Flex-Container Small-Gap"}>
              <div className={styles.emptyChip}>Ctrl</div>
              <div className={styles.emptyChip}>\</div>
            </div>
          </SettingsTile>
          <SettingsTile title={"Close all pages"}>
            <div className={styles.emptyChip}>Esc</div>
          </SettingsTile>
        </div>
      </div>
      <div className={styles.settingsGroup}>
        <span className={styles.tileGroupTitle}>About</span>
        <div className={styles.tileGroup}>
          <SettingsTile title={"App version"}>1.0</SettingsTile>
          <SettingsTile title={"View the source code for this app on GitHub"}>
            <a
              href={"https://github.com/KonstantinosPrasinos/productivity-hub"}
              target="_blank"
              className={styles.githubLink}
            >
              <TbBrandGithub />
            </a>
          </SettingsTile>
          <SettingsTile title={"Created by Konstantinos Prasinos"}>
            <a
              href={"https://github.com/KonstantinosPrasinos/"}
              target="_blank"
              className={styles.githubLink}
            >
              <TbBrandLinkedin />
            </a>
          </SettingsTile>
        </div>
      </div>
      {deleteModalVisible && (
        <Modal isOverlay={true} dismountFunction={handleDeleteCancel}>
          <div className={"Stack-Container Big-Gap"}>
            <div className={"Display"}>Confirm your password</div>
            <div className={"label"}>
              In order to delete your account you need to confirm your password.
            </div>
            <TextBoxInput
              type={"password"}
              width={"max"}
              size={"large"}
              placeholder={"Password"}
              value={currentPassword}
              setValue={setCurrentPassword}
            />
          </div>
          <div
            className={`Horizontal-Flex-Container Space-Between Flex-Wrap Big-Gap ${styles.inputsBody}`}
          >
            <Button size={"large"} filled={false} onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button
              size={"large"}
              filled={!(currentPassword.length <= 0)}
              onClick={handleDeleteContinue}
              disabled={currentPassword.length <= 0}
            >
              Continue
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal for password confirmation in order to reset account*/}
      {resetModalVisible && (
        <Modal isOverlay={true} dismountFunction={handleResetCancel}>
          <div className={"Stack-Container"}>
            <div className={"Display"}>Confirm your password</div>
            <div className={"label"}>
              In order to reset your account you need to confirm your password.
            </div>
            <TextBoxInput
              type={"password"}
              width={"max"}
              size={"large"}
              placeholder={"Password"}
              value={currentPassword}
              setValue={setCurrentPassword}
            />
          </div>
          <div
            className={`Horizontal-Flex-Container Space-Between Flex-Wrap Big-Gap ${styles.inputsBody}`}
          >
            <Button size={"large"} filled={false} onClick={handleResetCancel}>
              Cancel
            </Button>
            <Button
              size={"large"}
              filled={!(currentPassword.length <= 0)}
              onClick={handleResetContinue}
              disabled={currentPassword.length <= 0}
            >
              Continue
            </Button>
          </div>
        </Modal>
      )}
      <AnimatePresence>
        {Object.keys(settingsChanges).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.saveSettingsContainer}
          >
            <Button onClick={handleSaveChanges} symmetrical>
              <TbDeviceFloppy />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
