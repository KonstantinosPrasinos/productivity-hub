import React, {useEffect, useCallback, useRef} from 'react';
import {onUrl, start} from "@fabianlars/tauri-plugin-oauth";
import {openUrl} from "@tauri-apps/plugin-opener";
import styles from "./GoogleSignInDesktop.module.scss";
import {TbBrandGoogleFilled} from "react-icons/tb";
import {useAuth} from "@/hooks/useAuth.js";

const GoogleSignInDesktop = ({googleLoading, setGoogleLoading}) => {
  const unlistenUrl = useRef(null);
  const { loginGoogleDesktop } = useAuth();

  const handleGoogleLogin = useCallback(async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    // If the app is running in a desktop environment, use the desktop login flow
    // First create a localhost with an assigned port that acts as the redirect URI
    const port = await start();

    // Listen for redirects to this url
    unlistenUrl.current = await onUrl((url) => {
      const parsedURL = new URL(url);
      const params = new URLSearchParams(parsedURL.search);

      // Get the code from the URL parameters and pass it to the login function
      const code = params.get('code');
      loginGoogleDesktop({code, port})
    });

    // Open the Google OAuth URL in the default browser
    openUrl(`https://accounts.google.com/o/oauth2/v2/auth?scope=email%20profile&response_type=code&state=security_token%3D138r5719ru3e1%26url%3Dhttps%3A%2F%2Foauth2.example.com%2Ftoken&redirect_uri=http://localhost:${port}&client_id=${import.meta.env.VITE_DESKTOP_GOOGLE_CLIENT_ID}`);

    setGoogleLoading(false);
  }, [loginGoogleDesktop, unlistenUrl]);

  useEffect(() => {
    return () => {
      if (unlistenUrl.current) unlistenUrl.current();
    }
  }, []);

  return <div className={"Stack-Container Centered Big-Gap"}>
    <span>or</span>
    <button className={styles.googleButtonDesktop} onClick={handleGoogleLogin}>
      <TbBrandGoogleFilled />
      Sign in with Google
    </button>
  </div>
};

export default GoogleSignInDesktop;