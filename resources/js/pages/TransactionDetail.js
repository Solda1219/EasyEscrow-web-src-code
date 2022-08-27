import { Fragment, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bars } from "react-loader-spinner";
import TransactionBlock from "../components/Transactions/TransactionBlock";
import AuthContext from "../store/auth-context";

const TransactionDetail = () => {
    const { transactionId } = useParams();
    const ctx = useContext(AuthContext);

    const [transactionsData, setTransactionsData] = useState();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("No matching record found.");

    const reloadTransactions = (id) => {
        getTransactionDetails(id);
    };

    const getTransactionDetails = (id) => {
        setLoading(true);
        fetch(`${process.env.MIX_API_URL}/user/transaction_detail`, {
            method: "POST",
            body: JSON.stringify({
                id: id,
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
                    setTransactionsData(data.data);
                    window.scrollTo({
                        top: 250,
                        left: 0,
                        behavior: "smooth",
                    });
                } else {
                    setMessage(data.message);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        let mounted = true;
        if (mounted) {
            if (transactionId && ctx.walletName) {
                getTransactionDetails(transactionId);
            }
        }
        return () => (mounted = false);
    }, [transactionId, ctx.walletName]);

    return (
        <Fragment>
            <main>
                <div className="container banner-inner">
                    <h2>Transaction Details</h2>
                </div>
                <div className="container block">
                    <div className="transactions">
                        {!transactionsData && !loading && (
                            <div className="transaction-empty">
                                <span>{message}</span>
                            </div>
                        )}

                        {loading && (
                            <div className="transaction-empty">
                                <Bars
                                    height="30"
                                    width="30"
                                    color="#F2AE00"
                                    ariaLabel="loading-indicator"
                                />
                            </div>
                        )}

                        {transactionsData && !loading && (
                            <TransactionBlock
                                key={transactionsData.id}
                                data={transactionsData}
                                reloadTransactions={reloadTransactions}
                                showDetails={true}
                            />
                        )}
                    </div>
                </div>
            </main>
        </Fragment>
    );
};

export default TransactionDetail;
