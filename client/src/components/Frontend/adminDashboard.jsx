import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import '../Styling/adminDashboard.css';
import { Editor, EditorProvider } from "react-simple-wysiwyg";
import { apiFetch, getCurrentUser, logout } from "../../api.js";

function AdminDashboard() {

    // CAMPAIGN CREATION STATES
    const [campaignName, setCampaignName] = useState("");
    const [emailTemplate, setEmailTemplate] = useState("");
    const [targetGroup, setTargetGroup] = useState("All Employees");
    const [successLink, setSuccessLink] = useState("");
    const [links, setLinks] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [reports, setReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);
    const [reportsError, setReportsError] = useState("");
    const [expandedReportId, setExpandedReportId] = useState(null);
    const [activeTab, setActiveTab] = useState("create");

    // SEND CAMPAIGN STATES
    const [sendMode, setSendMode] = useState("Email");
    const [selectedGroup, setSelectedGroup] = useState("");
    const [recipientList, setRecipientList] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);

    const [employeeData, setEmployeeData] = useState({
        employee_id: "",
        name: "",
        department: "",
        designation: "",
        email: "",
        joining_date: "",
        password: ""
    });
    const limit = 20;

    // TEMPLATE STATES
    const [templates, setTemplates] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [templateContent, setTemplateContent] = useState("");
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Target group options
    const [targetGroups, setTargetGroups] = useState([]);

    const [user, setUser] = useState(null);

    useEffect(() => {
        apiFetch(`/api/target-groups`)
            .then(res => res.json())
            .then(data => {
                setTargetGroups(data);
                if (data.length > 0) {
                    setSelectedGroup(data[0]); // ✅ auto select valid group
                }
            });
    }, []);

    // Restore the authenticated user from the HttpOnly JWT cookie.
    useEffect(() => {
        let mounted = true;

        getCurrentUser().then(session => {
            if (!mounted) return;
            if (!session || session.type !== "admin") {
                window.location.replace("/login");
                return;
            }
            setUser(session.user);
        });

        return () => { mounted = false; };
    }, []);

    //Send campaign Use Effect to fetch recipients based on selected group and page
    useEffect(() => {
        if (!selectedGroup || !user?.company_name) return;

        apiFetch(
            `/api/recipients?group=${encodeURIComponent(selectedGroup)}&company=${encodeURIComponent(user.company_name)}&page=${page}&limit=${limit}`
        )
            .then(res => res.json())
            .then(data => {
                setRecipientList(data.data || []);
                setTotal(data.total || 0);
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                setRecipientList([]);
                setTotal(0);
            });

    }, [selectedGroup, page, user]);

    // ================= FETCH TEMPLATES =================
    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        const res = await apiFetch(`/api/templates`);
        const data = await res.json();
        setTemplates(data);
    };

    // ================= SAVE TEMPLATE =================
    const handleSaveTemplate = async () => {
        if (!templateName || !templateContent)
            return alert("Fill all fields");

        if (editingTemplate) {
            await apiFetch(`/api/templates/${editingTemplate.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: templateName,
                    content: templateContent
                })
            });
        } else {
            await apiFetch(`/api/templates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: templateName,
                    content: templateContent
                })
            });
        }

        setShowModal(false);
        setTemplateName("");
        setTemplateContent("");
        setEditingTemplate(null);
        fetchTemplates();
    };

    // ================= DELETE TEMPLATE =================
    const handleDeleteTemplate = async (id) => {
        await apiFetch(`/api/templates/${id}`, {
            method: "DELETE"
        });
        fetchTemplates();
    };

    // ================= CREATE CAMPAIGN =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create unique link FIRST
        const clientUrl = (import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/+$/, "");
        const generatedLink = `${clientUrl}/feedback/${Date.now()}`;

        try {
            // Save campaign
            const response = await apiFetch(`/api/save_campaign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaign_name: campaignName,
                    email_template: emailTemplate,
                    target_group: targetGroup,
                    company_name: user?.company_name || "",
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return alert(data.message || "Failed to save campaign");
            }

            //Save link ONLY if campaign saved
            const savedLinkRes = await apiFetch(`/api/saveLink`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    link_desc: generatedLink,
                    template_type: emailTemplate,
                    link_status: "active",
                    target_group: targetGroup
                })
            });

            if (!savedLinkRes.ok) {
                console.error("Link saving failed");
            }

            // Update Template UI
            setSuccessLink(generatedLink);
            setShowSuccess(true);
            setCampaignName("");

            console.log("Campaign + Link saved successfully ✅");

        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    };

    // ================= SEND CAMPAIGN =================
    const handleSendCampaign = async () => {
        const emails = recipientList.map(r => r.email);

        if (!emails || emails.length === 0) {
            return alert("No recipients");
        }

        const res = await apiFetch(`/api/send_campaign`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mode: sendMode.toLowerCase(),
                recipients: emails,
                link: successLink
            })
        });

        const data = await res.json();

        if (!res.ok) return alert(data.message);

        alert("Campaign sent successfully 🚀");
    };
    const handleLogout = async () => {
        try { await logout(); } catch (err) { console.error("Logout error:", err); }
        window.location.replace("/login");
    };

    // ================= REPORTS =================
    useEffect(() => {
        if (activeTab === "reports" && user?.company_name) {
            fetchReports();
        }
    }, [activeTab, user]);

    const fetchReports = async () => {
        setReportsLoading(true);
        setReportsError("");

        try {
            const res = await apiFetch(`/api/reports`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to fetch reports");
            }

            setReports(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error("Fetch reports error:", err);
            setReports([]);
            setReportsError(err.message || "Failed to fetch reports");
        } finally {
            setReportsLoading(false);
        }
    };
    const handleDeleteAllReports = async () => {
        if (!window.confirm("Are you sure you want to delete all reports? This action cannot be undone.")) {
            return;
        }
        try {
            const res = await apiFetch(`/api/clear_reports`, {
                method: "DELETE"
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Delete failed");
            }
            await fetchReports();
            alert("All reports deleted");
        } catch (err) {
            console.error("Delete reports error:", err);
            alert("Failed to delete reports");
        }
    }
    const showReports = (reportId) => {
        setExpandedReportId(currentId => currentId === reportId ? null : reportId);
    };

    const handleDownloadReport = async (report) => {
        try {
            const response = await apiFetch(`/api/reports/${report.id}/pdf`);
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to download report");
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `${report.name || "campaign-report"}.pdf`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download report error:", err);
            alert(err.message || "Failed to download report");
        }
    };
    // ================= Fetch Links =================
    const fetchLinks = async () => {
        const res = await apiFetch(`/api/links`);
        const data = await res.json();
        setLinks(data);
    };

    useEffect(() => {
        if (activeTab === "send") fetchLinks()
    }, [activeTab]);

    // ================= Copy =================
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(successLink);
            alert("Link copied to clipboard ✅");
        } catch (err) {
            console.error("Copy failed", err);
        }
    };
    const handleAddEmployee = async () => {

        try {

            const res = await apiFetch(`/api/auth/signup`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    type: "employee",

                    name: employeeData.name,
                    department: employeeData.department,
                    designation: employeeData.designation,
                    email: employeeData.email,
                    joining_date: employeeData.joining_date,
                    password: employeeData.password,

                    company_name: user.company_name
                })
            });

            const data = await res.json();

            if (!data.success) {
                return alert(data.message);
            }

            alert("Employee added successfully ✅");

            setShowEmployeeModal(false);

            setEmployeeData({
                name: "",
                department: "",
                designation: "",
                email: "",
                joining_date: "",
                password: ""
            });

            apiFetch(
                `/api/recipients?group=${encodeURIComponent(employeeData.department)}&company=${encodeURIComponent(user?.company_name || "")}&page=${page}&limit=${limit}`
            )
                .then(res => res.json())
                .then(data => {

                    setRecipientList(data.data || []);
                    setTotal(data.total || 0);
                });

        } catch (err) {

            console.error(err);
            alert("Failed to add employee");
        }
    };


    return (
        <div className="admin-dashboard d-flex" style={{ minHeight: "100vh" }}>

            {/* SIDEBAR */}
            <div style={{ width: "240px", background: "#1e293b", color: "white" }} className="p-3">
                <h4>{user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1) || ""}, {user?.username || "Loading..."}</h4>

                <h4>
                    <i>Of <span style={{ color: 'red' }}>{user?.company_name || ""}</span></i>
                </h4>

                <button className="btn btn-dark w-100 mb-2" onClick={() => setActiveTab("create")}>Create</button>

                <button className="btn btn-dark w-100 mb-2" onClick={() => setActiveTab("send")}>Send</button>
                <button className="btn btn-dark w-100 mb-2" onClick={() => setActiveTab("reports")}>Reports</button>

                <Link to="/gemini" className="btn btn-outline-light w-100 mt-4">Chat wit AI</Link>
                <button type="button" onClick={handleLogout} className="btn btn-outline-light w-100 mt-4">Logout</button>
            </div>

            {/* MAIN */}
            <div className="flex-grow-1 p-4 dashboard-panel-enter">

                {/* CREATE */}
                {activeTab === "create" && (
                    <div key="create" className="card p-4 tab-content-enter">
                        <h4>Create Campaign</h4>

                        <form onSubmit={handleSubmit}>
                            <input className="form-control mb-3"
                                placeholder="Campaign Name"
                                value={campaignName}
                                onChange={e => setCampaignName(e.target.value)}
                            />

                            <select className="form-control mb-3"
                                value={emailTemplate}
                                onChange={(e) => {
                                    if (e.target.value === "new") {
                                        setShowModal(true);
                                    } else {
                                        setEmailTemplate(e.target.value);
                                    }
                                }}
                            >
                                <option value="" onChange={
                                    e => setCampaignName(e.target.options[e.target.selectedIndex].getAttribute("name"))
                                }>
                                    Select Template
                                </option>

                                {templates.map(t => (
                                    <option key={t.id} name={t.name} value={t.value}>
                                        {t.name}
                                    </option>
                                ))}

                                <option value="new">+ Create Email Template</option>
                            </select>

                            <select
                                value={targetGroup}
                                onChange={e => setTargetGroup(e.target.value)}
                                className="form-control mb-3"
                            >
                                <option value="">Select Group</option>
                                {targetGroups.map((g, i) => (
                                    <option key={i} value={g}>{g}</option>
                                ))}
                            </select>

                            <button className="btn btn-success">Launch</button>
                        </form>

                        {showSuccess && (
                            <div className="alert alert-success mt-3">
                                <p>Campaign Created ✅</p>

                                <div className="d-flex align-items-center">
                                    <input
                                        type="text"
                                        className="form-control me-2"
                                        value={successLink}
                                        readOnly
                                    />

                                    <button
                                        className="btn btn-primary"
                                        onClick={handleCopy}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* MODAL */}
                        {showModal && (
                            <div id="modal-body">
                                <div id="modal-content">
                                    <h4>Create Template</h4>

                                    <input className="form-control mb-2"
                                        placeholder="Template Name"
                                        value={templateName}
                                        onChange={e => setTemplateName(e.target.value)}
                                    />

                                    <div id="editorSection">
                                        <EditorProvider>
                                            <Editor
                                                value={templateContent}
                                                onChange={(e) => setTemplateContent(e.target.value)}
                                            />
                                        </EditorProvider>
                                    </div>

                                    <div className="mt-3 text-end">
                                        <button className="btn btn-secondary me-2"
                                            onClick={() => setShowModal(false)}>
                                            Cancel
                                        </button>

                                        <button className="btn btn-primary"
                                            onClick={handleSaveTemplate}>
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TEMPLATE LIST */}
                        <div className="mt-4">
                            <h5>Manage Templates</h5>

                            {templates.map(t => (
                                <div key={t.id} className="d-flex justify-content-between mb-2">
                                    <span>{t.name}</span>

                                    <div>
                                        <button className="btn btn-sm btn-warning me-2"
                                            onClick={() => {
                                                setEditingTemplate(t);
                                                setTemplateName(t.name);
                                                setTemplateContent(t.content);
                                                setShowModal(true);
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteTemplate(t.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SEND */}
                {/* SEND */}
                {activeTab === "send" && (
                    <div key="send" className="card p-4 tab-content-enter">

                        <h4 className="h2 mb-4">Send Campaign</h4>

                        <div className="mb-3">
                            <label className="h5 mb-1">Delivery mode</label>
                            <select
                                className="form-select"
                                value={sendMode}
                                onChange={(e) => setSendMode(e.target.value)}
                            >
                                <option value="Email">Email</option>
                                <option value="sms">SMS</option>
                            </select>
                        </div>

                        {/* TARGET GROUP SELECT */}
                        <div className="mb-3">
                            <label className="h5 mb-1">Select Target Group</label>

                            <input
                                type="text"
                                className="form-control"
                                value={targetGroup}
                                readOnly
                            />
                        </div>

                        {/* LINK */}
                        <div className="mb-3">

                            <label className="h5 mb-1">
                                Campaign Link
                            </label>

                            <select
                                name="campaignLinks"
                                id="campaignLinks"
                                className="form-control"

                                onChange={(e) => {

                                    if (
                                        e.target.options[e.target.selectedIndex]
                                            .getAttribute("status") === "active"
                                    ) {

                                        setSuccessLink(e.target.value);

                                        setTargetGroup(
                                            e.target.options[e.target.selectedIndex]
                                                .getAttribute("targetG")
                                        );

                                        setSelectedGroup(
                                            e.target.options[e.target.selectedIndex]
                                                .getAttribute("targetG")
                                        );
                                        setPage(1);

                                        setEmailTemplate(
                                            e.target.options[e.target.selectedIndex]
                                                .getAttribute("templateType")
                                        );

                                    } else {

                                        alert("Selected link is inactive");

                                        setSuccessLink("");
                                        setTargetGroup("");
                                        setEmailTemplate("");
                                    }
                                }}
                            >

                                <option value="default">
                                    {successLink
                                        ? successLink
                                        : "Select a link"}
                                </option>

                                {links.map(link => (

                                    <option
                                        key={link.id}
                                        status={link.link_status}
                                        targetG={link.target_group}
                                        templateType={link.template_type}
                                        value={link.link_desc}
                                    >

                                        {link.link_desc}{" "}
                                        {link.link_status === "active"
                                            ? "✅"
                                            : "❌"}

                                    </option>
                                ))}

                            </select>
                        </div>

                        {/* TEMPLATE TYPE */}
                        <div className="mb-3">

                            <label className="h5 mb-1">
                                Template Type
                            </label>

                            <input
                                className="form-control"
                                value={emailTemplate}
                                placeholder="Email Template"
                                readOnly
                            />
                        </div>

                        {/* RECIPIENTS HEADER */}
                        <div className="d-flex justify-content-between align-items-center mb-3">

                            <h5>Recipients</h5>

                            <button
                                className="btn btn-success"
                                onClick={() => setShowEmployeeModal(true)}
                            >
                                + Add Employee
                            </button>
                        </div>

                        {/* ADD EMPLOYEE MODAL */}
                        {
                            showEmployeeModal && (

                                <div id="modal-body">

                                    <div id="modal-content">

                                        <h4>Add Employee</h4>

                                        <input
                                            className="form-control mb-2"
                                            placeholder="Name"

                                            value={employeeData.name}

                                            onChange={(e) =>
                                                setEmployeeData({
                                                    ...employeeData,
                                                    name: e.target.value
                                                })
                                            }
                                        />

                                        <select
                                            className="form-control mb-2"

                                            value={employeeData.department}

                                            onChange={(e) =>
                                                setEmployeeData({
                                                    ...employeeData,
                                                    department: e.target.value
                                                })
                                            }
                                        >

                                            <option value="">
                                                Select Department
                                            </option>

                                            {targetGroups.map((g, i) => (

                                                <option key={i} value={g}>
                                                    {g}
                                                </option>
                                            ))}

                                        </select>

                                        <input
                                            className="form-control mb-2"
                                            placeholder="Designation"

                                            value={employeeData.designation}

                                            onChange={(e) =>
                                                setEmployeeData({
                                                    ...employeeData,
                                                    designation: e.target.value
                                                })
                                            }
                                        />

                                        <input
                                            type="email"
                                            className="form-control mb-2"
                                            placeholder="Email"

                                            value={employeeData.email}

                                            onChange={(e) =>
                                                setEmployeeData({
                                                    ...employeeData,
                                                    email: e.target.value
                                                })
                                            }
                                        />

                                        <input
                                            type="date"
                                            className="form-control mb-2"

                                            value={employeeData.joining_date}

                                            onChange={(e) =>
                                                setEmployeeData({
                                                    ...employeeData,
                                                    joining_date: e.target.value
                                                })
                                            }
                                        />

                                        <input
                                            type="password"
                                            className="form-control mb-2"
                                            placeholder="Password"

                                            value={employeeData.password}

                                            onChange={(e) =>
                                                setEmployeeData({
                                                    ...employeeData,
                                                    password: e.target.value
                                                })
                                            }
                                        />

                                        <div className="d-flex justify-content-end mt-3">

                                            <button
                                                className="btn btn-secondary me-2"
                                                onClick={() => setShowEmployeeModal(false)}
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                className="btn btn-primary"
                                                onClick={handleAddEmployee}
                                            >
                                                Add Employee
                                            </button>

                                        </div>

                                    </div>

                                </div>
                            )
                        }

                        {/* RECIPIENT LIST */}
                        <div className="mt-3">

                            {recipientList.length === 0 ? (

                                <p className="text-muted">
                                    No users found
                                </p>

                            ) : (

                                <div
                                    className="border rounded p-2"
                                    style={{
                                        maxHeight: "300px",
                                        overflowY: "auto"
                                    }}
                                >

                                    {recipientList.map((r) => (

                                        <div
                                            key={r.employee_id}
                                            className="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom"
                                        >

                                            <div>
                                                <strong>{r.name}</strong>
                                                <br />
                                                <small>{r.email}</small>
                                            </div>

                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => {

                                                    setRecipientList(prev =>
                                                        prev.filter(item => item.employee_id !== r.employee_id)
                                                    );
                                                }}
                                            >
                                                Remove
                                            </button>

                                        </div>
                                    ))}

                                </div>
                            )}
                        </div>

                        {/* PAGINATION */}
                        {recipientList.length > 0 && (

                            <div className="d-flex justify-content-between align-items-center mt-3">

                                <button
                                    className="btn btn-secondary"
                                    disabled={page <= 1}
                                    onClick={() => setPage(prev => prev - 1)}
                                >
                                    ⬅ Prev
                                </button>

                                <span>Page {page}</span>

                                <button
                                    className="btn btn-secondary"
                                    disabled={page >= Math.ceil(total / limit)}
                                    onClick={() => setPage(prev => prev + 1)}
                                >
                                    Next ➡
                                </button>

                            </div>
                        )}

                        {/* SEND BUTTON */}
                        <button
                            className="btn btn-primary mt-4 w-100"
                            onClick={handleSendCampaign}
                        >
                            Send Campaign
                        </button>

                    </div>
                )}

                {/* REPORTS */}
                {activeTab === "reports" && (
                    <div key="reports" className="card p-4 tab-content-enter">
                        <div id="headSection" className="d-flex justify-content-between align-items-center">
                            <h4 className="col-3 h2">Reports</h4>
                            <button className="col-2 btn btn-danger" onClick={handleDeleteAllReports}>
                                Delete All
                            </button>
                        </div>
                        <table className="table mt-3">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Template</th>
                                    <th>Group</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {reportsLoading && (
                                    <tr>
                                        <td colSpan={5}>Loading reports...</td>
                                    </tr>
                                )}
                                {!reportsLoading && reportsError && (
                                    <tr>
                                        <td colSpan={5} className="text-danger">{reportsError}</td>
                                    </tr>
                                )}
                                {!reportsLoading && !reportsError && reports.length === 0 && (
                                    <tr>
                                        <td colSpan={5}>No reports found for {user?.company_name}.</td>
                                    </tr>
                                )}
                                {Array.isArray(reports) &&
                                    !reportsLoading &&
                                    !reportsError &&
                                    reports.map((r) => (
                                        <React.Fragment key={r.id}>
                                            <tr style={{ borderBottomColor: "none" }}>
                                                <td>{r.name}</td>
                                                <td>{r.template_type}</td>
                                                <td>{r.target_group}</td>
                                                <td>{r.created_at}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => showReports(r.id)}>
                                                        View
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-success" onClick={() => handleDownloadReport(r)}>
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedReportId === r.id && (
                                            <tr className="showReports" style={{ borderBottom: "2px solid #333" }}>
                                                <td colSpan={5}>
                                                    <div className="d-flex flex-wrap gap-3 py-2">
                                                        <span><span className="text-primary">Emails sent:</span> {r.email_sent ?? 0}</span>
                                                        <span><span className="text-danger">Clicked:</span> {r.clicked ?? 0}</span>
                                                        <span><span className="text-success">Submitted credentials:</span> {r.reported ?? 0}</span>
                                                        <span><span className="text-info">Vulnerability rate:</span>{" "}
                                                            {r.email_sent > 0
                                                                ? `${((Number(r.clicked) / Number(r.email_sent)) * 100).toFixed(2)}%`
                                                                : "N/A"}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    );
}

export default AdminDashboard;