import '../Styling/homePage.css';
import { BsEnvelopeExclamation, BsLightningCharge, BsGraphUpArrow, BsShieldLock, BsBarChartLine, BsPeople } from "react-icons/bs";
import Reveal from "./Reveal";

function FeaturePage() {
    return (
        <main className="mainArea">
            <div className="container py-5">
                <Reveal className="row mb-5">
                    <div className="col-lg-12 text-center">
                        <h2 className="fw-bold mb-3">Platform Features</h2>
                        <p className="lead">
                            PhishAware offers a comprehensive suite of features designed to strengthen your organization’s defense against phishing and social engineering attacks.
                        </p>
                    </div>
                </Reveal>
                <div className="row g-4 mb-5 stagger-grid">
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-sm p-4 text-center animate-card">
                            <div className="feature-icon mb-3" style={{ fontSize: "2.5rem", color: "#0d6efd" }}>
                                <BsEnvelopeExclamation />
                            </div>
                            <h4 className="card-title">Realistic Phishing Simulations</h4>
                            <p className="card-text">
                                Create and send customized phishing emails that closely mimic real-world threats. Test employee awareness in a safe, controlled environment and identify vulnerabilities before attackers do.
                            </p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-sm p-4 text-center animate-card">
                            <div className="feature-icon mb-3" style={{ fontSize: "2.5rem", color: "#ffc107" }}>
                                <BsLightningCharge />
                            </div>
                            <h4 className="card-title">Instant Feedback & Training</h4>
                            <p className="card-text">
                                Employees receive immediate, actionable feedback if they interact with a simulated phishing email. Educational tips and best practices help turn mistakes into learning opportunities.
                            </p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-sm p-4 text-center animate-card">
                            <div className="feature-icon mb-3" style={{ fontSize: "2.5rem", color: "#198754" }}>
                                <BsGraphUpArrow />
                            </div>
                            <h4 className="card-title">Actionable Awareness Reports</h4>
                            <p className="card-text">
                                Track campaign performance with detailed reports. Monitor who opened, clicked, or reported phishing attempts, and measure vulnerability rates across departments.
                            </p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-sm p-4 text-center animate-card">
                            <div className="feature-icon mb-3" style={{ fontSize: "2.5rem", color: "#dc3545" }}>
                                <BsShieldLock />
                            </div>
                            <h4 className="card-title">Secure & User-Friendly</h4>
                            <p className="card-text">
                                The platform is built with security and ease-of-use in mind. Both admins and employees enjoy a smooth, intuitive experience with clear navigation and robust data protection.
                            </p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-sm p-4 text-center animate-card">
                            <div className="feature-icon mb-3" style={{ fontSize: "2.5rem", color: "#6610f2" }}>
                                <BsBarChartLine />
                            </div>
                            <h4 className="card-title">Customizable Campaigns</h4>
                            <p className="card-text">
                                Tailor phishing simulations to target specific departments, roles, or user groups. Choose from a variety of templates or create your own for maximum relevance.
                            </p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-sm p-4 text-center animate-card">
                            <div className="feature-icon mb-3" style={{ fontSize: "2.5rem", color: "#fd7e14" }}>
                                <BsPeople />
                            </div>
                            <h4 className="card-title">Team Collaboration</h4>
                            <p className="card-text">
                                Enable HR, IT, and management to collaborate on awareness campaigns. Share insights, assign roles, and coordinate efforts to build a security-first culture.
                            </p>
                        </div>
                    </div>
                </div>
                <Reveal className="row mb-4" delay={100}>
                    <div className="col-lg-12 text-center">
                        <h5 className="fw-bold mb-2">Ready to strengthen your organization’s defenses?</h5>
                        <p>
                            <strong>PhishAware</strong> makes cybersecurity training engaging, measurable, and effective for everyone.
                        </p>
                    </div>
                </Reveal>
            </div>
        </main>
    );
}

export default FeaturePage;
