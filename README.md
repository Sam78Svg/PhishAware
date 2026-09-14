# 🎣 PhishAware

> A comprehensive phishing awareness training platform that helps organizations educate employees about phishing threats through interactive campaigns, analytics, feedback systems, and AI-powered assistance.

## 📋 Project Information

| Property     | Value                                |
| ------------ | ------------------------------------ |
| Project Name | PhishAware                           |
| Version      | 0.0.0                                |
| Type         | Full-Stack Web Application           |
| Purpose      | Phishing Awareness Training Platform |

---

## 🚀 Overview

PhishAware is designed to improve cybersecurity awareness within organizations by providing phishing simulation campaigns, employee training resources, detailed reporting, and AI-powered support.

### Key Benefits

* Create and manage phishing awareness campaigns
* Track employee responses and engagement
* Generate reports and analytics
* Provide AI-powered phishing guidance
* Collect employee feedback
* Improve organizational security awareness

---

## ✨ Features

### 🔐 Authentication System

* Secure login for Admins and Employees
* Role-based access control
* Password encryption using bcryptjs
* JWT-based authentication

### 👨‍💼 Admin Dashboard

* Create phishing campaigns
* Design email templates
* Send campaigns to employees
* View analytics and reports
* Monitor campaign performance

### 👨‍🎓 Employee Dashboard

* View assigned campaigns
* Submit feedback
* Access training materials
* Track awareness progress

### 🤖 AI Chatbot

* Powered by Google Gemini API
* Real-time phishing awareness assistance
* Security-related question answering

### 📊 Reporting & Analytics

* Campaign performance reports
* Employee engagement metrics
* Feedback analysis
* Awareness tracking

---

## 🛠 Technology Stack

### Frontend

* React 19
* Vite
* React Router DOM
* Bootstrap 5
* React Icons
* React Markdown
* React Simple WYSIWYG

### Backend

* Node.js
* Express.js
* MySQL
* Nodemailer
* Twilio
* Google Gemini API
* dotenv
* CORS

### Deployment

* Vercel
* Vercel Analytics
* Vercel Speed Insights

---

## 📁 Project Structure

```text
my-fishapp/
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── API/
│   ├── utils/
│   ├── server.js
│   └── db.js
│
├── database/
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/login`    | User Login        |
| POST   | `/api/auth/register` | User Registration |
| POST   | `/api/auth/logout`   | User Logout       |
| GET    | `/api/auth/verify`   | Verify Token      |

### Campaigns

| Method | Endpoint                | Description      |
| ------ | ----------------------- | ---------------- |
| POST   | `/api/campaigns/create` | Create Campaign  |
| GET    | `/api/campaigns`        | List Campaigns   |
| GET    | `/api/campaigns/:id`    | Campaign Details |
| PUT    | `/api/campaigns/:id`    | Update Campaign  |
| DELETE | `/api/campaigns/:id`    | Delete Campaign  |

### Reports

| Method | Endpoint                | Description     |
| ------ | ----------------------- | --------------- |
| GET    | `/api/reports`          | All Reports     |
| GET    | `/api/reports/:id`      | Report Details  |
| POST   | `/api/reports/generate` | Generate Report |

---

## ⚙️ Installation

### Prerequisites

* Node.js (v14+)
* npm or yarn
* MySQL
* Google Gemini API Key
* Twilio Account
* Email Service Credentials

### Install Dependencies

```bash
npm install
```

### Frontend Setup

```bash
cd client
npm install
```

### Backend Setup

```bash
cd server
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `server` directory:

```env
DATABASE_HOST=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_NAME=

JWT_SECRET=

NODEMAILER_EMAIL=
NODEMAILER_PASSWORD=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

GOOGLE_API_KEY=
```

---

## ▶️ Running the Application

### Run Frontend & Backend

```bash
npm run dev:all
```

### Run Backend Only

```bash
npm run server
```

### Run Frontend Only

```bash
cd client
npm run dev
```

### Local URLs

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3001
```

---

## 🚀 Deployment

The application is configured for deployment on Vercel.

### Deployment Checklist

* [ ] Configure environment variables
* [ ] Test API endpoints
* [ ] Verify database connection
* [ ] Configure email service
* [ ] Configure Twilio
* [ ] Configure Gemini API
* [ ] Enable HTTPS
* [ ] Set up monitoring

---

## 🔒 Security Features

* bcryptjs password hashing
* JWT authentication
* Role-based access control
* CORS protection
* Environment variable management
* Parameterized SQL queries

---

## 🗄 Database Schema

### Users

* id
* username
* email
* password_hash
* role
* created_at
* updated_at

### Campaigns

* id
* name
* description
* template_id
* created_by
* created_at
* sent_at

### Reports

* id
* campaign_id
* generated_by
* data (JSON)
* created_at

### Feedback

* id
* user_id
* campaign_id
* rating
* comment
* created_at

---

## 🔮 Future Enhancements

* Two-Factor Authentication (2FA)
* Advanced Analytics Dashboard
* Machine Learning-Based Detection
* Mobile Application
* Multi-language Support
* HR System Integration
* Automated Remedial Training
* Compliance Reporting
* API Rate Limiting
* Webhook Integrations

---

## 🤝 Contributing

Contributions are welcome. Feel free to fork the repository and submit pull requests.

---

## 📄 License

This project is intended for educational and organizational cybersecurity awareness purposes.

---

## 📞 Support

For issues, suggestions, or feature requests:

* Open an issue on GitHub
* Review the project documentation
* Contact the development team

⭐ If you found this project useful, consider giving it a star.
