import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Button from "./ui/Button";

import IDX from "../../images/broker.png";
import listingCentral from "../../images/brokers.png";
import RealEstateSearch from "../../images/estate.png";
import NFTaddict from "../../images/face.png";
import CrowdFi from "../../images/group.png";
import PawnLine from "../../images/box.png";
import Proton from "../../images/star.png";


const ProjectsCarousel = () => {
	return (
        <section className="cta">
            <div className="container">
                <h2>Our other projects</h2>

                <Carousel
                    showArrows={false}
                    showStatus={false}
                    autoPlay={true}
                    interval={6000}
                >
                    <div>
                        <img src={IDX} />
                        <p>
                            Broker IDX Sites is by far our largest and most well
                            know project to date. We offer a complete all-in-one
                            real estate brokerage management platform that
                            includes integrated IDX websites for all agents. For
                            more information on Broker IDX Sites.
                        </p>
                        <a
                            href="http://brokeridxsites.com/"
                            className="btn btn-dark"
                        >
                            Visit Us
                        </a>
                    </div>

                    <div>
                        <img src={listingCentral} />
                        <p>
                            Listing Central is a nationwide real estate portal
                            that real estate boards can opt into which allows
                            member agents to get more business. We do not charge
                            for leads and all business goes to the real estate
                            agent. ListingCentral.io is a free service provided
                            to the local real estate associations.
                        </p>
                        <a
                            href="http://listingcentral.io/"
                            className="btn btn-dark"
                        >
                            Visit Us
                        </a>
                    </div>

                    <div>
                        <img src={RealEstateSearch} />
                        <p>
                            Real Estate Search is our first blockchain based
                            project. It is a tokenized and decentralized
                            national real estate portal. Agent owned data =
                            Agent controlled search experience. Every aspect of
                            the site is controlled by member agent’s votes to
                            keep the portal decentralized. Member agents
                            participate in the profit of the site and are paid
                            dividends based on the number of tokens held.
                        </p>
                        <a
                            href="http://realestatesearch.io/"
                            className="btn btn-dark"
                        >
                            Visit Us
                        </a>
                    </div>

                    <div>
                        <img src={NFTaddict} />
                        <p>
                            NFTaddict.io is a physically appealing, easy to use,
                            blockchain based NFT site where users can create and
                            purchase NFT’s without paying gas fees. This opens
                            the market to a broader audience and appeals to
                            everyday users. NFT’s are addicting and now everyone
                            can participate not only in the fun, but also in the
                            business side of the market.
                        </p>
                        <Button className="btn-dark">Coming Soon</Button>
                    </div>

                    <div>
                        <img src={CrowdFi} />
                        <p>
                            CrowdFi is a blockchain based crowd financing site.
                            A typical use for the CrowdFi token would be to
                            bring together a group of investors to participate
                            in a real estate development project. The CrowdFi
                            token is used for financing, being paid dividends,
                            and voting. The CrowdFi platform is currently in
                            development.
                        </p>
                        <Button className="btn-dark">Coming Soon</Button>
                    </div>

                    <div>
                        <img src={PawnLine} />
                        <p>
                            Pawnline.io stands for pawn online and is a
                            blockchain based NFT (non-fungible token) platform
                            used to assist asset owners with raising money for
                            items that can be valued and secured via an NFT. The
                            CrowdFi token can also be used to crowd fund for a
                            Pawnline item. A typical use would be for an item of
                            higher value, such as a diamond necklace or sports
                            collectible where the owner would take a loan out
                            for 65% of the value and the payment would be
                            tracked by smart contract and NFT (non-fungible
                            token). If the owner defaults the items would be
                            transferred to the investors / holders of the NFT.
                        </p>
                        <a href="https://pawnline.io/" className="btn btn-dark">
                            Visit Us
                        </a>
                    </div>
                    <div>
                        <img src={Proton} />
                        <p>
                            We choose to build on the Proton blockchain for its
                            diverse product offering, including a suite of Defi
                            products, NFT Market, and unique value proposition
                            for its users (no fees for end users). We support
                            their technology, speed, leadership, and vision for
                            mass adoption, and we encourage others interested in
                            blockchain technology to learn more.
                        </p>
                        <a
                            href="https://www.protonchain.com/"
                            className="btn btn-dark"
                        >
                            Visit Us
                        </a>
                    </div>
                </Carousel>
            </div>
        </section>
    );
}

export default ProjectsCarousel;
