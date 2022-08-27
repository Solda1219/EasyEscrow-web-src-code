import { createContext, useEffect, useState } from "react";

const AuthContext = createContext({
    auth: { actor: "", permission: "" },
    walletName: "",
    isLoggedIn: false,
    loginHandler: (auth) => {},
    logoutHandler: () => {},
});

export function AuthContextProvider({ children }) {
    const [auth, setAuth] = useState(undefined);
    const initialToken = localStorage.getItem("wallet");
    const [wallet, setWallet] = useState(initialToken);
    const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);

    let loading = initialToken == undefined ? false : true;

    const logoutHandler = () => {
        setWallet(null);
        localStorage.removeItem("wallet");
        setUserIsLoggedIn(false);
    };

    const loginHandler = (auth) => {
        setWallet(auth.actor.toString());
        setAuth(auth);
        localStorage.setItem("wallet", auth.actor.toString());
        setUserIsLoggedIn(true);
        loading = false;
    };

    useEffect(() => {
        if (wallet !== null)
            // getUser(token);
            setUserIsLoggedIn(true);
    }, []);

    const getUser = (tokenId) => {
        loading = true;
        fetch(`${process.env.MIX_API_URL}/user/getuser`, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + tokenId,
            },
        })
            .then((response) => {
                if (response.ok) return response.json();
                throw response.status + ": " + response.statusText;
            })
            .then((data) => {
                setUserIsLoggedIn(true);
                setUser(data);
                loading = false;
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const contextValue = {
        auth: auth,
        walletName: wallet,
        isLoggedIn: userIsLoggedIn,
        loading: loading,
        loginHandler: loginHandler,
        logoutHandler: logoutHandler,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
