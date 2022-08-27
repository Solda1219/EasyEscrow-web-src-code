import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import AuthContext from "../store/auth-context";
import Button from "./ui/Button";
import Logo from "../../images/logo.svg";
import hamburger from "../../images/hamburger.svg";
import Dropdown from "./ui/Dropdown";

import WalletContext from "../store/wallet-context";

const Header = (props) => {
    // const [protonData, setProtonData] = useState({
    //     auth: undefined,
    //     accountData: undefined,
    //     balances: undefined,
    // });
    const ctx = useContext(AuthContext);
    const walletCtx = useContext(WalletContext);
    const [protonInfo, showProtonInfo] = useState(false);

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const navMenu = useRef(null);

    const toggleMenu = () => {
        const el = document.getElementsByClassName("nav-wrap")[0];
        el.classList.toggle("show");
    };

    useEffect(() => {
        (async () => {
            const { auth } = await walletCtx.restoreSession();
            // return setProtonData({
            //     auth: auth.actor,
            // });
        })();
        function handleClickOutside(event) {
            if (
                navMenu.current &&
                !navMenu.current.contains(event.target) &&
                event.target.className !== "hamburger-icon"
            ) {
                const el = document.getElementsByClassName("nav-wrap")[0];
                el.classList.remove("show");
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [navMenu]);

    //Function for logout
    const handleLogout = async () => {
        await walletCtx.logout();
        navigate("/");
        ctx.logoutHandler();
        // return setProtonData({
        //     auth: undefined,
        // });
        // setLoading(true);
        // fetch(`${process.env.MIX_API_URL}/user/logout`, {
        //     method: "POST",
        //     headers: {
        //         Authorization: "Bearer " + ctx.token,
        //         "Content-Type": "application/json",
        //     },
        // })
        //     .then((response) => {
        //         if (response.ok) return response.json();
        //         throw response.status + ": " + response.statusText;
        //     })
        //     .then((data) => {
        //         //console.log(data);
        //         if (data.valid) {
        //             navigate("/");
        //             ctx.logoutHandler();
        //         } else {
        //             console.log(data);
        //         }
        //         setLoading(false);
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //         setLoading(false);
        //     });
    };

    return (
        <header className="container">
            <Link to="/">
                <img src={Logo} alt="EasyEscrow.io" />
            </Link>

            <div className="hamburger-menu">
                <img
                    src={hamburger}
                    alt=""
                    onClick={toggleMenu}
                    className="hamburger-icon"
                />
            </div>

            <div
                className={`nav-wrap ${
                    ctx.isLoggedIn ? "user-in" : "user-out"
                }`}
                ref={navMenu}
            >
                <nav>
                    <ul>
                        <li>
                            <NavLink to="/exchange">Crypto Exchange</NavLink>
                        </li>

                        <li>
                            <NavLink to="/gift">Crypto Gift</NavLink>
                        </li>
                        <li>
                            <NavLink to="/purchase">Purchase an Item </NavLink>
                        </li>
                        <li>
                            <NavLink to="/service">Purchase a Service</NavLink>
                        </li>
                        <li>
                            <NavLink to="/contest">Pool / Contest</NavLink>
                        </li>
                        {/* <li className="separator">
                            <NavLink to="/transactions">Transactions</NavLink>
                        </li> */}
                    </ul>
                </nav>
                {!ctx.isLoggedIn && (
                    <button
                        className="btn"
                        onClick={async () => await walletCtx.protonConnection()}
                    >
                        Log into Wallet
                    </button>
                )}
                {ctx.isLoggedIn && (
                    <div className="user-menu">
                        <div className="user-header">
                            <span>{ctx.walletName}</span>
                        </div>
                        <div className="user-dropdown">
                            <div className="subnav-link">
                                <NavLink to="/transactions">
                                    Transactions
                                </NavLink>
                            </div>
                            <div className="subnav-link">
                                <NavLink to="/token">$EASY Token</NavLink>
                            </div>
                            <span
                                className="user-logout"
                                onClick={async () => await handleLogout()}
                            >
                                Logout
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
