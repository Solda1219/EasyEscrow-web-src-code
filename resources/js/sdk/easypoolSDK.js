//Use API to save transaction details
import { ApiClass } from "@proton/api";
import { current_network } from "../constants/networks";

const api = new ApiClass(current_network.chain);
const contract = "easyescrowpl";

const feeContract = "xtokens";
const feeQuantity = "0.250000 XUSDC";

export async function fetchEscrowAll() {
    const { rows } = await api.rpc.get_table_rows({
        code: contract,
        scope: contract,
        table: "escrows",
        index_position: 2,
        key_type: "i64",
        limit: -1,
    });
    return rows;
}

export async function fetchEscrows(accountName) {
    const { rows } = await api.rpc.get_table_rows({
        code: contract,
        scope: contract,
        table: "escrows",
        index_position: 2,
        key_type: "i64",
        lower_bound: accountName,
        upper_bound: accountName,
        limit: -1,
    });
    return rows;
}
export async function startPool(
    from,
    contesters,
    fromToken,
    fromAmount,
    fromNfts,
    expiry,
    authorization,
    session
) {
    const amountIn = parseFloat(fromAmount)
        .toFixed(Number(fromToken.decimals))
        .toString();
    const fromQuantity = amountIn + " " + fromToken.currency;
    const actions = [
        {
            account: feeContract,
            name: "transfer",
            data: {
                from: from,
                to: contract,
                quantity: feeQuantity,
                memo: `${from} deposit a fee for a pool.`,
            },
            authorization,
        },
        {
            account: fromToken.contract,
            name: "transfer",
            data: {
                from: from,
                to: contract,
                quantity: fromQuantity,
                memo: `${from} deposit for a pool`,
            },
            authorization,
        },
        {
            account: contract,
            name: "startpool",
            data: {
                from: from,
                contesters: contesters,
                fromTokens: [
                    {
                        contract: fromToken.contract,
                        quantity: fromQuantity,
                    },
                ],
                fromNfts: fromNfts,
                expiry: expiry,
            },
            authorization,
        },
    ];

    await session.transact({
        transaction: {
            actions,
        },
    });
}

export async function partakePool(
    actor,
    escrowId,
    fromToken,
    authorization,
    session
) {
    const actions = [
        {
            account: feeContract,
            name: "transfer",
            data: {
                from: actor,
                to: contract,
                quantity: feeQuantity,
                memo: `${actor} deposit a fee for a purchase.`,
            },
            authorization,
        },
        {
            account: fromToken.contract,
            name: "transfer",
            data: {
                from: actor,
                to: contract,
                quantity: fromToken.quantity,
                memo: `${actor} deposit for a pool`,
            },
            authorization,
        },
        {
            account: contract,
            name: "partakepool",
            data: {
                actor: actor,
                id: escrowId.toString(),
            },
            authorization,
        },
    ];

    await session.transact({
        transaction: {
            actions,
        },
    });
}
export async function cancelPool(actor, escrowId, authorization, session) {
    const actions = [
        {
            account: contract,
            name: "cancelpool",
            data: {
                actor: actor,
                id: escrowId.toString(),
            },
            authorization,
        },
    ];

    await session.transact({
        transaction: {
            actions,
        },
    });
}

export async function fillPool(
    actor,
    escrowId,
    winners,
    authorization,
    session
) {
    const actions = [
        {
            account: contract,
            name: "fillpool",
            data: {
                from: actor,
                id: escrowId.toString(),
                winners: winners,
            },
            authorization,
        },
    ];

    await session.transact({
        transaction: {
            actions,
        },
    });
}
// const history = await api.getActionsFromHyperion(ctx.auth.actor, {
//     limit: 10,
//     skip: 0,
//     sort: "desc",
//     filter: contract*",
// });

// console.log("History", history);
