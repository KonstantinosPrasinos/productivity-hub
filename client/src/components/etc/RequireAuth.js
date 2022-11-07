import { Navigate, useLocation } from "react-router-dom";
import {useContext} from "react";
import {UserContext} from "../../context/UserContext";

const RequireAuth = ({children}) => {
    const user = useContext(UserContext).state;
    const location = useLocation();

    return (user?.id ? children : <Navigate to="/log-in" replace state={{path: location.pathname}}></Navigate>);
}
 
export default RequireAuth;