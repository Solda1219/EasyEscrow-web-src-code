import { Fragment, useContext, useState } from "react";
import Moment from "react-moment";
import AuthContext from "../../../store/auth-context";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import { cancelEscrow } from "../../../sdk/easyescrowSDK";
import WalletContext from "../../../store/wallet-context";

const CardCryptoGift = ({ data, TransactionTitle, reloadTransactions }) => {
    const ctx = useContext(AuthContext);
    const walletCtx = useContext(WalletContext);
    const [confirmationPopup, setConfirmationPopup] = useState(false);
    const [loading, setLoading] = useState(false);

    const transactionDetails = (data) => {
        if (ctx.auth.actor === data.username) {
            if (data.status !== "cancelled") {
                return (
                    <p className="transaction-detail">
                        {`${data.amount} ${data.token} will be transferred to @${data.trade_username} as a gift on ${data.transfer_datetime}`}
                    </p>
                );
            }
            if (data.status !== "completed") {
                return (
                    <p className="transaction-detail">
                        {`${data.amount} ${data.token} was transferred to @${data.trade_username} as a gift on ${data.transfer_datetime}`}
                    </p>
                );
            } else {
                return (
                    <p className="transaction-detail">
                        {`${data.amount} ${data.token} was
                                scheduled to be transferred to @${data.trade_username} as a gift on ${data.transfer_datetime}`}
                    </p>
                );
            }
        } else {
            return (
                <p className="transaction-detail">{`${data.username} sent you ${data.amount} ${data.token} as a gift`}</p>
            );
        }
    };

    const transactionAction = (data) => {
        if (ctx.auth.actor === data.username) {
            if (data.status !== "cancelled") {
                return (
                    <div className="transaction-actions">
                        <Button
                            label="Cancel"
                            className="btn-cancel"
                            onClick={() => setConfirmationPopup(true)}
                        />
                    </div>
                );
            } else {
                return (
                    <div className="transaction-actions">
                        <p className="message">
                            <span>
                                You have cancelled this on{" "}
                                <Moment format="DD MMM YYYY">
                                    {data.status_change_at}
                                </Moment>
                            </span>
                        </p>
                    </div>
                );
            }
        } else {
            return null;
        }
    };

    const handleCancelGift = async () => {
        setLoading(true);
        const authorization = [
            {
                actor: ctx.auth.actor,
                permission: ctx.auth.permission,
            },
        ];
        await cancelEscrow(
            data.escrow_contract_id.toString(),
            ctx.auth.actor,
            authorization,
            walletCtx.session
        );
        fetch(`${process.env.MIX_API_URL}/user/escrow_response`, {
            method: "POST",
            body: JSON.stringify({
                type_id: data.type_id,
                escrow_id: data.id,
                status: "cancelled",
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
                    reloadTransactions(data.escrow_contract_id);
                    setConfirmationPopup(false);
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
        <Fragment>
            <div className={`transaction-block ${data.status}`}>
                <div className="transaction-header">
                    <strong>{TransactionTitle}</strong>
                    <span>
                        Date:{" "}
                        <Moment format="DD MMM YYYY">{data.created_at}</Moment>
                    </span>
                </div>
                {transactionDetails(data)}
                {transactionAction(data)}
            </div>

            {confirmationPopup && (
                <Modal hidePopup={() => setConfirmationPopup(false)}>
                    <h3 className="modal-header">Crypto Gift</h3>
                    <p>Are you sure you want to cancel this gift?</p>
                    <p>Note: This action can not be undone</p>
                    <Button
                        label="cancel"
                        className="btn-cancel"
                        onClick={handleCancelGift}
                    />
                </Modal>
            )}
        </Fragment>
    );
};

export default CardCryptoGift;
