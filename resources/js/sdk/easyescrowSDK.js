//Use API to save transaction details
import { ApiClass } from "@proton/api";
import axios from "axios";
import { current_network } from "../constants/networks.js";
import { transact } from "./protonAPI.js";

const api = new ApiClass(current_network.chain);
const contract = "easyescrow2";

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

export async function startEscrow(
    typeId,
    from,
    to,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    deliverType,
    expiry,
    authorization,
    session
) {
    const amountIn = parseFloat(fromAmount)
        .toFixed(Number(fromToken.decimals))
        .toString();
    const fromQuantity = amountIn + " " + fromToken.currency;
    let actions = [];
    if (typeId == 1) {
        const amountOut = parseFloat(toAmount)
            .toFixed(Number(toToken.decimals))
            .toString();
        const toQuantity = amountOut + " " + toToken.currency;
        actions = [
            {
                account: feeContract,
                name: "transfer",
                data: {
                    from: from,
                    to: contract,
                    quantity: feeQuantity,
                    memo: `${from} deposit a fee for exchange.`,
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
                    memo: `${from} deposit for exchange.`,
                },
                authorization,
            },
            {
                account: contract,
                name: "startescrow",
                data: {
                    typeId: typeId,
                    from: from,
                    to: to,
                    fromTokens: [
                        {
                            contract: fromToken.contract,
                            quantity: fromQuantity,
                        },
                    ],
                    fromNfts: [],
                    toTokens: [
                        {
                            contract: toToken.contract,
                            quantity: toQuantity,
                        },
                    ],
                    toNfts: [],
                    deliverType: deliverType,
                    expiry: expiry,
                },
                authorization,
            },
        ];
    } else if (typeId == 2) {
        actions = [
            {
                account: feeContract,
                name: "transfer",
                data: {
                    from: from,
                    to: contract,
                    quantity: feeQuantity,
                    memo: `${from} deposit a fee for a gift.`,
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
                    memo: `${from} deposit for a gift`,
                },
                authorization,
            },
            {
                account: contract,
                name: "startescrow",
                data: {
                    typeId: typeId,
                    from: from,
                    to: to,
                    fromTokens: [
                        {
                            contract: fromToken.contract,
                            quantity: fromQuantity,
                        },
                    ],
                    fromNfts: [],
                    toTokens: [],
                    toNfts: [],
                    deliverType: deliverType,
                    expiry: Math.floor(expiry / 1000),
                },
                authorization,
            },
        ];
    } else if (typeId == 3 || typeId == 4) {
        let memo = `${from} deposited for Purchase Item.`;
        if (typeId == 4) {
            memo = `${from} deposited for Purchase Service.`;
        }
        //in this case only store to proton db. not send coin
        actions = [
            {
                account: contract,
                name: "startescrow",
                data: {
                    typeId: typeId,
                    from: from,
                    to: to,
                    fromTokens: [
                        {
                            contract: fromToken.contract,
                            quantity: fromQuantity,
                        },
                    ],
                    fromNfts: [],
                    toTokens: [],
                    toNfts: [],
                    deliverType: deliverType,
                    expiry: expiry,
                },
                authorization,
            },
        ];
    }

    await session.transact({
        transaction: {
            actions,
        },
    });
}

