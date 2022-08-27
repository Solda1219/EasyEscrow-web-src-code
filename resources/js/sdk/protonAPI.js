import { JsonRpc, Api, JsSignatureProvider } from "@proton/js";
import fetch from "node-fetch";
import { current_network } from "../constants/networks";

export const rpc = new JsonRpc([current_network.endpoint], { fetch: fetch });
export const api = new Api({
    rpc,
    signatureProvider: new JsSignatureProvider([
        "PVT_K1_2Sg3jdbgAfc8fJct2MVHpUjRWJvtDhitxD5p59warXSQrXXWA3",
    ]),
});

export function transact(actions) {
    console.log("come here, then why?");
    api.transact(
        { actions },
        {
            blocksBehind: 300,
            expireSeconds: 3000,
        }
    );
}
