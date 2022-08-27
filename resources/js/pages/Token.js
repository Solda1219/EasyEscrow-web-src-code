const Token = () => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
    });

    return (
        <main>
            <div className="container banner-inner">
                <h1>$EASY Token</h1>
            </div>
            <div className="container block">
                <div className="transactions content">
                    <h3>The platform:</h3>
                    <p>
                        Easy Escrow is a blockchain based, decentralized, and
                        tokenized, escrow and trading platform. All the escrow
                        options are controlled by smart contracts. Two or more
                        parties can contribute to the smart contract and the
                        contract performs when all conditions are met. The
                        platform itself is governed by a DAO (Decentralized
                        Autonomous Organization). A DAO can be described as a
                        transparent governing body, where each member typically
                        shares a common goal, which is the best interest of the
                        platform.
                    </p>
                    <p>
                        Every $EASY token holder is a member of the DAO and is
                        allowed one vote per token held.
                    </p>
                    <p>
                        The DAO will be responsible for setting pricing for the
                        platform and determining any monthly membership fees or
                        per use fees for successful escrow transactions.
                    </p>
                    <h3>The distribution and tokenomics:</h3>
                    <p>
                        The supply is set at 10B $EASY tokens and is capped. No
                        more will come into circulation. There is no inflation.
                    </p>
                    <p>
                        65% of the supply will go to exchanges for liquidity,
                        staking, and farming.
                    </p>
                    <p>
                        25% of the supply will go to a Treasury Wallet, which
                        will cover the initial air drop, marketing, giveaways,
                        platform improvements, &amp; future developments.
                    </p>
                    <p>
                        10% of the supply will go to a Founders Vesting Wallet,
                        distributed over a straight line 1 year vesting to the
                        project founders.
                    </p>
                    <p>
                        All profit is distributed to token stakers and is based
                        on percentage of $EASY tokens staked. All income from
                        the platform will go into a smart contract, it will be
                        used to purchase $EASY tokens, and those tokens will be
                        added to the staking contract to be distributed to
                        stakers. The Treasury wallet and Founder Vesting wallet
                        will not be allowed to stake. The founders will be able
                        to stake what they have been distributed from the
                        Founders Vesting Wallet. The Treasury Wallet will never
                        be allowed to stake. This puts all profits into the
                        community’s wallets and creates buying pressure by
                        converting income into $EASY tokens.
                    </p>
                </div>
            </div>
        </main>
    );
};

export default Token;
