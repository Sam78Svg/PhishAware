import '../Styling/homePage.css';
import logImg from '../Resource/log.jpg';
import Reveal from './Reveal';

function AboutPage() {
    return (
        <main className="mainArea">
            <div className="container py-5">
                <Reveal className="row align-items-center mb-5">
                    <div className="col-lg-7">
                        <h2 className="fw-bold mb-3">About PhishAware</h2>
                        <p className="lead">
                            <strong>PhishAware</strong> is an academic project developed by <strong>Ganesh Kide</strong> and <strong>Sangmeshwar Kendre</strong> at the Institute of Management and Career Courses (IMCC), Pune. Our mission is to empower organizations and individuals to defend against the ever-evolving threat of phishing and social engineering attacks.
                        </p>
                        <p>
                            The platform provides a safe environment for simulating phishing attacks, enabling employees to recognize, report, and learn from real-world scenarios. By bridging the gap between theoretical knowledge and practical defense, PhishAware helps organizations foster a culture of cybersecurity awareness.
                        </p>
                    </div>
                    <div className="col-lg-5 text-center">
                        <img
                            src={logImg}
                            alt="PhishAware cybersecurity awareness platform"
                            className="img-fluid rounded-3 shadow hero-image-float"
                            style={{ maxWidth: "350px" }}
                            width={350}
                            height={263}
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                </Reveal>
                <Reveal className="row mb-5" delay={120}>
                    <div className="col-lg-12">
                        <h3 className="fw-bold mb-3">Key Features</h3>
                        <ul className="list-group list-group-flush mb-4">
                            <li className="list-group-item">
                                <strong>Realistic Phishing Simulations:</strong> Admins can create and send customized phishing emails that mimic real-world threats, testing employee vigilance in a controlled environment.
                            </li>
                            <li className="list-group-item">
                                <strong>Instant Feedback:</strong> Employees receive immediate educational feedback if they fall for a simulation, turning mistakes into learning opportunities.
                            </li>
                            <li className="list-group-item">
                                <strong>Actionable Awareness Reports:</strong> HR and Admins can track responses, monitor vulnerability rates, and identify areas for improvement across the organization.
                            </li>
                            <li className="list-group-item">
                                <strong>Secure & User-Friendly:</strong> The platform is designed with security and ease-of-use in mind, ensuring a smooth experience for both admins and employees.
                            </li>
                        </ul>
                    </div>
                </Reveal>
                <Reveal className="row mb-5" delay={180}>
                    <div className="col-lg-12">
                        <h3 className="fw-bold mb-3">Our Vision</h3>
                        <p>
                            As cyber threats continue to grow in sophistication, human awareness remains the most critical line of defense. PhishAware aims to make cybersecurity training engaging, effective, and accessible for all organizations, regardless of size.
                        </p>
                    </div>
                </Reveal>
                <Reveal className="row mb-4" delay={240}>
                    <div className="col-lg-12">
                        <h3 className="fw-bold mb-3">Contact & Credits</h3>
                        <p>
                            <strong>Developed by:</strong> Ganesh Kide and Sangmeshwar Kendre, IMCC Pune<br />
                            <strong>Contact:</strong> info@phishaware.com<br />
                            <strong>Academic Guide:</strong> Prof. Mansi Bhate Mam, IMCC Pune
                        </p>
                    </div>
                </Reveal>
            </div>
        </main>
    );
}

export default AboutPage;