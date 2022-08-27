import { Fragment, useContext, useRef, useState, useEffect } from "react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";

import AuthContext from "../store/auth-context";
import ImagesUpload from "../components/ui/ImagesUpload";

import Dropdown from "../components/ui/CurrencyDropdown";
import { currencies } from "../constants/CurrencyList";
import WalletContext from "../store/wallet-context";
import {
    startEscrow,
    fillEscrow,
    fetchEscrows,
    user2Nego,
    startPurchase,
    negoPurchase,
} from "../sdk/easyescrowSDK";
import { useNavigate } from "react-router-dom";

const PurchaseItem = () => {
    const navigate = useNavigate();
    const ctx = useContext(AuthContext);
    const walletCtx = useContext(WalletContext);
    const [successPopup, setSuccessPopup] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [checkError, setCheckError] = useState("");
    const [loading, setLoading] = useState(false);
    const [fileFields, setFileFields] = useState([]);
    const [amountError, setAmountError] = useState("");

    const closeSuccessPopup = () => {
        setSuccessPopup(false);
        navigate("/transactions");
    };

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
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
    const [transferDate, setTransferDate] = useState("immediately");
    const [sellerName, setSellerName] = useState("");
    const [checkExchange, setCheckExchange] = useState(false);

    const handlePurchaseFormSubmit = (event) => {
        event.preventDefault();
        if (validateTransactionForm()) handelExchange();
    };

    //Validate Form
    const validateTransactionForm = () => {
        if (fileFields.length > 10) return false;

        if (
            title == "" ||
            description == "" ||
            amount == "" ||
            token.currency == "" ||
            sellerName == ""
        ) {
            setError("All fields are required.");
            return false;
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
            const authorization = [
                {
                    actor: ctx.auth.actor,
                    permission: ctx.auth.permission,
                },
            ];
            let deliverType = 0;
            if (transferDate == "immediately") {
                deliverType = 1;
            } else if (transferDate == "delivery") {
                deliverType = 2;
            }
            const typeId = 3;
            const tradeToToken = null;
            const tradeToAmount = null;
            const expiry = 0;
            await startEscrow(
                typeId,
                ctx.auth.actor,
                sellerName,
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
                (escrow) => escrow.from == ctx.auth.actor && typeId == 3
            );
            let loopId = 2;
            if (!myEscrows.length) {
                while (!myEscrows.length && loopId) {
                    sleep(2000);
                    await fetchEscrows(ctx.auth.actor);
                    myEscrows = escrows.filter(
                        (escrow) => escrow.from == ctx.auth.actor && typeId == 3
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
            console.log("my", myEscrows);
            var formData = new FormData();
            formData.append("type_id", 3);
            formData.append("amount", amount);
            formData.append("token", token.currency);
            formData.append("trade_username", sellerName);
            formData.append("title", title);
            formData.append("description", description);
            formData.append("transfer_type", transferDate);
            formData.append("escrow_id", Number(escrowId));
            formData.append("escrow_status", "ready");
            for (const file of fileFields) {
                formData.append("image[]", file);
            }
            // await startPurchase(
            //     ctx.auth.actor,
            //     myEscrows[myEscrows.length - 1].fromTokens[0],
            //     authorization,
            //     walletCtx.session
            // );
            // await fillEscrow(
            //     escrowId,
            //     3,
            //     ctx.auth.actor,
            //     null,
            //     authorization,
            //     walletCtx.session
            // );
            // await negoPurchase(
            //     22,
            //     typeId,
            //     "escrowuser2",
            //     ctx.auth.actor,
            //     token,
            //     null,
            //     amount,
            //     null,
            //     deliverType,
            //     expiry,
            //     authorization,
            //     walletCtx.session
            // );
            // console.log("----- Form Array -----");
            // console.log(fileFields);
            // console.log("----- Form Data -----");
            // for (var pair of formData.entries()) {
            //     console.log(pair[0] + ": " + pair[1]);
            // }

            // fetch(`${process.env.MIX_API_URL}/user/addescrow`, {
            //     method: "POST",
            //     body: formData,
            //     headers: {
            //         Authorization: "Bearer " + ctx.walletName,
            //     },
            // })
            //     .then((response) => {
            //         if (response.ok) return response.json();
            //         throw response.status + ": " + response.statusText;
            //     })
            //     .then((data) => {
            //         //console.log(data);
            //         if (data.valid) {
            //             setSuccessPopup(true);
            //             setSuccess(data.message);
            //         } else {
            //             setError(data.message);
            //         }
            //         setLoading(false);
            //     })
            //     .catch((error) => {
            //         setError(error);
            //         setLoading(false);
            //     });
        } catch (error) {
            console.log("ERROR", error);
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <main>
                <div className="container banner-inner">
                    <h1>Purchase an Item</h1>
                    <h3>
                        This escrow allows any user to easily utilize a smart
                        contract to verify and pay for any item with select
                        cryptocurrencies
                    </h3>
                </div>
                <div className="container block">
                    <form onSubmit={handlePurchaseFormSubmit}>
                        <div className="form-row">
                            <label htmlFor="purchase-title">
                                Add a title for the item to purchase
                            </label>
                            <input
                                type="text"
                                id="purchase-title"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="purchase-desc">
                                Description of purchase
                            </label>
                            <textarea
                                id="purchase-desc"
                                value={description}
                                onChange={(event) =>
                                    setDescription(event.target.value)
                                }
                            ></textarea>
                        </div>
                        <ImagesUpload setFileFields={setFileFields} />
                        <div className="form-row">
                            <label htmlFor="purchase-amount">
                                Enter a numerical amount of tokens as the
                                purchase price:
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                id="purchase-amount"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(event.target.value)
                                }
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="purchase_token">
                                Select a token:
                            </label>
                            <Dropdown
                                options={tokens}
                                selectedOption={token}
                                setSelectedOption={setToken}
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="purchase_token">
                                Transfer Date:
                            </label>
                            <div className="radio">
                                <input
                                    type="radio"
                                    id="immediately"
                                    name="purchase-date"
                                    value="immediately"
                                    checked={transferDate == "immediately"}
                                    onChange={() =>
                                        setTransferDate("immediately")
                                    }
                                />
                                <label htmlFor="immediately">Immediately</label>
                            </div>
                            <div className="radio">
                                <input
                                    type="radio"
                                    id="on-delivery"
                                    name="purchase-date"
                                    value="on delivery"
                                    checked={transferDate == "delivery"}
                                    onChange={() => setTransferDate("delivery")}
                                />
                                <label htmlFor="on-delivery">
                                    Upon Delivery of Purchased Item
                                </label>
                            </div>
                        </div>
                        <div className="form-row">
                            <label htmlFor="seller-name">
                                Enter the Proton @name of the seller:
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">@</span>
                                <input
                                    type="text"
                                    id="seller-name"
                                    value={sellerName}
                                    onChange={(event) =>
                                        setSellerName(event.target.value)
                                    }
                                />
                            </div>
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
                                {`Please confirm this transaction and ${
                                    amount || "(token numerical amount)"
                                } ${
                                    token.currency || "(token name)"
                                } will be moved out of your Proton wallet into the EasyEscrow Smart Contract. @${
                                    sellerName || "(second user)"
                                } will be notified to review this transaction.`}
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
                        <h3 className="modal-header">Purchase an Item</h3>
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

export default PurchaseItem;
