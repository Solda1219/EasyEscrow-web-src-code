import { Fragment, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import AuthContext from "../../store/auth-context";
import Button from "../ui/Button";

const DetailsButton = ({ transactionId }) => {
    return (
        <Link to={`/escrow/${transactionId}`} className="btn">
            Details
        </Link>
    );
};

const PurchaseAction = ({
    showDetails,
    data,
    handleUpdate,
    setConfirmationPopup,
    setNegotiate,
    loading,
}) => {
    const ctx = useContext(AuthContext);
    let negotiating = false;
    const user1 = data.username;
    const user2 = data.trade_username;
    let responder = user2;

    if (data.negotiations) {
        negotiating = data.negotiations.length > 0 && data.status == "ready";
    }

    if (negotiating) {
        const lastUser =
            data.negotiations[data.negotiations.length - 1].username;
        responder = user1 == lastUser ? user2 : user1;
    }

    const waitFor = ctx.auth.actor == responder ? "you" : "@" + responder;

    let userMessage = "";
    if (data.status == "ready") {
        userMessage = `Waiting for ${waitFor} to respond`;
    } else if (data.status == "confirmed" && data.transfer_type == "delivery") {
        userMessage = `Waiting for ${waitFor} to deliver`;
    }

    // Status are...
    // ready - When transaction is started
    // -- Show/hide buttons based on negotiation status
    // Confirmed - When transaction is accepted
    // Completed - on delivery

    /* Status
        ready
        confirmed
        escrow_awaited
        delivered
        completed
    */

    if (data.status === "completed" && !showDetails) {
        //If Transaction is complete, show detail button only
        return (
            <div className="transaction-actions">
                <DetailsButton transactionId={data.escrow_contract_id} />
            </div>
        );
    }

    if (data.status === "escrow_awaited") {
        if (ctx.auth.actor == user1) {
            return (
                <div className="transaction-actions">
                    <Button
                        label="Escrow"
                        loading={loading}
                        //onClick={() => handleUpdate("escrow")}
                    />
                </div>
            );
        } else {
            return (
                <div className="transaction-actions">
                    <strong>{`Waiting for @${user1} to escrow`}</strong>
                </div>
            );
        }
    }

    if (data.status === "delivered") {
        if (ctx.auth.actor == user1) {
            return (
                <div className="transaction-actions">
                    <Button
                        label="Received"
                        loading={loading}
                        //onClick={() => handleUpdate("escrow")}
                    />
                </div>
            );
        } else {
            return (
                <div className="transaction-actions">
                    <strong>{`Waiting for @${user1} to confirm receipt`}</strong>
                </div>
            );
        }
    }

    if (data.status === "confirmed") {
        if (showDetails) {
            if (
                ctx.auth.actor == responder &&
                data.transfer_type === "delivery"
            ) {
                //Show delivered button on details page
                return (
                    <div className="transaction-actions">
                        <Button
                            label="Delivered"
                            loading={loading}
                            onClick={() => handleUpdate("delivered")}
                        />
                    </div>
                );
            } else {
                return (
                    <div className="transaction-actions">
                        <strong>{userMessage}</strong>
                    </div>
                );
            }
        } else {
            //Show details button on list page
            return (
                <div className="transaction-actions">
                    <DetailsButton transactionId={data.escrow_contract_id} />
                </div>
            );
        }
    }

    if (data.status === "ready") {
        if (!showDetails) {
            //Actions for list page
            return (
                <div className="transaction-actions">
                    {/* <strong>{userMessage}</strong> */}
                    <DetailsButton transactionId={data.escrow_contract_id} />
                </div>
            );
        } else {
            //Actions for detail page
            if (ctx.auth.actor == responder) {
                return (
                    <Fragment>
                        <div className="transaction-actions">
                            <Button
                                label="Accept"
                                className="btn-accept"
                                onClick={() => setConfirmationPopup(true)}
                            />
                            <Button
                                label="Negotiate"
                                onClick={() => setNegotiate(true)}
                            />
                        </div>
                        <p className="instructions">
                            If the contract is not correct you may select
                            Negotiate, change terms, and upload Images of the
                            item
                        </p>
                    </Fragment>
                );
            } else {
                return (
                    <div className="transaction-actions">
                        <strong>{userMessage}</strong>
                    </div>
                );
            }
        }
    }
    return null;
};

export default PurchaseAction;
