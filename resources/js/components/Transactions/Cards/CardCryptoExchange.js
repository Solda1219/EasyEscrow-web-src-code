import { useContext } from "react";
import Moment from "react-moment";
import AuthContext from "../../../store/auth-context";
import ExchangeAction from "../ExchangeAction";

const ExchangeStatus = ({
    status,
    firstUser,
    secondUser,
    type_id,
    escrow_id,
    dateUpdated,
    reloadTransactions,
}) => {
    if (status == "ready") {
        if (firstUser) {
            return (
                <span className="message">
                    Waiting for @{secondUser} to accept this transaction
                </span>
            );
        } else {
            return (
                <ExchangeAction
                    type_id={type_id}
                    escrow_id={escrow_id}
                    reloadTransactions={reloadTransactions}
                />
            );
        }
    }

    if (status == "completed") {
        return (
            <span className="message">
                @{secondUser} has accept this transaction on{" "}
                <Moment format="DD MMM YYYY">{dateUpdated}</Moment>
            </span>
        );
    }

    if (status == "cancelled") {
        return (
            <span className="message">
                @{secondUser} has rejected this transaction on{" "}
                <Moment format="DD MMM YYYY">{dateUpdated}</Moment>
            </span>
        );
    }
};

const CardCryptoExchange = ({ data, TransactionTitle, reloadTransactions }) => {
    const ctx = useContext(AuthContext);

    const transactionDetails = (data) => {
        return (
            <p className="transaction-detail">
                {`@${data.username} to exchange ${data.amount} ${data.token} with @${data.trade_username} for ${data.trade_amount} ${data.trade_token}`}
            </p>
        );
    };

    const transactionAction = (data, reloadTransactions) => {
        return (
            <div className="transaction-actions">
                <ExchangeStatus
                    type_id={data.type_id}
                    escrow_id={data.escrow_contract_id}
                    status={data.status}
                    firstUser={ctx.auth.actor === data.username}
                    secondUser={data.trade_username}
                    dateUpdated={data.status_change_at}
                    reloadTransactions={reloadTransactions}
                />
            </div>
        );
    };

    return (
        <div className={`transaction-block ${data.status}`}>
            <div className="transaction-header">
                <strong>{TransactionTitle}</strong>
                <span>
                    Date:{" "}
                    <Moment format="DD MMM YYYY">{data.created_at}</Moment>
                </span>
            </div>
            {transactionDetails(data)}
            {transactionAction(data, reloadTransactions)}
        </div>
    );
};

export default CardCryptoExchange;
