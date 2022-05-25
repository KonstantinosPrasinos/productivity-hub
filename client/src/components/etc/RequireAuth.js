import { Navigate, useLocation } from "react-router-dom";

const RequireAuth = ({children}) => {
    const isLoggedIn = true;
    const location = useLocation();

    return (isLoggedIn ? children : <Navigate to="/log-in" replace state={{path: location.pathname}}></Navigate>);
}
 
export default RequireAuth;