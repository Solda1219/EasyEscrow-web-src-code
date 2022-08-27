import ConnectWallet from "@proton/web-sdk";

import Logo from "../../images/logo.svg";

import { current_network } from "../constants/networks";

class ProtonSDK {
    constructor() {
        // this.chainId =
        //     "384da888112027f0321850a169f737c33e53b388aad48b5adace4bab97f437e0";
        this.endpoints = [current_network.endpoint]; // Multiple for fault tolerance
        this.appName = "EasyEscrow";
        this.session = undefined;
        this.link = undefined;
        this.balances = {};
        this.balancesFetched = false;
        this.requestAccount = "easyescrow1";
        this.appLogo = Logo;
    }
    login = async (customStyleOptions) => {
        try {
            const connect = await ConnectWallet({
                linkOptions: {
                    chainId: this.chainId,
                    endpoints: this.endpoints,
                },
                transportOptions: {
                    requestAccount: this.requestAccount,
                    backButton: true,
                },
                selectorOptions: {
                    appName: this.appName,
                    appLogo: this.appLogo,
                    customStyleOptions,
                },
            });
            this.link = connect.link;
            this.session = connect.session;
            return {
                auth: connect.session.auth,
                link: this.link,
                session: this.session,
            };
        } catch (e) {
            return e;
        }
    };
    restoreSession = async () => {
        try {
            const { link, session } = await ConnectWallet({
                linkOptions: {
                    chainId: this.chainId,
                    endpoints: this.endpoints,
                    restoreSession: true,
                },
                transportOptions: { requestAccount: this.requestAccount },
                selectorOptions: {
                    appName: this.appName,
                    appLogo: this.appLogo,
                    showSelector: false,
                },
            });
            this.link = link;
            this.session = session;

            if (session) {
                return {
                    auth: this.session.auth,
                    link: this.link,
                    session: this.session,
                };
            } else {
                return { auth: { actor: "", permission: "" } };
            }
        } catch (e) {
            return e;
        }
    };
    logout = async () => {
        await this.restoreSession();
        if (this.link) {
            await this.link.removeSession(
                this.requestAccount,
                this.session.auth
            );
        }
    };
}

export default ProtonSDK;
