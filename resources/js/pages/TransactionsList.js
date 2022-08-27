import { Fragment, useContext, useEffect, useState } from "react";
import { Bars } from "react-loader-spinner";
import TransactionBlock from "../components/Transactions/TransactionBlock";
import AuthContext from "../store/auth-context";
import CustomDropdown from "../components/ui/Dropdown";

const TransactionsList = () => {
    const ctx = useContext(AuthContext);
    const [transactionsData, setTransactionsData] = useState();
    const [transactionsType, setTransactionsType] = useState("all");
    const [transactionsStatus, setTransactionsStatus] = useState("any");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(false);

    const type = [
        { key: "all", label: "All Transactions" },
        { key: "1", label: "Crypto Exchange" },
        { key: "2", label: "Crypto Gift" },
        { key: "3", label: "Purchase an Item" },
        { key: "4", label: "Purchase a Service" },
        { key: "5", label: "Pool / Contest" },
    ];
    const status = [
        { key: "any", label: "Any" },
        { key: "ready", label: "Ready" },
        { key: "completed", label: "Completed" },
        { key: "cancelled", label: "Cancelled" },
    ];

    const reloadTransactions = () => {
        loadTransactionsList(transactionsType, transactionsStatus);
    };

    const handleTypeChange = (value) => {
        setTransactionsType(value);
        loadTransactionsList(value, transactionsStatus);
    };

    const handleStatusChange = (value) => {
        setTransactionsStatus(value);
        //console.log(value);
        loadTransactionsList(transactionsType, value);
    };

    const loadTransactionsList = (type, status) => {
        setLoading(true);
        fetch(`${process.env.MIX_API_URL}/user/transaction_list`, {
            method: "POST",
            body: JSON.stringify({
                trans_type: type,
                trans_status: status,
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
                if (data.valid) {
                    let records = data.data;
                    records.sort((a, b) => {
                        return new Date(b.created_at) - new Date(a.created_at); // ascending
                    });
                    setTransactionsData(records);
                    window.scrollTo({
                        top: 250,
                        left: 0,
                        behavior: "smooth",
                    });
                } else {
                    setTransactionsData(null);
                    setMessage(data.message);
                }
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
            });
    };

    useEffect(() => {
        let mounted = true;
        if (mounted) {
            if (ctx.walletName)
                loadTransactionsList(transactionsType, transactionsStatus);
        }
        return () => (mounted = false);
    }, [ctx.walletName]);

    return (
        <Fragment>
            <main>
                <div className="container banner-inner">
                    <h2>Your Transactions</h2>
                    <div className="filters">
                        <div className="form-row">
                            <label htmlFor="type-filter">
                                Filter by transaction type:
                            </label>
                            <CustomDropdown
                                options={type}
                                selectedOption={type[0]}
                                setSelectedOption={handleTypeChange}
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="type-filter">
                                Filter by transaction status:
                            </label>
                            <CustomDropdown
                                options={status}
                                selectedOption={status[0]}
                                setSelectedOption={handleStatusChange}
                            />
                        </div>
                    </div>
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

                        {transactionsData &&
                            !loading &&
                            transactionsData.map((data) => (
                                <TransactionBlock
                                    key={data.id}
                                    reloadTransactions={reloadTransactions}
                                    data={data}
                                    showDetails={false}
                                />
                            ))}
                    </div>
                </div>
            </main>
        </Fragment>
    );
};

export default TransactionsList;
