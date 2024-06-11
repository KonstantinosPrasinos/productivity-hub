import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./LogIn.module.scss";
import Button from "../../../components/buttons/Button/Button";
import TextBoxInput from "../../../components/inputs/TextBoxInput/TextBoxInput";
import CollapsibleContainer from "../../../components/containers/CollapsibleContainer/CollapsibleContainer";
import { useNavigate } from "react-router-dom";
import { AlertsContext } from "../../../context/AlertsContext";
import SwitchContainer from "../../../components/containers/SwitchContainer/SwitchContainer";
import { useVerify } from "../../../hooks/useVerify";
import TextButton from "../../../components/buttons/TextButton/TextButton";
import { useAuth } from "../../../hooks/useAuth";
import { UserContext } from "../../../context/UserContext";
import Modal from "../../../components/containers/Modal/Modal";
import LoadingIndicator from "@/components/indicators/LoadingIndicator/LoadingIndicator.jsx";
import PasswordStrengthBar from "@/components/indicators/PasswordStrengthBar/PasswordStrengthBar.jsx";

const GoogleSignInButton = ({ googleLoading, setGoogleLoading }) => {
  const divRef = useRef();
  const { loginGoogle, isLoading } = useAuth();

  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    if (isLoading !== googleLoading) {
      setGoogleLoading(isLoading);
    }
  }, [isLoading]);

  useEffect(() => {
    const handleCredentialResponse = async (response) => {
      await loginGoogle(response);
    };

    const attemptRenderGoogle = () => {
      if (window?.google) {
        setIsGoogleLoaded(true);

        window?.google?.accounts?.id?.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(divRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
        });

        window.google.accounts.id.prompt();
      } else {
        // Sometimes it doesn't load instantly for some reason so try again after 200ms
        setTimeout(attemptRenderGoogle, 200);
      }
    };

    attemptRenderGoogle();

    return () => clearTimeout(attemptRenderGoogle); // Clear the timeout on unmount
  }, []);

  return (
    <div
      className={`${styles.googleContainer} ${
        isGoogleLoaded ? styles.googleVisible : ""
      }`}
    >
      or
      <div ref={divRef}></div>
    </div>
  );
};

