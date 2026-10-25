# Product Requirements Document (PRD)

# SANRAKSHAK

**Version:** 1.0
**Project Type:** AI-Powered Website Security Assessment Platform
**Author:** Vrinda
**Status:** Draft

---

# 1. Overview

## Product Name

**SANRAKSHAK**

## Tagline

**Protect. Analyze. Secure.**

## Vision

To make website security accessible to everyone by providing automated vulnerability assessments and AI-generated security reports in simple, understandable language.

---

# 2. Problem Statement

Many website owners, students, freelancers, startups, and small businesses deploy websites without understanding their security posture.

Existing vulnerability assessment tools are often:

* Difficult to use
* Designed for cybersecurity professionals
* Filled with technical terminology
* Hard to interpret

As a result, users often remain unaware of vulnerabilities until their websites are compromised.

SANRAKSHAK aims to bridge this gap by simplifying cybersecurity assessments through automation and AI.

---

# 3. Objectives

* Detect common website vulnerabilities.
* Identify exposed services and open ports.
* Analyze server configurations.
* Generate AI-powered security explanations.
* Provide actionable remediation recommendations.
* Maintain scan history.
* Generate downloadable professional reports.

---

# 4. Target Audience

### Primary Users

* Students
* Web Developers
* Freelancers
* Startups
* Small Businesses
* Website Owners

### Secondary Users

* Cybersecurity Learners
* Security Researchers
* Educational Institutions
* Development Teams

---

# 5. Scope

## In Scope

* Website scanning
* Open port detection
* Server vulnerability assessment
* Web application vulnerability scanning
* AI-generated reports
* Security score generation
* Scan history
* User authentication
* Downloadable reports

---

## Out of Scope (Future Releases)

* Continuous monitoring
* Malware scanning
* Infrastructure scanning
* Cloud security assessment
* Mobile application scanning
* Dark Web monitoring

---

# 6. Functional Requirements

## Authentication

* User Registration
* User Login
* JWT Authentication
* Password Hashing
* Logout

---

## Website Scanner

The user should be able to:

* Enter a website URL.
* Start a scan.
* Monitor scan progress.
* View scan status.

---

## Security Assessment

The platform should:

* Detect open ports.
* Identify running services.
* Detect server misconfigurations.
* Identify outdated software.
* Check missing security headers.
* Detect common web vulnerabilities.
* Assign severity levels.

---

## AI Analysis

The AI should:

* Explain vulnerabilities.
* Summarize findings.
* Suggest remediation steps.
* Generate overall security assessments.

---

## Dashboard

Users should be able to:

* View Security Score.
* View Vulnerabilities.
* View AI Summary.
* Download Reports.
* View Scan History.

---

## Reports

Generate downloadable:

* PDF
* HTML
* Markdown

Reports should include:

* Website Information
* Scan Date
* Security Score
* Vulnerability List
* Severity
* Recommendations

---

# 7. Non-Functional Requirements

## Performance

* Scan request accepted within 2 seconds.
* Dashboard loads under 3 seconds.
* Support concurrent scan requests.

---

## Scalability

The architecture should support:

* Multiple scanners
* Additional AI providers
* New vulnerability modules
* Multiple users

---

## Security

* HTTPS
* JWT Authentication
* Password Hashing
* Input Validation
* URL Validation
* Docker Isolation
* Secure API Communication

---

## Reliability

* Graceful error handling
* Scan retry mechanism
* API timeout handling
* Database recovery support

---

# 8. User Flow

```text
User Login
      │
      ▼
Dashboard
      │
      ▼
Enter Website URL
      │
      ▼
Start Scan
      │
      ▼
Backend Validation
      │
      ▼
Security Scanners
      │
      ▼
Result Parser
      │
      ▼
AI Analysis
      │
      ▼
Database Storage
      │
      ▼
Dashboard Report
      │
      ▼
Download Report
```

---

# 9. Core Features

## Website Scanner

Accepts website URLs and initiates automated security assessments.

---

## Open Port Detection

Identifies publicly accessible ports and running services.

---

## Vulnerability Scanner

Detects:

* Server Misconfigurations
* Outdated Software
* Information Disclosure
* Missing Security Headers
* SQL Injection
* XSS

---

## AI Report Generator

Converts technical scan results into:

* Human-readable explanations
* Severity analysis
* Actionable recommendations

---

## Security Score

Generates an overall website security score based on scan findings.

---

## Scan History

Stores previous scans for future comparison.

---

## Report Generator

Exports professional reports in multiple formats.

---

# 10. Technology Stack

## Frontend

* React.js
* TypeScript
* Tailwind CSS
* Shadcn UI
* React Router
* Axios

---

## Backend

* FastAPI
* Python

---

## Database

* PostgreSQL

---

## AI

* Gemini API / OpenAI API

---

## Security Tools

* Nmap
* Nikto
* OWASP ZAP

---

## Containerization

* Docker

---

# 11. System Architecture

```text
User
   │
   ▼
React Frontend
   │
REST API
   │
   ▼
FastAPI Backend
   │
Scan Manager
   │
Docker Containers
   │
Nmap / Nikto / ZAP
   │
Parser
   │
AI Engine
   │
PostgreSQL
   │
Dashboard
```

---

# 12. Database Entities

## Users

* id
* name
* email
* password
* created_at

---

## Scans

* id
* user_id
* website
* status
* score
* created_at

---

## Vulnerabilities

* id
* scan_id
* title
* severity
* description
* recommendation

---

## Reports

* id
* scan_id
* file_path
* created_at

---

# 13. REST APIs

## Authentication

```
POST /register

POST /login

POST /logout
```

---

## Scanner

```
POST /scan

GET /scan/{id}

GET /history

DELETE /scan/{id}
```

---

## Reports

```
GET /report/{id}

GET /download/{id}
```

---

# 14. Future Enhancements

* Scheduled Scanning
* Continuous Monitoring
* Email Notifications
* SSL Certificate Analysis
* DNS Security Checks
* Malware Detection
* CVE Integration
* Team Collaboration
* Organization Dashboard
* Browser Extension
* API for Developers

---

# 15. Success Metrics

* Successful Scan Completion Rate
* Average Scan Time
* AI Report Accuracy
* User Satisfaction
* Number of Active Users
* Number of Scans Per Day
* Report Download Rate

---

# 16. Risks

* Long scan durations
* False positives
* AI hallucinations
* Unauthorized scanning attempts
* Scanner compatibility issues
* Large concurrent workloads

---

# 17. Assumptions

* Users have permission to scan the target website.
* Internet connectivity is available.
* Security tools are installed and configured.
* AI services are accessible.
* Docker containers are functioning correctly.

---

# 18. Future Vision

SANRAKSHAK aims to evolve from a website vulnerability scanner into a comprehensive AI-powered cybersecurity platform capable of continuous monitoring, intelligent threat analysis, compliance reporting, and enterprise-grade security assessments while remaining accessible to both technical and non-technical users.
