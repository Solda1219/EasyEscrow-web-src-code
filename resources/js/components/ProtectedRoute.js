import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../store/auth-context";


const ProtectedRoute = ({ children }) => {
    const ctx = useContext(AuthContext);
    //console.log(window.location.pathname);

    if (!ctx.isLoggedIn) {
        return <Navigate to="/" />;
    }
    return children;
};

export default ProtectedRoute;
