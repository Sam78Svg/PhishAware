import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, readJson, setAuthToken } from "../../api.js";
import {
    BsShieldCheck,
    BsGraphUpArrow,
    BsLightningCharge,
    BsShieldLockFill,
    BsPerson,
    BsLock,
    BsEnvelopeAt,
} from "react-icons/bs";
import '../Styling/login.css';

function LoginPage() {
    const [view, setView] = useState("login");
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [forgetEmail, setForgetEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Authentication is stored in an HttpOnly JWT cookie by the backend.
    // Never store the JWT or password in localStorage.

    // Handle login form submit
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    username: loginUsername,
                    password: loginPassword
                })
            });

            const data = await readJson(res);
            if (res.ok && data.success) {
                setAuthToken(data.token);
                setLoginPassword("");

                if (data.type === "admin") {
                    navigate("/admin", { replace: true });
                } else if (data.type === "employee") {
                    navigate("/employee", { replace: true });
                } else {
                    setError("Unknown user type");
                }
            } else {
                setError(data.message || "Login failed.");
            }
        } catch (err) {
            console.error(err);
            setError("Server error. Please try again.");
        }
    };

    // Handle forgot password form submit
    const handleForget = (e) => {
        e.preventDefault();
        alert("Password reset link sent (demo only)");
        setView("login");
    };

    return (
        <>
            <main className="login-page d-flex align-items-center">
                <div className="container">

                    <div className="row justify-content-center align-items-center min-vh-100">

                        {/* LEFT SIDE */}
                        <div className="col-lg-5 d-none d-lg-block text-white pe-5 hero-animate">
                            <div className="login-left-content">
                                <span className="badge bg-primary px-3 py-2 rounded-pill mb-3">
                                    PhishAware Security
                                </span>

                                <h1 className="display-4 fw-bold mb-4">
                                    Secure Your Organization Against
                                    <span className="text-info"> Phishing Attacks</span>
                                </h1>

                                <p className="lead text-light opacity-75">
                                    Train employees with realistic phishing simulations,
                                    awareness campaigns, and instant feedback systems.
                                </p>

                                <div className="mt-4">
                                    <div className="d-flex align-items-center mb-3">
                                        <BsShieldCheck className="fs-4 text-info me-3" aria-hidden />
                                        <span>Advanced Awareness Training</span>
                                    </div>

                                    <div className="d-flex align-items-center mb-3">
                                        <BsGraphUpArrow className="fs-4 text-success me-3" aria-hidden />
                                        <span>Detailed Analytics Dashboard</span>
                                    </div>

                                    <div className="d-flex align-items-center">
                                        <BsLightningCharge className="fs-4 text-warning me-3" aria-hidden />
                                        <span>Instant Learning Feedback</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE LOGIN CARD */}
                        <div className="col-lg-5 col-md-8 col-sm-11">

                            <div className="card border-0 shadow-lg login-modern-card login-card-enter">

                                {view === "login" && (
                                    <div className="card-body p-5">

                                        <div className="text-center mb-4">
                                            <div className="login-icon mx-auto mb-3">
                                                <BsShieldLockFill size={32} aria-hidden />
                                            </div>

                                            <h2 className="fw-bold">
                                                Welcome Back
                                            </h2>

                                            <p className="text-muted">
                                                Login to continue to PhishAware
                                            </p>
                                        </div>

                                        <form onSubmit={handleLogin}>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold">
                                                    Username / Email
                                                </label>

                                                <div className="input-group">
                                                    <span className="input-group-text bg-white">
                                                        <BsPerson aria-hidden />
                                                    </span>

                                                    <input
                                                        type="text"
                                                        className="form-control form-control-lg"
                                                        value={loginUsername}
                                                        onChange={e => setLoginUsername(e.target.value)}
                                                        placeholder="Enter username"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    Password
                                                </label>

                                                <div className="input-group">
                                                    <span className="input-group-text bg-white">
                                                        <BsLock aria-hidden />
                                                    </span>

                                                    <input
                                                        type="password"
                                                        className="form-control form-control-lg"
                                                        value={loginPassword}
                                                        onChange={e => setLoginPassword(e.target.value)}
                                                        placeholder="Enter password"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="alert alert-danger py-2">
                                                    {error}
                                                </div>
                                            )}

                                            <div className="d-flex justify-content-end mb-4">
                                                <a
                                                    href="#"
                                                    className="small text-decoration-none"
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        setView("forget");
                                                    }}
                                                >
                                                    Forgot Password?
                                                </a>
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg w-100 rounded-pill"
                                            >
                                                Login
                                            </button>


                                        </form>
                                    </div>
                                )}

                                {view === "forget" && (
                                    <div className="card-body p-5">

                                        <div className="text-center mb-4">
                                            <div className="login-icon mx-auto mb-3">
                                                <BsEnvelopeAt size={32} aria-hidden />
                                            </div>

                                            <h2 className="fw-bold">
                                                Forgot Password
                                            </h2>

                                            <p className="text-muted">
                                                Enter your email to reset password
                                            </p>
                                        </div>

                                        <form onSubmit={handleForget}>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold">
                                                    Email Address
                                                </label>

                                                <input
                                                    type="email"
                                                    className="form-control form-control-lg"
                                                    value={forgetEmail}
                                                    onChange={e => setForgetEmail(e.target.value)}
                                                    placeholder="Enter your email"
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg w-100 rounded-pill"
                                            >
                                                Send Reset Link
                                            </button>

                                            <div className="text-center mt-4">
                                                <a
                                                    href="#"
                                                    className="text-decoration-none"
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        setView("login");
                                                    }}
                                                >
                                                    Back to Login
                                                </a>
                                            </div>
                                        </form>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
export default LoginPage;