import { useEffect, useState } from "react";
import "../Styling/employeeDashboard.css";
import { Link } from "react-router-dom";
import { apiFetch, getCurrentUser, logout } from "../../api.js";
import {
    BsEnvelopeFill,
    BsShieldCheck,
    BsGraphUpArrow,
    BsEnvelopePaper,
    BsEnvelopeOpen,
} from "react-icons/bs";

function EmployeeDashboard() {

    const [selectedMail, setSelectedMail] = useState(null);
    const [mails, setMails] = useState([]);
    const [user, setUser] = useState(null);
    const [clickedMail, setClickedMail] = useState(0);

    useEffect(() => {
        let mounted = true;

        getCurrentUser().then(session => {
            if (!mounted) return;
            if (!session || session.type !== "employee") {
                window.location.replace("/login");
                return;
            }
            setUser(session.user);
        });

        return () => { mounted = false; };
    }, []);

    const fetchCount = async () => {
        try {
            const res = await apiFetch(`${"/api/capturedUser"}`, {
                method: "POST",
                body: JSON.stringify({})
            });
            const data = await res.json();
            if (res.ok) setClickedMail(data.userCount || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUserEmails = async () => {
        try {
            const res = await apiFetch("/api/fetchEmail", {
                method: "POST",
                body: JSON.stringify({})
            });
            const data = await res.json();
            if (res.ok) setMails(data.mails || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!user?.name) return;
        fetchUserEmails();
        fetchCount();
    }, [user]);

    const handleLogout = async () => {
        try { await logout(); } catch (err) { console.error(err); }
        window.location.replace("/login");
    };

    const percentage = mails.length > 0 ? (clickedMail / mails.length) * 100 : 0;
    const progressColor =
        percentage < 35 ? "bg-success" : percentage < 70 ? "bg-warning" : "bg-danger";

    const bgColors = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#fd6e96"];
    const getAvatarColor = (index) => bgColors[index % bgColors.length];

    if (!user) {
        return <div className="text-center mt-5">Loading user...</div>;
    }
    else {
        return (
            <div className="employee-dashboard dashboard-panel-enter">

                {/* NAVBAR */}
                <nav className="navbar navbar-expand-lg dashboard-navbar shadow-sm">
                    <div className="container-fluid px-4">

                        <div>
                            <h4 className="text-white fw-bold mb-0">
                                PhishAware Employee Portal
                            </h4>

                            <small className="text-light opacity-75">
                                Cybersecurity Awareness Dashboard
                            </small>
                        </div>

                        <div className="d-flex align-items-center gap-3">

                            <div className="text-end text-white">
                                <div className="fw-semibold">
                                    {user.name}
                                </div>

                                <small className="opacity-75">
                                    {user.department}
                                </small>
                            </div>

                            <div className="avatar-circle">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="btn btn-outline-light rounded-pill px-3"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="container-fluid py-4 px-lg-4">

                    {/* TOP STATS */}
                    <div className="row g-4 mb-4">

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm stat-card stat-card-animate">
                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>
                                            <p className="text-muted mb-1">
                                                Inbox Messages
                                            </p>

                                            <h2 className="fw-bold">
                                                {mails.length}
                                            </h2>
                                        </div>

                                        <div className="stat-icon bg-primary-subtle text-primary">
                                            <BsEnvelopeFill aria-hidden />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm stat-card stat-card-animate">
                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>
                                            <p className="text-muted mb-1">
                                                Security Status
                                            </p>

                                            <h2 className="fw-bold text-success">
                                                {clickedMail === 0 ? 'Secure' : 'Compromised'}
                                            </h2>
                                        </div>

                                        <div className="stat-icon bg-success-subtle text-success">
                                            <BsShieldCheck aria-hidden />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm stat-card stat-card-animate">
                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center">

                                        <div>
                                            <p className="text-muted mb-1">
                                                Awareness Level
                                            </p>

                                            <h2 className={`${percentage < 35 ? 'fw-bold text-info' : percentage < 70 ? 'fw-bold text-warning' : 'fw-bold text-danger'}`}>
                                                {percentage < 35 ? 'Low Risk' : percentage < 70 ? 'Medium Risk' : 'High Risk'}
                                            </h2>
                                        </div>

                                        <div className="stat-icon bg-info-subtle text-info">
                                            <BsGraphUpArrow aria-hidden />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">

                        {/* LEFT SIDEBAR */}
                        <div className="col-lg-3">

                            {/* PROFILE CARD */}
                            <div className="card border-0 shadow-sm rounded-4 mb-4">
                                <div className="card-body text-center p-4">

                                    <div className="profile-avatar mx-auto mb-3">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>

                                    <h5 className="fw-bold">
                                        {user.name}
                                    </h5>

                                    <p className="text-muted mb-2">
                                        {user.email}
                                    </p>

                                    <span className="badge bg-primary rounded-pill px-3 py-2">
                                        {user.department}
                                    </span>

                                    <hr />

                                    <div className="text-start small">

                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">
                                                Designation
                                            </span>

                                            <strong>
                                                {user.designation || "Employee"}
                                            </strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">
                                                Company
                                            </span>

                                            <strong>
                                                {user.company_name || "Employee"}
                                            </strong>
                                        </div>

                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">
                                                Status
                                            </span>

                                            <span className="text-success fw-semibold">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECURITY CARD */}
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-body">

                                    <h6 className="fw-bold mb-3">
                                        Security Awareness
                                    </h6>

                                    <div className="progress mb-3" style={{ height: "10px" }}>
                                        <div
                                            className={`progress-bar ${progressColor}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>

                                    <div className="d-flex justify-content-between small">
                                        <span>Vulnerability Score</span>
                                        <strong>{percentage.toFixed(2)}%</strong>
                                    </div>

                                    <hr />

                                    <div className={clickedMail > 0 ? "d-flex align-items-center text-danger" : "d-flex align-items-center text-success"}>
                                        <BsShieldCheck className="fs-5 me-2" aria-hidden />

                                        <span>
                                            {clickedMail > 0 ? `${clickedMail} incidents detected` : 'No incidents detected'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MAILBOX */}
                        <div className="col-lg-9">

                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

                                {/* HEADER */}
                                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">

                                    <div>
                                        <h5 className="fw-bold mb-0">
                                            Inbox
                                        </h5>

                                        <small className="text-muted">
                                            {mails.length} Messages
                                        </small>
                                    </div>

                                    <div className="text-muted">
                                        <BsEnvelopePaper aria-hidden />
                                    </div>
                                </div>

                                {/* MAIL CONTENT */}
                                <div className="row g-0">

                                    {/* MAIL LIST */}
                                    <div
                                        className="col-md-4 border-end"
                                        style={{ height: "650px", overflowY: "auto" }}
                                    >

                                        {mails.length === 0 ? (
                                            <div className="p-4 text-center text-muted">
                                                No messages available
                                            </div>
                                        ) : (
                                            mails.map((mail, i) => (

                                                <div
                                                    key={i}
                                                    className={`mail-item p-3 border-bottom ${selectedMail === i
                                                        ? "active-mail"
                                                        : ""
                                                        }`}
                                                    onClick={() => setSelectedMail(i)}
                                                >

                                                    <div className="d-flex">

                                                        <div
                                                            className="mail-avatar"
                                                            style={{
                                                                backgroundColor: getAvatarColor(i)
                                                            }}
                                                        >
                                                            {mail.senderMail
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div className="ms-3 flex-grow-1">

                                                            <div className="fw-semibold text-truncate">
                                                                {mail.subject}
                                                            </div>

                                                            <small className="text-muted d-block">
                                                                {mail.senderMail}
                                                            </small>

                                                            <small className="text-muted">
                                                                {new Date(
                                                                    mail.received_at
                                                                ).toLocaleString()}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* MAIL VIEWER */}
                                    <div
                                        className="col-md-8 bg-light"
                                        style={{ height: "650px", overflowY: "auto" }}
                                    >

                                        {selectedMail === null ? (

                                            <div className="h-100 d-flex flex-column justify-content-center align-items-center text-muted">

                                                <BsEnvelopeOpen className="display-1 mb-3" aria-hidden />

                                                <h5>
                                                    Select an Email
                                                </h5>

                                                <p>
                                                    Choose a message from the inbox
                                                </p>
                                            </div>

                                        ) : (

                                            <div className="p-4">

                                                <div className="mb-4">

                                                    <h3 className="fw-bold">
                                                        {mails[selectedMail].subject}
                                                    </h3>

                                                    <div className="text-muted">

                                                        From:
                                                        <strong className="ms-2">
                                                            {mails[selectedMail].senderMail}
                                                        </strong>
                                                    </div>

                                                    <small className="text-muted">
                                                        {new Date(
                                                            mails[selectedMail].received_at
                                                        ).toLocaleString()}
                                                    </small>
                                                </div>

                                                <hr />

                                                <div
                                                    className="mail-content"
                                                    dangerouslySetInnerHTML={{
                                                        __html:
                                                            mails[selectedMail].message
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default EmployeeDashboard;