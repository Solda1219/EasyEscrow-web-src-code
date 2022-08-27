import { Fragment, useContext, useState, useEffect } from "react";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import AuthContext from "../store/auth-context";

import Dropdown from "../components/ui/CurrencyDropdown";
import { currencies } from "../constants/CurrencyList";
import WalletContext from "../store/wallet-context";
import {
    startPool,
    fetchEscrows,
    fillEscrow,
    partakePool,
    fillPool,
    cancelPool,
} from "../sdk/easypoolSDK";
import { useNavigate } from "react-router-dom";

const Contest = () => {
    const navigate = useNavigate();
    const ctx = useContext(AuthContext);
    const walletCtx = useContext(WalletContext);
    const [successPopup, setSuccessPopup] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [checkError, setCheckError] = useState("");
    const [loading, setLoading] = useState(false);

    const closeSuccessPopup = () => {
        setSuccessPopup(false);
        navigate("/transactions");
    };

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [poolType, setPoolType] = useState("date");
    const [amount, setAmount] = useState("");
    const [token, setToken] = useState({
        currency: "Select a token",
        amount: "0",
    });
    const [tokens, setTokens] = useState([
        { currency: "Select a token", amount: "0" },
    ]);
    useEffect(() => {
        if (walletCtx.balances != [] && walletCtx.balances.length > 0) {
            setToken(walletCtx.balances[0]);
            setTokens(walletCtx.balances);
        }
    }, [walletCtx.balances]);
    const [checkExchange, setCheckExchange] = useState(false);

    const validateForm = () => {
        if (title == "" || description == "" || amount == "" || token == "") {
            setError("All fields are required.");
            return false;
        } else if (!checkExchange) {
            setError("");
            setCheckError("Please tick the checkbox to confirm exchange");
            return false;
        } else {
            setError("");
            return true;
        }
    };

    const handleContestFormSubmit = (event) => {
        event.preventDefault();
        if (validateForm()) handleTransaction();
    };
    const sleep = (milliseconds) => {
        const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    };
    //U
    const handleTransaction = async () => {
        try {
            setLoading(true);
            const expiry = 0;
            const authorization = [
                {
                    actor: ctx.auth.actor,
                    permission: ctx.auth.permission,
                },
            ];
            const contesters = [];
            const fromNfts = [];
            await startPool(
                ctx.auth.actor,
                contesters,
                token,
                amount,
                fromNfts,
                expiry,
                authorization,
                walletCtx.session
            );

            sleep(2000);
            let escrows = await fetchEscrows(ctx.auth.actor);
            let myEscrows = escrows.filter(
                (escrow) => escrow.from == ctx.auth.actor
            );
            let loopId = 2;
            if (!myEscrows.length) {
                while (!myEscrows.length && loopId) {
                    sleep(2000);
                    await fetchEscrows(ctx.auth.actor);
                    myEscrows = escrows.filter(
                        (escrow) => escrow.from == ctx.auth.actor
                    );
                    loopId--;
                }
            }
            let escrowId = "0";
            if (myEscrows.length) {
                escrowId = myEscrows[myEscrows.length - 1].id.toString();
            } else {
                setLoading(false);
                return;
            }
            // await cancelPool(
            //     ctx.auth.actor,
            //     myEscrows[myEscrows.length - 1].id,
            //     authorization,
            //     walletCtx.session
            // );
            // await partakePool(
            //     ctx.auth.actor,
            //     myEscrows[myEscrows.length - 1].id,
            //     myEscrows[myEscrows.length - 1].fromTokens[0],
            //     authorization,
            //     walletCtx.session
            // );
            // await fillPool(
            //     ctx.auth.actor,
            //     myEscrows[myEscrows.length - 1].id,
            //     [ctx.auth.actor, "escrowuser2"],
            //     authorization,
            //     walletCtx.session
            // );
            console.log("MyEscrows", myEscrows);
            fetch(`${process.env.MIX_API_URL}/user/addescrow`, {
                method: "POST",
                body: JSON.stringify({
                    type_id: 5,
                    escrow_id: Number(escrowId),
                    escrow_status: "ready",
                    amount: amount,
                    token: token.currency,
                    title: title,
                    description: description,
                    pool_type: poolType,
                }),
                headers: {
                    Authorization: "Bearer " + ctx.auth.actor,
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    //console.log(data);
                    if (data.valid) {
                        // setConfirmationPopup(false);
                        setSuccessPopup(true);
                        setSuccess(data.message);
                    } else {
                        setError(data.message);
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    setError(error);
                    setLoading(false);
                });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Fragment>
            <main>
                <div className="container banner-inner">
                    <h1>Pool / Contest</h1>
                </div>
                <div className="container block">
                    <form onSubmit={handleContestFormSubmit}>
                        <div className="form-row">
                            <label htmlFor="contest-title">
                                Add a title for the Pool / Contest
                            </label>
                            <input
                                type="text"
                                id="contest-title"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="contest-desc">
                                Description of Pool / Contest
                            </label>
                            <textarea
                                id="contest-desc"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                            ></textarea>
                        </div>
                        <div className="form-row">
                            <label>Pool is for:</label>
                            <div className="radio">
                                <input
                                    type="radio"
                                    id="cal-date"
                                    name="pool-for"
                                    value="Calendar date"
                                    checked={poolType == "date"}
                                    onChange={() => setPoolType("date")}
                                />
                                <label htmlFor="cal-date">
                                    A Calendar date
                                </label>
                            </div>
                            <div className="radio">
                                <input
                                    type="radio"
                                    id="numerical"
                                    name="pool-for"
                                    value="Numerical value"
                                    checked={poolType == "integer"}
                                    onChange={() => setPoolType("integer")}
                                />
                                <label htmlFor="numerical">
                                    A Numerical value
                                </label>
                            </div>
                            <small>
                                a numerical value can be assigned to any item as
                                its representation and placed in the description
                                box. Such as 1 for red, 2 for blue, 3 for green,
                                etc.
                            </small>
                        </div>
                        <div className="form-row">
                            <label htmlFor="contest_token">
                                Select a token that you wish to use for this
                                pool / contest:
                            </label>
                            <Dropdown
                                options={tokens}
                                selectedOption={token}
                                setSelectedOption={setToken}
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="contest-amount">
                                Enter a numerical amount that each user will
                                contribute to the pool / contest:
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                id="contest-amount"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(event.target.value)
                                }
                            />
                        </div>
                        <div className="form-row confirm-check">
                            <input
                                type="checkbox"
                                id="contest-item"
                                name="contest-item"
                            />
                        </div>
                        <div className="form-row">
                            <p>
                                Please confirm the following proposed purchase
                            </p>
                        </div>
                        <div className="form-row confirm-check">
                            <input
                                type="checkbox"
                                id="crypto_exchange"
                                name="crypto_exchange"
                                value={checkExchange}
                                onChange={(event) =>
                                    setCheckExchange(event.target.checked)
                                }
                            />
                            <label htmlFor="crypto_exchange">
                                {`Please confirm to add ${
                                    amount || "(token numerical amount)"
                                } ${
                                    token.currency || "(token name)"
                                } to the pool/contest.`}
                            </label>
                        </div>
                        <div className="form-row">
                            <p>
                                <small>
                                    If this is correct please confirm and your
                                    crypto will be moved out of your Proton
                                    wallet into the EasyEscrow Smart Contract.
                                </small>
                            </p>
                        </div>
                        {checkError !== "" && (
                            <div className="form-row error">{checkError}</div>
                        )}
                        {error !== "" && (
                            <div className="form-row error">{error}</div>
                        )}
                        {ctx.isLoggedIn && (
                            <div className="form-row">
                                <Button
                                    label="Confirm"
                                    type="submit"
                                    loading={loading}
                                />
                            </div>
                        )}
                        {!ctx.isLoggedIn && (
                            <div className="form-row">
                                <Button
                                    label="Login"
                                    onClick={async () =>
                                        await walletCtx.protonConnection()
                                    }
                                    loading={loading}
                                />
                            </div>
                        )}
                    </form>
                </div>
            </main>

            {successPopup && (
                <Modal hidePopup={() => setSuccessPopup(false)}>
                    <div>
                        <h3 className="modal-header">Pool / Contest</h3>
                        <div className="form-row success">
                            <p>{success}</p>
                        </div>
                        <div className="modal-confirm">
                            <Button
                                label="Continue"
                                onClick={closeSuccessPopup}
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </Fragment>
    );
};

export default Contest;
