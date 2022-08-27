import iconInsta from "../../images/icon-instagram.svg";
import iconFB from "../../images/icon-facebook.svg";
import iconTwitter from "../../images/icon-twitter.svg";
import iconTouTube from "../../images/icon-youtube.svg";
import homebloks from "../../images/homebloks.jpg";

const Footer = () => {
    return (
        <footer>
            <div className="container">
                <div className="copyright">
                    <ul className="social">
                        <li>
                            <a
                                href="https://www.instagram.com/"
                                target="_blank"
                                rel="external noopener noreferrer"
                                title="instagram"
                            >
                                <img src={iconInsta} alt="" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.facebook.com/"
                                target="_blank"
                                rel="external noopener noreferrer"
                                title="facebook"
                            >
                                <img src={iconFB} alt="" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.twitter.com/"
                                target="_blank"
                                rel="external noopener noreferrer"
                                title="twitter"
                            >
                                <img src={iconTwitter} alt="" />
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.youtube.com/"
                                target="_blank"
                                rel="external noopener noreferrer"
                                title="youtube"
                            >
                                <img src={iconTouTube} alt="" />
                            </a>
                        </li>
                    </ul>
                    <p>&copy; 2022 EasyEscrow.io. All rights reserved</p>
                    <div className="footer-logo">
                        <a href="https://homebloks.io/" target="_blank">
                            <img src={homebloks} alt="" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
