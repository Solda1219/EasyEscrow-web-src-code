import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthContextProvider } from "./store/auth-context";
import Home from "./pages/Home";
import Layout from "./Layout";
import PageLoader from "./components/ui/PageLoader";
import { WalletContextProvider } from "./store/wallet-context";

const CryptoExchange = React.lazy(() => import("./pages/CryptoExchange"));
const ExchangeAction = React.lazy(() =>
    import("./components/Transactions/ExchangeAction")
);
const CryptoGift = React.lazy(() => import("./pages/CryptoGift"));
const PurchaseItem = React.lazy(() => import("./pages/PurchaseItem"));
const PerformService = React.lazy(() => import("./pages/PerformService"));
const Contest = React.lazy(() => import("./pages/Contest"));
const TransactionsList = React.lazy(() => import("./pages/TransactionsList"));
const TransactionDetail = React.lazy(() => import("./pages/TransactionDetail"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const NewsletterPage = React.lazy(() => import("./pages/Newsletter"));
const Token = React.lazy(() => import("./pages/Token"));

function Index() {
    return (
        <AuthContextProvider>
            <WalletContextProvider>
                <Layout>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/" exact element={<Home />} />
                            <Route
                                path="/exchange"
                                element={<CryptoExchange />}
                            />
                            <Route
                                path="/exchange/:escrowId/:user1Acc"
                                element={<ExchangeAction />}
                            />
                            <Route path="/gift" element={<CryptoGift />} />
                            <Route
                                path="/purchase"
                                element={<PurchaseItem />}
                            />
                            <Route
                                path="/service"
                                element={<PerformService />}
                            />

                            <Route path="/contest" element={<Contest />} />
                            <Route
                                path="/transactions"
                                element={<TransactionsList />}
                            />
                            <Route
                                path="/escrow"
                                element={<TransactionDetail />}
                            >
                                <Route
                                    path=":transactionId"
                                    element={<TransactionDetail />}
                                />
                            </Route>
                            <Route
                                path="/newsletter"
                                element={<NewsletterPage />}
                            />
                            <Route path="/token" element={<Token />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </Layout>
            </WalletContextProvider>
        </AuthContextProvider>
    );
}

export default Index;

if (document.getElementById("root")) {
    ReactDOM.render(
        <BrowserRouter>
            <Index />
        </BrowserRouter>,
        document.getElementById("root")
    );
}
