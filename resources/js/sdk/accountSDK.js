import * as LightApi from "@eoscafe/light-api";
import {current_network} from "../constants/networks";

export async function getLightAccount(account) {
    try {
        const chain = current_network.chain;
        const lightApi = new LightApi.JsonRpc(chain.replace("-", ""));
        return lightApi.get_account_info(account);
    } catch (e) {
        return undefined;
    }
}

export async function getLightBalances(account) {
    try {
        const chain = current_network.chain;
        const lightApi = new LightApi.JsonRpc(
            chain.toLowerCase().replace("-", "")
        );
        const { balances } = await lightApi.get_balances(account);
        return balances;
    } catch (e) {
        return undefined;
    }
}
