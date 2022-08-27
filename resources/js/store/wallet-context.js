import { useContext, createContext, useState } from "react";
import { getLightAccount, getLightBalances } from "../sdk/accountSDK";
import ProtonSDK from "../sdk/ProtonSDK";
import AuthContext from "./auth-context";
const WalletContext = createContext({
    balances: [],
    link: {},
    session: {},
    setBalances: (balances) => {},
    protonConnection: () => {},
    logout: () => {},
    restoreSession: () => {},
});

export function WalletContextProvider({ children }) {
    const proton = new ProtonSDK();
    const [balances, setBalances] = useState([]);
    const [link, setLink] = useState();
    const [session, setSession] = useState();
    const ctx = useContext(AuthContext);
    const logout = async () => {
        await proton.logout();
    };
    const protonConnection = async () => {
        const customStyleOptions = {
            modalBackgroundColor: "#0d0d0d",
            logoBackgroundColor: "#0d0d0d",
            isLogoRound: true,
            optionBackgroundColor: "#1A1A1A",
            optionFontColor: "#b4b4b4",
            primaryFontColor: "white",
            secondaryFontColor: "#acacac",
            linkColor: "#FF771D",
        };
        // usage login()
        try {
            const { auth, link, session } = await proton.login(
                customStyleOptions
            );
            setLink(link);
            setSession(session);
            ctx.loginHandler(auth);
            var balances = await getLightBalances(auth.actor.toString());
            setBalances(balances);
            return { auth: auth, link: link, session: session };
        } catch (ex) {
            // login failed
            console.warn("Error", ex.message);
        }
    };
    const restoreSession = async () => {
        const { auth, link, session } = await proton.restoreSession();
        if (auth.actor) {
            setLink(link);
            setSession(session);
            ctx.loginHandler(auth);
            var balances = await getLightBalances(auth.actor.toString());
            setBalances(balances);
        }

        return { auth: auth, link: link, session: session };
    };
    const contextValue = {
        balances: balances,
        setBalances: setBalances,
        protonConnection: protonConnection,
        restoreSession: restoreSession,
        logout: logout,
        link: link,
        session: session,
    };

    return (
        <WalletContext.Provider value={contextValue}>
            {children}
        </WalletContext.Provider>
    );
}

export default WalletContext;
