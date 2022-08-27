import { Fragment, useContext, useState } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import AuthContext from "../../../store/auth-context";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";

const CardContest = ({
    data,
    TransactionTitle,
    reloadTransactions,
    showDetails,
}) => {
    const ctx = useContext(AuthContext);
    const [confirmationPopup, setConfirmationPopup] = useState(false);
    const [successPopup, setSuccessPopup] = useState(false);
    const [responseType, setResponseType] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [number, setNumber] = useState("");
    const [date, setDate] = useState("");

    const poolType =
        data.pool_type === "date" ? "A Calendar date" : "A Numerical value";

    let participation = true;
    let poolOutcome = "";

    if (data.negotiations && data.negotiations.length > 0) {
        data.negotiations.map((neg) => {
            if (neg.username === ctx.user.username) {
                participation = false;
                if (data.pool_type == "date") {
                    poolOutcome = moment(neg.pool_outcome).format(
                        "DD MMM YYYY"
                    );
                } else {
                    poolOutcome = neg.pool_outcome;
                }
            }
        });
    }

    const handleResponse = (response_type) => {
        setConfirmationPopup(true);
        setResponseType(response_type);
    };

    const updateDate = (event) => {
        setDate(event.target.value);
    };

    const validate = () => {
        if (data.pool_type === "integer" && (isNaN(number) || number <= 0)) {
            setError("Please enter a valid number");
            return;
        }
        if (data.pool_type === "date" && date == undefined) {
            setError("Please enter a valid date");
            return;
        }
    };

    const handleActionComplete = (event) => {
        event.preventDefault();
        validate();
        const outcome = data.pool_type === "date" ? date : number;
        handleUpdateData("pool_complete", outcome);
    };

    const handleActionCancel = () => {
        handleUpdateData("pool_cancel");
    };

    const handleActionParticipate = (event) => {
        event.preventDefault();
        validate();
        const outcome = data.pool_type === "date" ? date : number;
        handleUpdateData("pool_update", outcome);
    };

    const handleUpdateData = (action, outcome) => {
        //Participate: action = pool_update (pool_outcome)
        //Complete: action = pool_complete (pool_outcome)
        //Cancel: action = pool_cancel

        const escrowId = data.escrow_contract_id;

        let postBody = "";
        if (action == "pool_update" || action == "pool_complete") {
            postBody = JSON.stringify({
                type_id: 5,
                action: action,
                escrow_id: data.id,
                pool_outcome: outcome,
            });
        } else {
            postBody = JSON.stringify({
                type_id: 5,
                action: action,
                escrow_id: data.id,
            });
        }

        try {
            setLoading(true);
            fetch(`${process.env.MIX_API_URL}/user/escrow_update`, {
                method: "POST",
                body: postBody,
                headers: {
                    Authorization: "Bearer " + ctx.token,
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
                        setConfirmationPopup(false);
                        setSuccessPopup(true);
                        setSuccess(data.message);
                        reloadTransactions(escrowId);
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
            <div className={`transaction-block ${data.status}`}>
                <div className="transaction-header">
                    <strong>{TransactionTitle}</strong>
                    <span>
                        Date: {moment(data.created_at).format("DD MMM YYYY")}
                    </span>
                </div>
                <p className="transaction-detail">
                    {`Pool/Contest titled ${data.title} for ${data.amount} ${data.token}`}
                </p>
                {showDetails && (
                    <Fragment>
                        <div className="transaction-desc">
                            {data.description}
                        </div>
                        <div className="transaction-desc">
                            Pool is for: {poolType}
                        </div>
                        {ctx.user.username == data.username && (
                            <div className="transaction-desc">
                                Participants: {data.negotiations.length}
                            </div>
                        )}
                        {data.status == "completed" && (
                            <Fragment>
                                <div className="transaction-desc">
                                    Pool Outcome:{" "}
                                    {data.pool_type == "date"
                                        ? moment(data.pool_outcome).format(
                                              "DD MMM YYYY"
                                          )
                                        : data.pool_outcome}
                                </div>
                                {data.winners.length > 0 && (
                                    <div>
                                        <h4>
                                            {data.winners.length > 1
                                                ? "Winners"
                                                : "Winner"}
                                        </h4>
                                        <ul>
                                            {data.winners.map((winner) => {
                                                return (
                                                    <li key={winner.id}>
                                                        @{winner.username}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </Fragment>
                        )}
                        {data.status == "ready" && !participation && (
                            <Fragment>
                                <div className="transaction-desc">
                                    Pool Outcome: {poolOutcome}
                                </div>
                            </Fragment>
                        )}
                    </Fragment>
                )}
                <div className="transaction-actions">
                    {!showDetails ? (
                        <Link
                            to={`/escrow/${data.escrow_contract_id}`}
                            className="btn"
                        >
                            Details
                        </Link>
                    ) : (
                        <Fragment>
                            {data.status !== "completed" && (
                                <Fragment>
                                    {ctx.user.username == data.username ? (
                                        <Fragment>
                                            <Button
                                                label="Cancel"
                                                className="btn-cancel"
                                                onClick={() =>
                                                    handleResponse("cancelled")
                                                }
                                            />
                                            <Button
                                                label="Complete"
                                                className="btn-accept"
                                                onClick={() =>
                                                    handleResponse("completed")
                                                }
                                            />
                                        </Fragment>
                                    ) : (
                                        <Fragment>
                                            {participation && (
                                                <Button
                                                    label="Participate"
                                                    onClick={() =>
                                                        handleResponse(
                                                            "participate"
                                                        )
                                                    }
                                                />
                                            )}
                                        </Fragment>
                                    )}
                                </Fragment>
                            )}
                        </Fragment>
                    )}
                </div>
            </div>

            {confirmationPopup && (
                <Modal hidePopup={() => setConfirmationPopup(false)}>
                    {responseType === "completed" && (
                        <form onSubmit={handleActionComplete}>
                            <h3 className="modal-header">
                                Complete Pool / Contest
                            </h3>
                            <div className="form-row">
                                {poolType == "A Numerical value" ? (
                                    <Fragment>
                                        <label htmlFor="contest-amount">
                                            Enter a numerical amount as result
                                            of this pool / contest:
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            id="contest-amount"
                                            value={number}
                                            onChange={(event) =>
                                                setNumber(event.target.value)
                                            }
                                        />
                                    </Fragment>
                                ) : (
                                    <Fragment>
                                        <label htmlFor="contest-amount">
                                            Enter a date as result of this pool
                                            / contest:
                                        </label>
                                        <input
                                            type="date"
                                            id="contest-date"
                                            onChange={(event) =>
                                                updateDate(event)
                                            }
                                        />
                                    </Fragment>
                                )}
                            </div>
                            {error !== "" && (
                                <div className="form-row error">{error}</div>
                            )}
                            <div className="form-row">
                                <Button
                                    label="Complete"
                                    className="btn-accept"
                                    type="submit"
                                    loading={loading}
                                />
                            </div>
                        </form>
                    )}

                    {responseType === "cancelled" && (
                        <Fragment>
                            <h3 className="modal-header">
                                Cancel Pool / Contest
                            </h3>
                            <p>
                                Are you sure you want to cancel this pool /
                                contest
                            </p>
                            <p>Note: This action can not be undone</p>
                            <div className="form-row">
                                <Button
                                    label="Cancel"
                                    className="btn-cancel"
                                    onClick={handleActionCancel}
                                    loading={loading}
                                />
                            </div>
                        </Fragment>
                    )}

                    {responseType === "participate" && (
                        <form onSubmit={handleActionParticipate}>
                            <h3 className="modal-header">
                                Participate in Pool / Contest
                            </h3>
                            <div className="form-row">
                                {poolType == "A Numerical value" ? (
                                    <Fragment>
                                        <label htmlFor="contest-amount">
                                            Enter a numerical amount to
                                            participate in this pool / contest:
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            id="contest-amount"
                                            value={number}
                                            onChange={(event) =>
                                                setNumber(event.target.value)
                                            }
                                        />
                                    </Fragment>
                                ) : (
                                    <Fragment>
                                        <label htmlFor="contest-amount">
                                            Enter a date to participate in this
                                            pool / contest:
                                        </label>
                                        <input
                                            type="date"
                                            id="contest-date"
                                            onChange={(event) =>
                                                updateDate(event)
                                            }
                                        />
                                    </Fragment>
                                )}
                            </div>
                            {error !== "" && (
                                <div className="form-row error">{error}</div>
                            )}
                            <div className="form-row">
                                <Button
                                    label="Submit"
                                    type="submit"
                                    loading={loading}
                                />
                            </div>
                        </form>
                    )}
                </Modal>
            )}

            {successPopup && (
                <Modal hidePopup={() => setSuccessPopup(false)}>
                    <div>
                        <h3 className="modal-header">Pool / Contest</h3>
                        <div className="form-row success">
                            <p>{success}</p>
                        </div>
                        <div className="modal-confirm">
                            <Button
                                label="Done"
                                onClick={() => setSuccessPopup(false)}
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </Fragment>
    );
};

export default CardContest;
