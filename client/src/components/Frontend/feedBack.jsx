import React, { useState } from "react";
import { useParams } from "react-router-dom";
import '../Styling/login.css';
import { apiFetch } from "../../api.js";

function FeedBack() {
    const { id, type = "generic" } = useParams();
    const [breached, setBreached] = useState(false);
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const pageType = ["generic", "google", "microsoft"].includes(type) ? type : "generic";
    const page = {
        generic: { brand: "Awareness Portal", icon: "🔐", title: "Sign in to continue", button: "Continue", color: "#0d6efd" },
        google: { brand: "Google", icon: "G", title: "Sign in with Google", button: "Next", color: "#4285f4" },
        microsoft: { brand: "Microsoft", icon: "▦", title: "Sign in", button: "Next", color: "#5e5e5e" },
    }[pageType];


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await apiFetch(`/api/capture/${encodeURIComponent(id)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                setError(result.message || "This simulation link is no longer available.");
                return;
            }
            setBreached(true);
        } catch {
            setError("Unable to reach the awareness service. Please try again.");
        }
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
                            Simulation complete
                        </h1>

                        <p className="lead mb-4">
                            You followed a simulated phishing link. No password was collected. Learn to verify links and sign-in pages before entering information.
                        </p>

                        <div
                            className="p-3 rounded"
                            style={{
                                background: "rgba(255,255,255,0.1)",
                            }}
                        >
                            <strong>Check the sender, destination URL, and unexpected requests before signing in.</strong>
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
                                    background: page.color,
                                    color: "#fff",
                                    fontSize: "30px",
                                }}
                            >
                                {page.icon}
                            </div>

                            <h2 className="fw-bold">
                                {page.brand}
                            </h2>

                            <p className="text-muted">
                                {page.title}
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

                            {error && <div className="alert alert-danger" role="alert">{error}</div>}

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-100"
                                style={{ backgroundColor: page.color, borderColor: page.color }}
                            >
                                {page.button}
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
