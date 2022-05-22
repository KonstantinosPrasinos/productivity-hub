import { useEffect, useRef } from "react";
import { useSelector } from 'react-redux';

const GoogleSignInButton = () => {
    const divRef = useRef();
    const isDarkMode = useSelector((state) => state.ui.isDarkMode)

    useEffect(() => {
        function handleCredentialResponse(response) {
            console.log(response);
        }
        window.google.accounts.id.initialize({
            client_id: "555171738719-1bkcdmoea6t3mvk5tiktltfoabh2ova6.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });

        window.google.accounts.id.renderButton(divRef.current, {theme: isDarkMode ? 'filled_black' : 'outline', size: 'large', shape: 'pill'})

        window.google.accounts.id.prompt();
    })

    return (<div ref={divRef}></div>);
}
 
export default GoogleSignInButton;