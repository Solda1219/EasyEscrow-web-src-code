import { useContext, useEffect, useState } from "react";
import AuthContext from "../../../store/auth-context";
import WalletContext from "../../../store/wallet-context";
import Button from "../../ui/Button";

import ImagesUpload from "../../ui/ImagesUpload";

import Dropdown from "../../ui/CurrencyDropdown";
import * as currencyData from "../../../constants/CurrencyList";

import {
    fillEscrow,
    fetchEscrows,
    user2Nego,
} from "../../../sdk/easyescrowSDK";

const NegotiatePurchase = ({ reloadTransactions, handleCancel, data }) => {
    const ctx = useContext(AuthContext);
    const walletCtx = useContext(WalletContext);
    const [description, setDescription] = useState();
    const [amount, setAmount] = useState(data.amount);
    const [token, setToken] = useState({ currency: "select a token" });
    const [currencies, setCurrencies] = useState([]);
    const [date, setDate] = useState(data.transfer_type);
    const [fileFields, setFileFields] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleDateChange = (event) => {
        setDate(event.target.value);
    };

    const handleTokenChange = (event) => {
        setToken(event.target.value);
    };
    //to load correct token
    useEffect(() => {
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
            .then((res) => {
                if (!active) return;
                if (res.valid) {
                    setCurrencies(res.data);
                    // setCurrencies(currencyData.currencies);
                } else {
                    console.log(res.message);
                    setCurrencies(currencyData.currencies);
                }
            })
            .catch((error) => {
                setCurrencies(currencyData.currencies);
                console.log(error.toString());
            });
        const myCurrency = currencies.filter(
            (currencyone) => currencyone.currency == data.token
        );
        setToken(myCurrency[0]);
    }, [currencies.length]);
    const validateForm = () => {
        if (fileFields.length > 10) return false;

        if (amount == "") {
            setError("Please Enter a numerical amount as price");
            return false;
        } else {
            setError("");
            return true;
        }
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        validateForm();
        handleNegotiation();
    };

    const handleNegotiation = async () => {
        setLoading(true);
        //const filesArray = fileFields.map((field) => field.file);
        const escrow_id = data.id;
        const escrow_contract_id = data.escrow_contract_id;
        // const typeId = data.type_id;
        // const expiry = 0;
        // let deliverType = 0;
        // if (Date == "immediately") {
        //     deliverType = 1;
        // } else if (date == "delivery") {
        //     deliverType = 2;
        // }
        // const authorization = [
        //     {
        //         actor: ctx.auth.actor,
        //         permission: ctx.auth.permission,
        //     },
        // ];
        // if (ctx.walletName == data.trade_username) {
        //     //meaning negotiate from user2
        //     await user2Nego(
        //         escrow_contract_id,
        //         typeId,
        //         data.username,
        //         data.trade_username,
        //         token,
        //         null,
        //         amount,
        //         null,
        //         deliverType,
        //         expiry,
        //         authorization,
        //         walletCtx.session
        //     );
        // }
        var formData = new FormData();
        formData.append("type_id", 3);
        formData.append("amount", amount);
        formData.append("token", token.currency);
        formData.append("description", description);
        formData.append("transfer_type", date);
        formData.append("escrow_id", escrow_id);
        formData.append("action", "negotiate");
        for (const file of fileFields) {
            formData.append("image[]", file);
        }

        // console.log("----- Form Array -----");
        // console.log(filesArray);
        // console.log("----- Form Data -----");
        // for (var pair of formData.entries()) {
        //     console.log(pair[0] + ", " + pair[1]);
        // }

        try {
            fetch(`${process.env.MIX_API_URL}/user/escrow_update`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: "Bearer " + ctx.auth.actor,
                },
            })
                .then((response) => {
                    if (response.ok) return response.json();
                    throw response.status + ": " + response.statusText;
                })
                .then((data) => {
                    //console.log(data);
                    if (data.valid) {
                        setLoading(false);
                        reloadTransactions(escrow_contract_id);
                        handleCancel(false);
                    } else {
                        setError(data.message);
                        setLoading(false);
                    }
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
        <form className="sub-form" onSubmit={handleFormSubmit}>
            <div className="form-row">
                <h3>Negotiate</h3>
            </div>
            <div className="form-row">
                <label htmlFor="purchase-desc">Description of purchase</label>
                <textarea
                    id="purchase-desc"
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
            </div>
            <ImagesUpload setFileFields={setFileFields} />
            <div className="form-row">
                <label htmlFor="purchase-amount">
                    Enter a numerical amount as price:
                </label>
                <input
                    type="number"
                    step="0.01"
                    id="purchase-amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                {error !== "" && <div className="error">{error}</div>}
            </div>
            <div className="form-row">
                <label htmlFor="purchase_token">Select a token:</label>
                <Dropdown
                    options={currencies}
                    selectedOption={token}
                    setSelectedOption={setToken}
                />
            </div>
            <div className="form-row">
                <label htmlFor="purchase_token">Transfer Date:</label>
                <div className="radio">
                    <input
                        type="radio"
                        id="immediately"
                        name="purchase-date"
                        value="immediately"
                        checked={date == "immediately"}
                        onChange={handleDateChange}
                    />
                    <label htmlFor="immediately">Immediately</label>
                </div>
                <div className="radio">
                    <input
                        type="radio"
                        id="on-delivery"
                        name="purchase-date"
                        value="delivery"
                        checked={date == "delivery"}
                        onChange={handleDateChange}
                    />
                    <label htmlFor="on-delivery">
                        Upon Delivery of Purchased Item
                    </label>
                </div>
            </div>
            <div className="form-row btn-group left-aligned">
                <Button type="submit" loading={loading}>
                    Update Agreement and Send to Buyer
                </Button>
                <Button
                    className="btn-cancel"
                    onClick={() => handleCancel(false)}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default NegotiatePurchase;
