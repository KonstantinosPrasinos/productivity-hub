import { useEffect, useRef } from "react";
import {useAuth} from "../../../hooks/useAuth";

const GoogleSignInButton = () => {
    const divRef = useRef();
    const {loginGoogle} = useAuth();

    useEffect(() => {
        const handleCredentialResponse = async (response) => {
            await loginGoogle(response);
        }
        if (window?.google) {
            window?.google?.accounts?.id?.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse
            });

            window.google.accounts.id.renderButton(divRef.current, {theme: 'outline', size: 'large', shape: 'pill'})

            window.google.accounts.id.prompt();
        }
    }, [])

    return (<div ref={divRef}></div>);
}
 
export default GoogleSignInButton;