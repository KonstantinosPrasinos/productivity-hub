import { Navigate, useLocation } from "react-router-dom";

const RequireAuth = ({children}) => {
    const authed = true; //need to make into hook after, make false to hide log in page
    const location = useLocation();

    return (authed ? children : <Navigate to="/log-in" replace state={{path: location.pathname}}></Navigate>);
}
 
export default RequireAuth;