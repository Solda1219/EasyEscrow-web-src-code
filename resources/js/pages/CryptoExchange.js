import { Fragment, useContext, useEffect, useState } from "react";

import Modal from "../components/ui/Modal";
import AuthContext from "../store/auth-context";
import WalletContext from "../store/wallet-context";
import Button from "../components/ui/Button";
import Dropdown from "../components/ui/CurrencyDropdown";
import { startEscrow, fetchEscrows } from "../sdk/easyescrowSDK";
import { setFee, fetchFeeAll, fetchFees, setPoolFee } from "../sdk/feeSDK";
import * as currencyData from "../constants/CurrencyList";
import { useNavigate } from "react-router-dom";

const CryptoExchange = () => {
    const ctx = useContext(AuthContext);
    const walletCtx = useContext(WalletContext);
    const [successPopup, setSuccessPopup] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [checkError, setCheckError] = useState("");
    const [amountError, setAmountError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [senderName, setSenderName] = useState(ctx.walletName || "");
    const [tradeFromToken, setTradeFromToken] = useState({
        currency: "Select a token",
        amount: "0",
    });
    const [tradeFromTokens, setTradeFromtokens] = useState([
        {
            currency: "Select a token",
            amount: "0",
        },
    ]);
    const [tradeFromAmount, setTradeFromAmount] = useState("");
    const [receiverName, setReceiverName] = useState("");
    const [currencies, setCurrencies] = useState([]);
    const [tradeToToken, setTradeToToken] = useState({
        currency: "XPR",
        contract: "eosio.token",
        decimals: "4",
    });
    const [tradeToAmount, setTradeToAmount] = useState("");
    const [checkExchange, setCheckExchange] = useState(false);
    const handleExchangeFormSubmit = (event) => {
        event.preventDefault();
        if (validateTransactionForm()) handelExchange();
        // handelExchange();
    };

    //Get Currencies List
    useEffect(() => {
        if (walletCtx.balances != [] && walletCtx.balances.length > 0) {
            setTradeFromToken(walletCtx.balances[0]);
            setTradeFromtokens(walletCtx.balances);
        }

        let active = true;
        fetch(`${process.env.MIX_API_URL}/get_escrow_currencies`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (response.ok) return response.json();
                throw response.status + ": " + response.statusText;
            })
            .then((data) => {
                if (!active) return;
                if (data.valid) {
                    setCurrencies(data.data);
                    // setCurrencies(currencyData.currencies);
                } else {
                    console.log(data.message);
                    setCurrencies(currencyData.currencies);
                }
            })
            .catch((error) => {
                setCurrencies(currencyData.currencies);
                console.log(error.toString());
            });

        return () => {
            active = false;
        };
    }, [walletCtx.balances]);
    const validateTransactionForm = () => {
        if (
            !senderName ||
            !tradeFromToken.currency ||
            !tradeFromAmount ||
            !receiverName ||
            !tradeToToken.currency ||
            !tradeToAmount
        ) {
            setError("All fields are required.");
            return false;
        } else if (checkExchange == false) {
            setError("");
            setCheckError("Please tick the checkbox to confirm exchange");
            return false;
        } else if (
            parseFloat(tradeFromToken.amount) < parseFloat(tradeFromAmount)
        ) {
            setAmountError(
                `Insufficient amount ${tradeFromToken.currency} in your wallet`
            );
        } else {
            setError("");
            setCheckError("");
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
    const handelExchange = async () => {
        try {
            setLoading(true);

            // // // Authorization
            const authorization = [
                {
                    actor: ctx.auth.actor,
                    permission: ctx.auth.permission,
                },
            ];
            const typeId = 1;
            const deliverType = 0;
            const expiry = 0;
            await startEscrow(
                typeId,
                ctx.auth.actor,
                receiverName,
                tradeFromToken,
                tradeToToken,
                tradeFromAmount,
                tradeToAmount,
                deliverType,
                expiry,
                authorization,
                walletCtx.session
            );
            // await setFee(0, authorization, walletCtx.session);
            // await setPoolFee(0, authorization, walletCtx.session);
            sleep(2000);
            // const fees = await fetchFees("easyescrow2");
            // const feesa = await fetchFeeAll();
            // console.log("fees", fees);
            // console.log("fesa", feesa);

            let escrows = await fetchEscrows(ctx.auth.actor);

            let myEscrows = escrows.filter(
                (escrow) => escrow.from == ctx.auth.actor && escrow.typeId == 1
            );
            let loopId = 2;
            if (!myEscrows.length) {
                while (!myEscrows.length && loopId) {
                    sleep(2000);
                    await fetchEscrows(ctx.auth.actor);
                    myEscrows = escrows.filter(
                        (escrow) =>
                            escrow.from == ctx.auth.actor && escrow.typeId == 1
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
            // Url type: http://easyescrow.io/exchange/escrowId/user1Acc to send message token

            fetch(`${process.env.MIX_API_URL}/user/addescrow`, {
                method: "POST",
                body: JSON.stringify({
                    type_id: typeId,
                    amount: tradeFromAmount,
                    token: tradeFromToken.currency,
                    escrow_id: Number(escrowId),
                    escrow_status: "ready",
                    trade_username: receiverName,
                    trade_token: tradeToToken.currency,
                    trade_amount: tradeToAmount,
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
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    };

    const closeSuccessPopup = () => {
        setSuccessPopup(false);
        navigate("/transactions");
    };

    return (
        <Fragment>
            <main>
                <div className="container banner-inner">
                    <h1>Crypto Exchange</h1>
                    <h3>
                        Crypto Exchange is a simple escrow providing the ability
                        to trade one Crypto for another with a user on the
                        Proton blockchain.
                    </h3>
                </div>
                <div className="container block">
                    <form onSubmit={handleExchangeFormSubmit}>
                        <div className="form-row">
                            <label htmlFor="sender_name">
                                Enter your Proton @name:
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">@</span>
                                <input
                                    type="text"
                                    id="sender_name"
                                    value={senderName}
                                    onChange={(event) =>
                                        setSenderName(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <label htmlFor="token_from">
                                Select a token from the dropdown that you wish
                                to trade:
                            </label>
                            <Dropdown
                                options={tradeFromTokens}
                                selectedOption={tradeFromToken}
                                setSelectedOption={setTradeFromToken}
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="from_amount">
                                Enter a numerical amount:
                            </label>
                            <input
                                type="number"
                                id="from_amount"
                                value={tradeFromAmount}
                                onChange={(event) =>
                                    setTradeFromAmount(event.target.value)
                                }
                                step="0.01"
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="receiver_name">
                                Enter the Proton @name of the person you wish to
                                exchange with:
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">@</span>
                                <input
                                    type="text"
                                    id="receiver_name"
                                    value={receiverName}
                                    onChange={(event) =>
                                        setReceiverName(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <label htmlFor="token_to">
                                Select a token from the dropdown that you wish
                                to trade for:
                            </label>
                            <Dropdown
                                options={currencies}
                                selectedOption={tradeToToken}
                                setSelectedOption={setTradeToToken}
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="to_amount">
                                Enter a numerical amount:
                            </label>
                            <input
                                type="number"
                                id="to_amount"
                                value={tradeToAmount}
                                onChange={(event) =>
                                    setTradeToAmount(event.target.value)
                                }
                                step="0.01"
                            />
                        </div>
                        <div className="form-row">
                            <p>
                                Please confirm the following proposed crypto
                                exchange
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
                                @{senderName || "(first user)"} to exchange{" "}
                                {tradeFromAmount || "(token numerical amount)"}{" "}
                                {tradeFromToken.currency || "(token name)"} with
                                @{receiverName || "(second user)"} for{" "}
                                {tradeToAmount || "(token numerical amount)"}{" "}
                                {tradeToToken.currency || "(token name)"}{" "}
                            </label>
                        </div>
                        <div className="form-row">
                            <p>
                                <small>
                                    If this is correct please confirm and your
                                    crypto will be moved out of your Proton
                                    wallet into the EasyEscrow Smart Contract.
                                    We will also notify the other party so the
                                    trade can be accepted or cancelled.
                                </small>
                            </p>
                        </div>
                        {error !== "" && (
                            <div className="form-row error">{error}</div>
                        )}
                        {checkError !== "" && (
                            <div className="form-row error">{checkError}</div>
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
                        <h3 className="modal-header">Crypto Exchange</h3>
                        <div className="form-row success">
                            <p>{success}</p>
                        </div>
                        <div className="modal-confirm">
                            <Button onClick={closeSuccessPopup}>
                                Continue
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </Fragment>
    );
};

export default CryptoExchange;
