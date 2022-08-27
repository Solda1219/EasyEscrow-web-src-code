import { Fragment, useContext } from "react";
import aboutImg from "../../images/about-img.png";
import iconCreate from "../../images/icon-proton.svg";
import iconConnect from "../../images/icon-escrow.svg";
import iconPortfolio from "../../images/icon-instructions.svg";
import WalletContext from "../store/wallet-context";
import AuthContext from "../store/auth-context";

const Home = () => {
    const ctx = useContext(AuthContext);
    const walletCtx = useContext(WalletContext);

    return (
        <Fragment>
            <section className="banner">
                <div className="container">
                    <h1>Blockchain based trading center.</h1>
                </div>
            </section>

            <section className="about">
                <div className="container">
                    <div className="info">
                        <h2>About Easy Escrow</h2>
                        <p>
                            Easy Escrow is a blockchain based trading center
                            controlled by smart contracts. 2 or more parties can
                            enter items to trade into the smart contract and
                            when all terms are met the contract performs and the
                            items are traded. This could be as simple as a
                            payment for a service or item or as complex as a
                            real estate transaction.
                        </p>
                    </div>
                    <img src={aboutImg} alt="" className="about-img" />
                </div>
            </section>

            <section className="instructions">
                <div className="container">
                    <div className="info">
                        <h2>How To Get Started</h2>
                        <p>
                            Simply log in with your WebAuth.com wallet, choose
                            an escrow type from the top menu, and follow the
                            simple instructions.
                        </p>
                        {!ctx.isLoggedIn && (
                            <button
                                className="btn"
                                onClick={async () =>
                                    await walletCtx.protonConnection()
                                }
                            >
                                Get Started
                            </button>
                        )}
                    </div>
                    <ul>
                        <li>
                            <img src={iconCreate} alt="" />
                            <div>
                                <h3>Create a WebAuth.com account or log in</h3>
                            </div>
                        </li>
                        <li>
                            <img src={iconConnect} alt="" />
                            <div>
                                <h3>Choose an Escrow Type from the top menu</h3>
                            </div>
                        </li>
                        <li>
                            <img src={iconPortfolio} alt="" />
                            <div>
                                <h3>
                                    Enter the required information and follow
                                    the simple instructions
                                </h3>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>
        </Fragment>
    );
};

export default Home;
