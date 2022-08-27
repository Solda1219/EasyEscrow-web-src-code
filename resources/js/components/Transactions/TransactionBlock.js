import { Fragment } from "react";
import CardContest from "./Cards/CardContest";
import CardCryptoExchange from "./Cards/CardCryptoExchange";
import CardCryptoGift from "./Cards/CardCryptoGift";
import CardPurchaseItem from "./Cards/CardPurchaseItem";

const TransactionType = [
    { id: 1, type: "Crypto Exchange" },
    { id: 2, type: "Crypto Gift" },
    { id: 3, type: "Purchase an Item" },
    { id: 4, type: "Perform a Service" },
    { id: 5, type: "Pool / Contest" },
];

const TransactionBlock = ({ data, reloadTransactions, showDetails }) => {
    const TransactionTitle = TransactionType.filter(
        (type) => type.id === data.type_id
    );

    return (
        <Fragment>
            {data.type_id == 1 && (
                <CardCryptoExchange
                    data={data}
                    reloadTransactions={reloadTransactions}
                    TransactionTitle={TransactionTitle[0].type}
                />
            )}

            {data.type_id == 2 && (
                <CardCryptoGift
                    data={data}
                    reloadTransactions={reloadTransactions}
                    TransactionTitle={TransactionTitle[0].type}
                />
            )}

            {(data.type_id == 3 || data.type_id == 4) && (
                <CardPurchaseItem
                    data={data}
                    reloadTransactions={reloadTransactions}
                    TransactionTitle={TransactionTitle[0].type}
                    showDetails={showDetails}
                />
            )}

            {data.type_id == 5 && (
                <CardContest
                    data={data}
                    reloadTransactions={reloadTransactions}
                    TransactionTitle={TransactionTitle[0].type}
                    showDetails={showDetails}
                />
            )}
        </Fragment>
    );
};

export default TransactionBlock;
