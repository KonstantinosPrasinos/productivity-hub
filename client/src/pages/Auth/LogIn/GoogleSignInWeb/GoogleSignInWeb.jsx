import React, {useEffect, useRef, useState} from 'react';
import {useAuth} from "@/hooks/useAuth.js";
import styles from "./GoogleSignInWeb.module.scss";

const GoogleSignInWeb = ({googleLoading, setGoogleLoading}) => {
  const divRef = useRef();
  const { loginGoogle, isLoading} = useAuth();

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

    return () => {
      clearTimeout(attemptRenderGoogle)
    }; // Clear the timeout on unmount
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

export default GoogleSignInWeb;