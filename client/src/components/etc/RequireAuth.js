import { Navigate, useLocation } from "react-router-dom";
import {useSelector} from "react-redux";

const RequireAuth = ({children}) => {
    const {userId} = useSelector(state => state?.user);
    const location = useLocation();

    return (userId !== null ? children : <Navigate to="/log-in" replace state={{path: location.pathname}}></Navigate>);
}
 
export default RequireAuth;