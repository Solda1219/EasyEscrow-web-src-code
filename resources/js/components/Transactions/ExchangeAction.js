import { Fragment, useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../../store/auth-context";
import WalletContext from "../../store/wallet-context";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import {
    fetchEscrows,
    fillEscrow,
    cancelEscrow,
} from "../../sdk/easyescrowSDK";

const ExchangeAction = (props) => {
    const { escrowId, user1Acc } = useParams();
    const ctx = useContext(AuthContext);
    const walletCtx = useContext(WalletContext);
    const [confirmationPopup, setConfirmationPopup] = useState(false);
    const [responseType, setResponseType] = useState();
    const [loading, setLoading] = useState(false);
    const [myEscrows, setMyEscrows] = useState([]);

    useEffect(async () => {
        if (ctx.isLoggedIn) {
            const escrows = await fetchEscrows(user1Acc);
            const myEscrowss = escrows.filter(
                (escrow) =>
                    escrow.id.toString() == escrowId &&
                    escrow.to.toString() == ctx.walletName
            );

            if (myEscrowss.length > 0) {
                setMyEscrows([...myEscrowss]);
            }
        }
    }, [myEscrows.length, ctx.isLoggedIn]);
    const handleAccept = (response_type) => {
        setConfirmationPopup(true);
        setResponseType(response_type);
    };

    const handleExchangeAction = async (response_type) => {
        setLoading(true);
        const authorization = [
            {
                actor: ctx.auth.actor,
                permission: ctx.auth.permission,
            },
        ];
        const typeId = 1;
        if (response_type == "completed") {
            await fillEscrow(
                myEscrows[0].id,
                typeId,
                ctx.walletName,
                myEscrows[0].toTokens[0],
                authorization,
                walletCtx.session
            );
            setMyEscrows([]);
            //success toast
        } else {
            await cancelEscrow(
                myEscrows[0].id,
                ctx.walletName,
                authorization,
                walletCtx.session
            );
            setMyEscrows([]);
            //cancel toast
        }
        setConfirmationPopup(false);
        setLoading(false);
        fetch(`${process.env.MIX_API_URL}/user/escrow_response`, {
            method: "POST",
            body: JSON.stringify({
                type_id: props.type_id,
                escrow_id: props.escrow_id,
                status: response_type,
            }),
            headers: {
                Authorization: "Bearer " + ctx.auth.actor,
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
                    props.reloadTransactions(props.escrow_id);
                    setConfirmationPopup(false);
                    //console.log(data.message);
                } else {
                    console.log(data.message);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <main>
            <div className="container banner-inner">
                <h2>Transaction Details</h2>
            </div>
            <div className="container block">
                <div className="transactions">
                    {ctx.isLoggedIn && (
                        <Fragment>
                            {myEscrows.length > 0 && (
                                <>
                                    <p className="transaction-detail">
                                        {myEscrows[0].from} wants to exchange{" "}
                                        {myEscrows[0].fromTokens[0].quantity}{" "}
                                        with {myEscrows[0].toTokens[0].quantity}{" "}
                                        with you(
                                        {ctx.walletName})!
                                    </p>
                                    <div className="transaction-actions">
                                        <p>
                                            <Button
                                                label="Accept"
                                                className="btn-accept"
                                                onClick={() =>
                                                    handleAccept("completed")
                                                }
                                            />
                                        </p>
                                        <p>
                                            <Button
                                                label="Cancel"
                                                className="btn btn-cancel"
                                                onClick={() =>
                                                    handleAccept("cancelled")
                                                }
                                            />
                                        </p>
                                    </div>

                                    {confirmationPopup && (
                                        <Modal
                                            hidePopup={() =>
                                                setConfirmationPopup(false)
                                            }
                                        >
                                            <h3 className="modal-header">
                                                Crypto Exchange
                                            </h3>
                                            {responseType === "completed" && (
                                                <p>
                                                    If you agree to this
                                                    exchange, please ACCEPT
                                                </p>
                                            )}
                                            {responseType === "cancelled" && (
                                                <p>
                                                    If you do NOT agree, hit
                                                    this button to CANCEL
                                                </p>
                                            )}
                                            <p>
                                                Note: This action can not be
                                                undone
                                            </p>
                                            <div className="form-row">
                                                {responseType ===
                                                    "completed" && (
                                                    <Button
                                                        label="Accept"
                                                        className="btn-accept"
                                                        onClick={() =>
                                                            handleExchangeAction(
                                                                "completed"
                                                            )
                                                        }
                                                        loading={loading}
                                                    />
                                                )}
                                                {responseType ===
                                                    "cancelled" && (
                                                    <Button
                                                        label="Cancel"
                                                        className="btn-cancel"
                                                        onClick={() =>
                                                            handleExchangeAction(
                                                                "cancelled"
                                                            )
                                                        }
                                                        loading={loading}
                                                    />
                                                )}
                                            </div>
                                        </Modal>
                                    )}
                                </>
                            )}
                            {myEscrows.length == 0 && (
                                <div className="transaction-empty">
                                    <span>
                                        There is no escrow for this request
                                    </span>
                                </div>
                            )}
                        </Fragment>
                    )}
                    {!ctx.isLoggedIn && (
                        <div className="transaction-empty">
                            <span>
                                You must login to continue. (
                                <a
                                    href="https://www.proton.org/wallet"
                                    target="_blank"
                                >
                                    Download Proton Wallet
                                </a>
                                )
                            </span>
                            {/* <Button
                                label="Login"
                                className="btn-accept"
                                onClick={async () =>
                                    await walletCtx.protonConnection()
                                }
                                loading={loading}
                            /> */}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ExchangeAction;
