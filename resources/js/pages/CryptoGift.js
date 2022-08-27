import { Fragment, useContext, useRef, useState, useEffect } from "react";
import Modal from "../components/ui/Modal";
import AuthContext from "../store/auth-context";
import Moment from "react-moment";
import Button from "../components/ui/Button";
import Dropdown from "../components/ui/CurrencyDropdown";
import { currencies } from "../constants/CurrencyList";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import WalletContext from "../store/wallet-context";
import { startEscrow, fetchEscrows, fillEscrow } from "../sdk/easyescrowSDK";
import { useNavigate } from "react-router-dom";

const CryptoGift = () => {
    const [successPopup, setSuccessPopup] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [checkError, setCheckError] = useState("");
    const [epochError, setEpochError] = useState("");
    const [amountError, setAmountError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const closeSuccessPopup = () => {
        setSuccessPopup(false);
        navigate("/transactions");
    };

    const ctx = useContext(AuthContext);
    const walletCtx = useContext(WalletContext);
    const [token, setToken] = useState({
        currency: "Select a token",
        amount: "0",
    });
    useEffect(() => {
        setToken(
            walletCtx.balances.length
                ? walletCtx.balances[0]
                : {
                      currency: "Select a token",
                      amount: "0",
                  }
        );
    }, [walletCtx.balances]);
    const [amount, setAmount] = useState("");
    const [name, setName] = useState("");
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);
    const [checkExchange, setCheckExchange] = useState(false);

    const handleExchangeFormSubmit = (event) => {
        event.preventDefault();
        if (validateTransactionForm()) handelExchange();
        // handelExchange();
    };

    //Validate Form
    const validateTransactionForm = () => {
        const currentEpoch = new Date().getTime();
        const expireTmp =
            date.toString().substr(0, 15) + time.toString().substr(15);
        const expire = new Date(expireTmp).getTime();
        if (!token.currency || !amount || !name || !date || !time) {
            setError("All fields are required.");
            return false;
        } else if (expire <= currentEpoch) {
            setEpochError("Gift date must be in future!");
        } else if (!checkExchange) {
            setError("");
            setCheckError("Please tick the checkbox to confirm exchange");
            return false;
        } else if (parseFloat(token.amount) < parseFloat(amount)) {
            setAmountError(
                `Insufficient amount ${token.currency} in your wallet`
            );
        } else {
            setError("");
            return true;
        }
    };
    const sleep = (milliseconds) => {
        const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    };
    //Use API to save transaction details
    const handelExchange = async () => {
        try {
            setLoading(true);
            const expireTmp =
                date.toString().substr(0, 15) + time.toString().substr(15);
            const expiry = new Date(expireTmp).getTime();
            const authorization = [
                {
                    actor: ctx.auth.actor,
                    permission: ctx.auth.permission,
                },
            ];
            const typeId = 2;
            const deliverType = 0;
            const tradeToToken = null;
            const tradeToAmount = null;
            await startEscrow(
                typeId,
                ctx.auth.actor,
                name,
                token,
                tradeToToken,
                amount,
                tradeToAmount,
                deliverType,
                expiry,
                authorization,
                walletCtx.session
            );
            sleep(2000);
            let escrows = await fetchEscrows(ctx.auth.actor);
            let myEscrows = escrows.filter(
                (escrow) => escrow.from == ctx.auth.actor && escrow.typeId == 2
            );
            let loopId = 2;
            if (!myEscrows.length) {
                while (!myEscrows.length && loopId) {
                    sleep(2000);
                    await fetchEscrows(ctx.auth.actor);
                    myEscrows = escrows.filter(
                        (escrow) =>
                            escrow.from == ctx.auth.actor && escrow.typeId == 2
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
            console.log("MyEscrows", myEscrows);
            // await fillEscrow(
            //     escrowId,
            //     typeId,
            //     ctx.auth.actor,
            //     null,
            //     null,
            //     null
            // );
            fetch(`${process.env.MIX_API_URL}/user/addescrow`, {
                method: "POST",
                body: JSON.stringify({
                    type_id: 2,
                    amount: amount,
                    token: token.currency,
                    escrow_id: Number(escrowId),
                    escrow_status: "ready",
                    trade_username: name,
                    trade_date: date,
                    trade_time: time,
                    transfer_datetime: Math.floor(expiry / 1000),
                }),
                headers: {
                    Authorization: "Bearer " + ctx.walletName,
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (response.ok) return response.json();
                    throw response.status + ": " + response.statusText;
                })
                .then((data) => {
                    //console.log(data);
                    if (data.valid) {
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
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("orh here?", error);
        }
    };

    return (
        <Fragment>
            <main>
                <div className="container banner-inner">
                    <h1>Crypto Gift</h1>
                    <h3>
                        Crypto Gift is an easy way to send another person a
                        specified amount of cryptocurrency at a predetermined
                        date and time
                    </h3>
                </div>
                <div className="container block">
                    <form onSubmit={handleExchangeFormSubmit}>
                        <div className="form-row">
                            <label htmlFor="token_to">
                                Select a token that you wish to gift to another
                                wallet
                            </label>
                            <Dropdown
                                options={
                                    walletCtx.balances?.length
                                        ? walletCtx.balances
                                        : [{ currency: "Select a token" }]
                                }
                                selectedOption={token}
                                setSelectedOption={setToken}
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="transfer-amount">
                                Enter a numerical amount that you wish to
                                transfer
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                id="transfer-amount"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(event.target.value)
                                }
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="transfer-to">
                                Enter the Proton @name of the wallet you wish to
                                transfer to
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">@</span>
                                <input
                                    type="text"
                                    id="transfer-to"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <label htmlFor="transfer-date">
                                Enter a calendar date that you wish for the gift
                                to transfer
                            </label>
                            <DatePicker
                                selected={date}
                                onChange={(date) => setDate(date)}
                                minDate={new Date()}
                                dateFormat="dd MMM yyyy"
                                className="date-picker"
                                placeholderText="Click to Select"
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="transfer-time">
                                Enter a time that you wish for the gift to
                                transfer
                            </label>
                            <DatePicker
                                selected={time}
                                onChange={(date) => setTime(date)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="h:mm aa"
                                className="time-picker"
                                placeholderText="Click to Select"
                            />
                        </div>
                        <div className="form-row">
                            <p className="modal-header">
                                Please confirm the following proposed crypto
                                gift
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
                                @{ctx.walletName || "(first user)"} to
                                transfer/gift {amount}{" "}
                                {token.currency || "(token name)"} to @
                                {name || "(second user)"} on{" "}
                                {date ? (
                                    <Moment format="DD MMM YYYY">
                                        {new Date(date)}
                                    </Moment>
                                ) : (
                                    "(date)"
                                )}{" "}
                                at{" "}
                                {time ? (
                                    <Moment format="h:mm a">
                                        {new Date(time)}
                                    </Moment>
                                ) : (
                                    "(time)"
                                )}
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
                        {epochError !== "" && (
                            <div className="form-row error">{epochError}</div>
                        )}
                        {error !== "" && (
                            <div className="form-row error">{error}</div>
                        )}
                        {amountError !== "" && (
                            <div className="form-row error">{amountError}</div>
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
                        <h3 className="modal-header">Crypto Gift</h3>
                        <div className="form-row success">
                            <p>{success}</p>
                        </div>
                        <div className="modal-confirm">
                            <button
                                type="button"
                                className="btn"
                                onClick={closeSuccessPopup}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </Fragment>
    );
};

export default CryptoGift;
