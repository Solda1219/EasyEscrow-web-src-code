import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../store/auth-context";
import Button from "./ui/Button";

const LoginForm = (props) => {
    const user = useRef();
    const pass = useRef();
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const ctx = useContext(AuthContext);

    const handleLogin = (event) => {
        event.preventDefault();
        setLoading(true);
        fetch(`${process.env.MIX_API_URL}/login`, {
            method: "POST",
            body: JSON.stringify({
                username: user.current.value,
                password: pass.current.value,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (response.ok) return response.json();
                throw response.status + ": " + response.statusText;
            })
            .then((data) => {
                const user = data.data;
                //console.log(data, data.message, data.valid);
                if (data.valid) {
                    setLoading(false);
                    ctx.loginHandler(user.token, user.user, props.hidePopup);
                    props.hidePopup();
                    //navigate("/transactions");
                } else {
                    setError(data.message);
                    setLoading(false);
                }
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }

	return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <div className="form-row">
                <label htmlFor="login_user">Enter Your Username</label>
                <input type="text" id="login_user" ref={user} />
            </div>
            <div className="form-row">
                <label htmlFor="login_pass">Enter Your Password</label>
                <input type="password" id="login_pass" ref={pass} />
            </div>
            {error && <div className="form-row error">{error}</div>}
            <div className="form-row">
                    <Button
                        type="submit"
                        label="Login"
                        loading={loading}
                    />
            </div>
        </form>
    );
}

export default LoginForm;
