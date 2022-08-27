import { Bars } from "react-loader-spinner";

const Button = (props) => {
	const loading = props.loading || false;
	return (
        <button
			className={`btn ${props.className}`}
			onClick={props.onClick}
			type={props.type || "button"}>
            {loading ? (
                <Bars
                    height="20"
                    width="20"
                    color="#FFF"
                    ariaLabel="loading-indicator"
                />
            ) : (
                `${props.label || props.children}`
            )}
        </button>
    );
}

export default Button;
