import { Fragment, useContext, useState } from "react";
import Moment from "react-moment";
import AuthContext from "../../../store/auth-context";
import WalletContext from "../../../store/wallet-context";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import NegotiatePurchase from "./NegotiatePurchase";
import PurchaseAction from "../PurchaseAction";
import { fillEscrow, fetchEscrows } from "../../../sdk/easyescrowSDK";

const Details = ({ data }) => {
    return (
        <Fragment>
            <div className="transaction-desc">{data.description}</div>
            <p className="transaction-date">
                Transfer Date:{" "}
                <span>
                    {data.transfer_type === "delivery"
                        ? "Upon Delivery of Purchased Item"
                        : "Immediately"}
                </span>
            </p>
            {data.images.length > 0 && (
                <div className="transaction-images">
                    {data.images.map((img) => (
                        <img src={img.image_url} alt="" key={img.id} />
                    ))}
                </div>
            )}
            {data.negotiations.length > 0 &&
                data.negotiations.map((newData, index) => (
                    <NegotiationInfo data={newData} key={index} />
                ))}
            {data.status === "completed" && (
                <p>
                    Transaction accepted on{" "}
                    <Moment format="DD MMM YYYY - hh:mm a">
                        {data.status_change_at}
                    </Moment>
                </p>
            )}
        </Fragment>
    );
};

const NegotiationInfo = ({ data }) => {
    return (
        <div className="negotiation-info">
            <h3>Negotiation</h3>
            <p className="negotiation-date">By @{data.username}</p>
            <p className="negotiation-date">
                Date:{" "}
                <Moment format="DD MMM YYYY - hh:mm a">
                    {data.created_at}
                </Moment>
            </p>
            {data.description !== "undefined" && (
                <div className="transaction-desc">{data.description}</div>
            )}
            <p>
                Amount: {data.amount} {data.token}
            </p>
            <p className="transaction-date">
                Transfer Date:{" "}
                <span>
                    {data.transfer_type === "delivery"
                        ? "Upon Delivery of Purchased Item"
                        : "Immediately"}
                </span>
            </p>
            {data.images.length > 0 && (
                <div className="transaction-images">
                    {data.images.map((img) => (
                        <img src={img.image_url} alt="" key={img.id} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CardPurchaseItem = ({
    data,
    TransactionTitle,
    reloadTransactions,
    showDetails,
}) => {
    const ctx = useContext(AuthContext);
    const walletCtx = useContext(WalletContext);
    const [negotiate, setNegotiate] = useState(false);
    const [confirmationPopup, setConfirmationPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const escrow_id = data.id;
    const escrow_contract_id = data.escrow_contract_id;
    const typeId = data.type_id;
    const startedBy =
        ctx.auth.actor == data.username ? "you" : "@" + data.username;

    const handleUpdate = async (action) => {
        setLoading(true);
        //imediate, user2 agree status, typeId==3
        // const escrows = await fetchEscrows(ctx.walletName);
        // const myEscrows = escrows.filter(
        //     (escrow) => escrow.id.toString() == escrow_contract_id
        // );
        // if (action == "agree") {
        //     const authorization = [
        //         {
        //             actor: ctx.auth.actor,
        //             permission: ctx.auth.permission,
        //         },
        //     ];
        //     await fillEscrow(
        //         escrow_contract_id,
        //         typeId,
        //         ctx.walletName,
        //         null,
        //         authorization,
        //         walletCtx.session
        //     );
        // }
        fetch(`${process.env.MIX_API_URL}/user/escrow_update`, {
            method: "POST",
            body: JSON.stringify({
                type_id: data.type_id,
                escrow_id: escrow_id,
                action: action,
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
                console.log(data);
                if (data.valid) {
                    reloadTransactions(escrow_contract_id);
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
        <Fragment>
            <div className={`transaction-block ${data.status}`}>
                <div className="transaction-header">
                    <strong>{TransactionTitle}</strong>
                    <span>
                        Date{" "}
                        <Moment format="DD MMM YYYY">{data.created_at}</Moment>
                    </span>
                </div>
                <p className="transaction-detail">
                    A contract titled <strong>{data.title}</strong> for{" "}
                    {data.amount} {data.token} was initiated by {startedBy}
                    {!showDetails &&
                        ", please click on detail button to review the contract"}
                </p>
                {showDetails && <Details data={data} />}
                {!negotiate ? (
                    <PurchaseAction
                        data={data}
                        loading={loading}
                        showDetails={showDetails}
                        handleUpdate={handleUpdate}
                        setConfirmationPopup={setConfirmationPopup}
                        setNegotiate={setNegotiate}
                    />
                ) : (
                    <NegotiatePurchase
                        reloadTransactions={reloadTransactions}
                        handleCancel={setNegotiate}
                        data={data}
                    />
                )}
            </div>

            {confirmationPopup && (
                <Modal hidePopup={() => setConfirmationPopup(false)}>
                    <h3 className="modal-header">Purchase an Item</h3>
                    <p>If you agree to this transaction, please ACCEPT</p>
                    <p>Note: This action can not be undone</p>
                    <div className="form-row btn-group">
                        <Button
                            label="Accept"
                            className="btn-accept"
                            loading={loading}
                            onClick={() => handleUpdate("agree")}
                        />
                        <Button
                            label="Cancel"
                            className="btn-cancel"
                            onClick={() => setConfirmationPopup(false)}
                        />
                    </div>
                </Modal>
            )}
        </Fragment>
    );
};

export default CardPurchaseItem;
