import { Fragment, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "./components/Footer";
import Header from "./components/Header";
import Newsletter from "./components/Newsletter";
import Modal from "./components/ui/Modal";
import LoginForm from "./components/LoginForm";
import AuthContext from "./store/auth-context";
import PageLoader from "./components/ui/PageLoader";
import ProjectsCarousel from "./components/ProjectsCarousel";

const Layout = ({ children }) => {
    const ctx = useContext(AuthContext);
    const navigate = useNavigate();
    const page = window.location.pathname;
    // const [loginPopup, setLoginPopup] = useState(
    //     ctx.isLoggedIn || page == "/" ? false : true
    // );

    const [loginPopup, setLoginPopup] = useState(
        ctx.loading || page == "/" ? false : true
    );

    const showLogin = () => {
        setLoginPopup(true);
    };
    const hideLogin = () => {
        setLoginPopup(false);
    };

    // useEffect(() => {
    //     if (!ctx.loading) {
    //         if (ctx.isLoggedIn === false && loginPopup === false) {
    //             navigate("/");
    //         }
    //     }
    // }, [loginPopup, ctx.loading, ctx.isLoggedIn]);

    return (
        <Fragment>
            <Header showLogin={showLogin} />
            {/* {ctx.isLoggedIn || page == "/" ? children : <PageLoader />} */}
            {children}
            {/* <Newsletter /> */}
            <ProjectsCarousel />
            <Footer />

            {/* {loginPopup && (
                <Modal hidePopup={hideLogin}>
                    <LoginForm hidePopup={hideLogin} />
                </Modal>
            )} */}
        </Fragment>
    );
};

export default Layout;
