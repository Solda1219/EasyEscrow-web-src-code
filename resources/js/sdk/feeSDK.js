//Use API to save transaction details
import { ApiClass } from "@proton/api";
import { current_network } from "../constants/networks";

const api = new ApiClass(current_network.chain);
const contract14 = "easyescrow2";
const contract5 = "easyescrowpl";
const contract = contract14;

const feeContract = "xtokens";
const feeQuantity = "0.250000 XUSDC";

export async function fetchFeeAll() {
    const { rows } = await api.rpc.get_table_rows({
        code: contract,
        scope: contract,
        table: "fees",
        index_position: 2,
        key_type: "i64",
        limit: -1,
    });
    return rows;
}

export async function fetchFees(accountName) {
    const { rows } = await api.rpc.get_table_rows({
        code: contract,
        scope: contract,
        table: "fees",
        index_position: 2,
        key_type: "i64",
        lower_bound: accountName,
        upper_bound: accountName,
        limit: -1,
    });
    return rows;
}

// new ExtendedAsset(
//     new Asset(2500000, new Symbol("XUSDC", 6)),
//     Name.fromString("xtokens")
// );
// {"contract":"xtokens","quantity":"0.250000 XUSDC"}
export async function setFee(feeId, authorization, session) {
    const actions = [
        {
            account: contract14,
            name: "setfee",
            data: {
                feeId: feeId,
                feeVal: {
                    contract: feeContract,
                    quantity: feeQuantity,
                },
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
export async function setPoolFee(feeId, authorization, session) {
    const actions = [
        {
            account: contract5,
            name: "setfee",
            data: {
                feeId: feeId,
                feeVal: {
                    contract: feeContract,
                    quantity: feeQuantity,
                },
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