export async function fillEscrow(
    escrowId,
    typeId,
    actor,
    toToken,
    authorization,
    session
) {
    let actions = [];
    if (typeId == 1) {
        actions = [
            {
                account: feeContract,
                name: "transfer",
                data: {
                    from: actor,
                    to: contract,
                    quantity: feeQuantity,
                    memo: `${actor} deposit a fee for exchange.`,
                },
                authorization,
            },
            {
                account: toToken.contract,
                name: "transfer",
                data: {
                    from: actor,
                    to: contract,
                    quantity: toToken.quantity,
                    memo: `${actor} deposit for exchange.`,
                },
                authorization,
            },
            {
                account: contract,
                name: "fillescrow",
                data: {
                    actor: actor,
                    id: escrowId.toString(),
                },
                authorization,
            },
        ];
    } else if (typeId == 2) {
        const contractauth = [
            {
                actor: contract,
                permission: "active",
            },
        ];
        actions = [
            {
                account: contract,
                name: "fillescrow",
                data: {
                    actor: actor,
                    id: escrowId.toString(),
                },
                authorization: contractauth,
            },
        ];
        try {
            const result = await transact(actions);
            console.log("result", result);
            return result;
        } catch (error) {
            console.error("error here??", error);
        }
    } else if (typeId == 3 || typeId == 4) {
        actions = [
            {
                account: contract,
                name: "fillescrow",
                data: {
                    actor: actor,
                    id: escrowId.toString(),
                },
                authorization,
            },
        ];
    }
    if (typeId != 2) {
        await session.transact({
            transaction: {
                actions,
            },
        });
    }
}
export async function cancelEscrow(escrowId, actor, authorization, session) {
    const actions = [
        {
            account: contract,
            name: "cancelescrow",
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

export async function startPurchase(from, token, authorization, session) {
    const actions = [
        {
            account: feeContract,
            name: "transfer",
            data: {
                from: from,
                to: contract,
                quantity: feeQuantity,
                memo: `${from} deposit a fee for a purchase.`,
            },
            authorization,
        },
        {
            account: token.contract,
            name: "transfer",
            data: {
                from: from,
                to: contract,
                quantity: token.quantity,
                memo: `${from} deposit for purchase.`,
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

export async function negoPurchase(
    escrowId,
    typeId,
    from,
    to,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    deliverType,
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
            account: contract,
            name: "negopurchase",
            data: {
                escrowId: escrowId,
                typeId: typeId,
                from: from,
                to: to,
                fromTokens: [
                    {
                        contract: fromToken.contract,
                        quantity: fromQuantity,
                    },
                ],
                fromNfts: [],
                toTokens: [],
                toNfts: [],
                deliverType: deliverType,
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

const tablerows = async () => {
    const protonrows = await fetchEscrowAll();
    console.log(protonrows);
    if (Object.keys(protonrows).length != 0) {
        for (const obj of protonrows) {
            const newdatetenminutes = new Date();
            const difference = newdatetenminutes.getMinutes() - 10;
            newdatetenminutes.setMinutes(difference);

            const timestamp = obj.expiry * 1000;
            const date = new Date(timestamp);

            if (date > newdatetenminutes && date <= new Date()) {
                console.log("current date", new Date());
                console.log("calling fill gift function");
                console.log("running escrow", obj.id);
                console.log("running escrow date", date);

                async function giftresponsecall() {
                    const giftresponse = await fillEscrow(
                        obj.id,
                        2,
                        obj.from,
                        null,
                        null,
                        null
                    );
                    if (giftresponse) {
                        let res = {
                            escrow_id: obj.id,
                            type_id: 2,
                        };
                        let datas = JSON.stringify(res);
                        axios({
                            method: "post",
                            url: "https://easyescrow.io/api/user/gift-update-status",
                            data: datas,
                            config: {
                                headers: { "Content-Type": "application/json" },
                            },
                        })
                            .then(function (response) {
                                console.log(response.data.response);
                            })
                            .catch(function (response) {
                                console.log(response);
                            });
                    } else {
                        console.log(giftresponse);
                    }
                }
                giftresponsecall();
            } else {
                console.log("skip escrow", obj.id);
                console.log("skip escrow date", date);
                console.log("current date", new Date());
            }
        }
    } else {
        console.log("no rows found");
    }
};
tablerows();

// const history = await api.getActionsFromHyperion(ctx.auth.actor, {
//     limit: 10,
//     skip: 0,
//     sort: "desc",
//     filter: contract*",
// });

// console.log("History", history);
