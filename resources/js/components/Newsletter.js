import { useContext, useState } from "react";
import AuthContext from "../store/auth-context";
import Button from "./ui/Button";

const Newsletter = () => {
    const ctx = useContext(AuthContext);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const formSubmitHandler = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);

        if(data.get("email").trim() == "") {
            setError("The email field is required");
            return;
        }

        //console.log(data.get("email").trim());

        fetch(`${process.env.MIX_API_URL}/escrow_subscribe`, {
            method: "POST",
            body: JSON.stringify({
                email: data.get("email").trim(),
            }),
            headers: {
                Authorization: "Bearer " + ctx.token,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (response.ok) return response.json();
                throw response.status + ": " + response.statusText;
            })
            .then((data) => {
                console.log(data);
                if (data.valid) {
                    setSuccess(data.message);
                } else {
                    setError(data.message);
                }
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }

    return (
        <section className="cta">
            <div className="container">
                <h2>SignUp For Newsletter</h2>
                <p>
                    Contrary to popular belief, Lorem Ipsum is not simply random
                    text. It has roots in a piece of classical Latin literature
                    from 45 BC, making it over 2000 years old. Richard
                    McClintock, a Latin professor at Hampden Sydney College in
                    Virginia, looked up one of the more obscure Latin words,
                    consectetur.
                </p>
                <form onSubmit={formSubmitHandler}>
                    <input type="email" name="email" placeholder="Email" />
                    <Button type="submit" label="Submit" className="btn-dark" loading={loading} />
                </form>

                {success && <p className="message success">{success}</p>}
                {error && <p className="message error">{error}</p>}
            </div>
        </section>
    );
};

export default Newsletter;