const LogIn = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { login, register, isLoading } = useAuth();
  const {
    verifyEmail,
    isLoading: isLoadingVerify,
    resendEmailCode,
  } = useVerify();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const alertsContext = useContext(AlertsContext);
  const user = useContext(UserContext).state;
  const navigate = useNavigate();

  const handleChangeAction = useCallback(() => {
    if (!isSigningUp) {
      setIsSigningUp(true);
    } else {
      setRepeatPassword("");
      setIsSigningUp(false);
    }
  }, [isSigningUp, setIsSigningUp, setRepeatPassword]);

  const handleContinue = async () => {
    // selected tab 0 is login and register, selected tab 1 is verify email
    if (selectedTab === 0) {
      if (!isSigningUp) {
        // Attempt log in
        await login(email, password);
      } else {
        // Attempt sign up
        if (passwordScore > 1) {
          if (password === repeatPassword) {
            const response = await register(email, password);

            if (response) {
              setSelectedTab(1);
            }
          } else {
            alertsContext.dispatch({
              type: "ADD_ALERT",
              payload: {
                type: "error",
                title: "Passwords don't match",
                message: "The password and repeat password fields must match.",
              },
            });
          }
        } else {
          alertsContext.dispatch({
            type: "ADD_ALERT",
            payload: {
              type: "error",
              title: "Email is Invalid",
              message: "Please enter a valid email address.",
            },
          });
        }
      }
    } else if (selectedTab === 1) {
      if (await verifyEmail(email, verificationCode)) {
        // Attempt verify email
        setSelectedTab(0);
        setIsSigningUp(false);
        setEmail("");
        setPassword("");
        setRepeatPassword("");
      }
    }
  };

  const handleVerificationCode = useCallback(
    (e) => {
      if (e.length <= 6) {
        setVerificationCode(e);
      }
    },
    [setVerificationCode]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.code === "Enter") {
        handleContinue();
      }
    },
    [handleContinue]
  );

  const handleResendCode = useCallback(async () => {
    await resendEmailCode(email);
  }, [email, resendEmailCode]);

  const handleVerificationContinue = () => {
    if (verificationCode.length === 6) {
      handleContinue();
    } else {
      setVerificationCode("");
      setIsSigningUp(false);
      setSelectedTab(0);
    }
  };

  const handleForgotPassword = useCallback(() => {
    navigate("/reset-password");
  }, [navigate]);

  useEffect(() => {
    if (!isLoading && !isLoadingVerify) {
      if (user?.id) {
        navigate("/");
      }
    }
  }, [user, navigate, isLoading, isLoadingVerify]);

  return (
    <Modal isPortal={false}>
      <SwitchContainer selectedTab={selectedTab}>
        <div className={styles.container}>
          <div className={"Display"}>Welcome to Productivity Hub</div>
          <TextBoxInput
            type={"email"}
            width={"max"}
            size={"large"}
            placeholder={"Email address"}
            value={email}
            setValue={setEmail}
          />
          <TextBoxInput
            type={"password"}
            width={"max"}
            size={"large"}
            placeholder={"Password"}
            value={password}
            setValue={setPassword}
            onKeydown={handleKeyDown}
          />
          <CollapsibleContainer isVisible={isSigningUp} hasBorder={false}>
            <PasswordStrengthBar
              password={password}
              passwordScore={passwordScore}
              setPasswordScore={setPasswordScore}
            />
            <TextBoxInput
              type={"password"}
              width={"max"}
              size={"large"}
              placeholder={"Repeat password"}
              value={repeatPassword}
              setValue={setRepeatPassword}
              onKeydown={handleKeyDown}
            />
          </CollapsibleContainer>
          <div
            className={`Horizontal-Flex-Container Space-Between ${styles.buttonContainer}`}
          >
            <Button size={"small"} filled={false} onClick={handleChangeAction}>
              {!isSigningUp ? "Register" : "Log in"}
            </Button>
            <Button
              size={"small"}
              filled={false}
              onClick={handleForgotPassword}
            >
              Forgot password
            </Button>
          </div>
          <Button
            filled={true}
            width={"max"}
            size={"large"}
            onClick={handleContinue}
          >
            {!isLoading &&
              !googleLoading &&
              (!isSigningUp ? "Log in" : "Register")}
            {(isLoading || googleLoading) && (
              <LoadingIndicator
                size={"inline"}
                type={"dots"}
                invertColors={true}
              />
            )}
          </Button>
          <GoogleSignInButton
            googleLoading={googleLoading}
            setGoogleLoading={setGoogleLoading}
          />
        </div>
        <div className={`${styles.container} ${styles.spaceBetween}`}>
          <div className={"Display"}>We sent you a code</div>
          <div className={"Label"}>
            If the email you entered exists, is should receive a verification
            code.
            <br />
            Enter the code below to verify your email.
          </div>
          <div>
            <TextBoxInput
              width={"max"}
              size={"large"}
              placeholder={"Verification code"}
              value={verificationCode}
              setValue={handleVerificationCode}
              onKeydown={handleKeyDown}
            />
            <TextButton onClick={handleResendCode}>
              Didn't receive code?
            </TextButton>
          </div>
          <Button
            width={"max"}
            size={"large"}
            filled={verificationCode.length === 6}
            onClick={handleVerificationContinue}
          >
            {!isLoadingVerify &&
              (verificationCode.length === 6 ? "Continue" : "Cancel")}
            {isLoadingVerify && (
              <LoadingIndicator
                size={"inline"}
                type={"dots"}
                invertColors={true}
              />
            )}
          </Button>
        </div>
      </SwitchContainer>
    </Modal>
  );
};

export default LogIn;
