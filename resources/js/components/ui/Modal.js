import { Fragment } from "react";
import { createPortal } from "react-dom";

import closeIcon from "../../../images/close.svg";

const overlayRoot = document.getElementById("overlay-root");
const backdropRoot = document.getElementById("backdrop-root");

const Modal = (props) => {
    return (
        <Fragment>
            {createPortal(
                <Backdrop hidePopup={props.hidePopup} />,
                backdropRoot
            )}
            {createPortal(
                <Overlay hidePopup={props.hidePopup}>{props.children}</Overlay>,
                overlayRoot
            )}
        </Fragment>
    );
};

const Backdrop = (props) => {
    return (<div className="backdrop" onClick={props.hidePopup}></div>);
}

const Overlay = (props) => {
    return (
        <div className="modal">
            <img src={closeIcon} alt="" className="modal-close" onClick={props.hidePopup} />
            {props.children}
        </div>
    );
};

export default Modal;
