import { useEffect } from "react";
import "../Styling/homePage.css";
import logImg from "../Resource/log.jpg";
import { Link } from "react-router-dom";
import Reveal from "./Reveal";

import {
    BsEnvelopeExclamation,
    BsLightningCharge,
    BsGraphUpArrow,
    BsShieldLock,
    BsBarChartLine,
    BsPeople
} from "react-icons/bs";

function HomePage() {
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = logImg;
        document.head.appendChild(link);
        return () => link.remove();
    }, []);

    return (
        <>
            {/* HERO SECTION */}
            <section className="hero-section" aria-label="Introduction">
                <div className="overlay"></div>

                <div className="container hero-content">
                    <div className="row align-items-center min-vh-100 gy-5">
                        <div className="col-lg-6 text-white hero-animate">
                            <span className="badge bg-primary px-3 py-2 mb-3 rounded-pill hero-badge">
                                Cybersecurity Awareness Platform
                            </span>

                            <h1 className="hero-title">
                                Defend Against <span>Phishing Attacks</span>
                            </h1>

                            <p className="hero-subtitle">
                                Empower employees with realistic phishing simulations,
                                instant learning feedback, and awareness analytics to
                                strengthen organizational cybersecurity.
                            </p>

                            <div className="d-flex flex-wrap gap-3 mt-4 hero-actions">
                                <Link
                                    to="/login"
                                    className="btn btn-primary btn-lg px-4 rounded-pill shadow btn-animate"
                                >
                                    Access Dashboard
                                </Link>

                                <a
                                    href="#features"
                                    className="btn btn-outline-light btn-lg px-4 rounded-pill btn-animate"
                                >
                                    Explore Features
                                </a>
                            </div>
                        </div>

                        <div className="col-lg-6 text-center hero-image-enter">
                            <img
                                src={logImg}
                                alt="Cybersecurity awareness training dashboard illustration"
                                className="img-fluid hero-image hero-image-float"
                                width={640}
                                height={480}
                                fetchPriority="high"
                                decoding="async"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES + ABOUT COMBINED */}
            <section id="features" className="py-5 bg-light">
                <div className="container">

                    {/* SECTION TITLE */}
                    <Reveal className="text-center mb-5">
                        <h2 className="fw-bold display-5 section-title-animate">
                            Why Choose PhishAware?
                        </h2>

                        <p className="lead text-muted col-lg-8 mx-auto">
                            PhishAware combines cybersecurity awareness,
                            phishing simulations, reporting systems, and
                            collaborative learning into one unified platform.
                        </p>
                    </Reveal>

                    {/* FEATURE CARDS */}
                    <div className="row g-4 mb-5 stagger-grid">

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 feature-card animate-card">
                                <div className="card-body text-center p-4">
                                    <div className="feature-icon text-primary">
                                        <BsEnvelopeExclamation />
                                    </div>

                                    <h4 className="fw-bold mt-3">
                                        Realistic Simulations
                                    </h4>

                                    <p className="text-muted">
                                        Create phishing campaigns that mimic real-world
                                        cyber attacks and evaluate employee awareness safely.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 feature-card animate-card">
                                <div className="card-body text-center p-4">
                                    <div className="feature-icon text-warning">
                                        <BsLightningCharge />
                                    </div>

                                    <h4 className="fw-bold mt-3">
                                        Instant Learning
                                    </h4>

                                    <p className="text-muted">
                                        Employees receive educational feedback instantly
                                        after interacting with phishing simulations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 feature-card animate-card">
                                <div className="card-body text-center p-4">
                                    <div className="feature-icon text-success">
                                        <BsGraphUpArrow />
                                    </div>

                                    <h4 className="fw-bold mt-3">
                                        Awareness Reports
                                    </h4>

                                    <p className="text-muted">
                                        Monitor clicks, reports, and user behavior
                                        with detailed analytics dashboards.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 feature-card animate-card">
                                <div className="card-body text-center p-4">
                                    <div className="feature-icon text-danger">
                                        <BsShieldLock />
                                    </div>

                                    <h4 className="fw-bold mt-3">
                                        Secure Platform
                                    </h4>

                                    <p className="text-muted">
                                        Built with security and usability in mind
                                        for smooth employee and admin experience.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 feature-card animate-card">
                                <div className="card-body text-center p-4">
                                    <div className="feature-icon text-info">
                                        <BsBarChartLine />
                                    </div>

                                    <h4 className="fw-bold mt-3">
                                        Custom Campaigns
                                    </h4>

                                    <p className="text-muted">
                                        Customize phishing simulations for teams,
                                        departments, and awareness goals.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm h-100 feature-card animate-card">
                                <div className="card-body text-center p-4">
                                    <div className="feature-icon text-dark">
                                        <BsPeople />
                                    </div>

                                    <h4 className="fw-bold mt-3">
                                        Team Collaboration
                                    </h4>

                                    <p className="text-muted">
                                        HR, IT, and management can collaborate
                                        together to improve cyber awareness.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ABOUT SECTION */}
                    <div className="row align-items-center g-5 mt-4">

                        <div className="col-lg-6">
                            <img
                                src={logImg}
                                alt="About PhishAware"
                                className="img-fluid rounded-4 shadow-lg"
                            />
                        </div>

                        <div className="col-lg-6">
                            <h2 className="fw-bold mb-4">
                                About PhishAware
                            </h2>

                            <p className="lead text-muted">
                                Bridging the gap between theory and practical
                                cybersecurity defense.
                            </p>

                            <p>
                                PhishAware is an academic project developed by
                                MCA students at the Institute of Management
                                and Career Courses (IMCC), Pune.
                            </p>

                            <p>
                                The platform provides a secure environment
                                where organizations can simulate phishing attacks
                                and train employees to recognize modern cyber threats.
                            </p>

                            <div className="p-4 bg-white shadow-sm rounded-4 border-start border-4 border-primary mt-4">
                                <h5 className="fw-bold mb-2">
                                    Our Vision
                                </h5>

                                <p className="mb-0 text-muted">
                                    To create cybersecurity awareness through
                                    engaging, measurable, and practical training experiences.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer-section py-4">
                <div className="container text-center">
                    <h5 className="fw-bold text-white">
                        PhishAware
                    </h5>

                    <p className="mb-1 text-light">
                        Strengthening Cybersecurity Awareness Through Practical Training
                    </p>

                    <small className="text-secondary">
                        © 2025 Maharashtra Education Society's IMCC, Pune
                    </small>
                </div>
            </footer>
        </>
    );
}

export default HomePage;