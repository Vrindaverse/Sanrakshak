# ═════════════════════════════════════════════════════════════════════════════

# [ MODULE 01 ]  TECHNICAL SPECIFICATION

# ═════════════════════════════════════════════════════════════════════════════

## Overview

The SANRAKSHAK platform follows a modern **Client-Server Architecture** built using industry-standard technologies. Each technology is selected for a specific responsibility, ensuring the platform remains scalable, secure, maintainable, and high-performing.

---

## TECH STACK OVERVIEW

| Layer             | Technology      | Purpose                                                     |
| ----------------- | --------------- | ----------------------------------------------------------- |
| Frontend          | React.js        | Build a fast and interactive user interface                 |
| Language          | TypeScript      | Type-safe frontend development                              |
| Styling           | Tailwind CSS    | Utility-first responsive styling                            |
| UI Components     | Shadcn UI       | Modern reusable UI components                               |
| Routing           | React Router    | Client-side navigation                                      |
| API Communication | Axios           | Connect frontend with backend APIs                          |
| Backend           | FastAPI         | High-performance REST API server                            |
| Language          | Python          | Backend logic & scanner integration                         |
| Database          | Neon PostgreSQL | Cloud-hosted database for storing users, scans, and reports |
| ORM               | Drizzle ORM     | Type-safe database queries and schema management            |
| AI                | Gemini API      | AI-powered vulnerability explanation and report generation  |
| Security Scanner  | Nmap            | Open port & service detection                               |
| Security Scanner  | Nikto           | Server vulnerability scanning                               |
| Security Scanner  | OWASP ZAP       | Web application security testing                            |
| Containerization  | Docker          | Isolated execution of security scanners                     |
| Authentication    | JWT             | Secure user authentication                                  |
| Version Control   | Git & GitHub    | Source code management                                      |

══════════════════════════════════════════════════════════════════════

# FRONTEND STACK

### React.js

Responsible for building the complete user interface using reusable components.

### TypeScript

Provides static typing, improving maintainability and reducing runtime errors.

### Tailwind CSS

Used for responsive, utility-first styling with minimal custom CSS.

### Shadcn UI

Provides modern, accessible UI components such as dialogs, tables, buttons, and cards.

### React Router

Handles navigation between different pages of the application.

### Axios

Acts as the communication bridge between the React frontend and FastAPI backend through REST APIs.

══════════════════════════════════════════════════════════════════════

# BACKEND STACK

### FastAPI

High-performance Python framework responsible for:

* User Authentication
* Scan Management
* API Endpoints
* AI Integration
* Report Generation
* Database Communication

### Python

Primary programming language used for:

* Scanner Integration
* Backend Logic
* Automation
* AI Processing

══════════════════════════════════════════════════════════════════════

# DATABASE

### Neon PostgreSQL

Neon is a **serverless PostgreSQL database** used to store application data securely in the cloud.

**Stores**

* User Accounts
* Authentication Data
* Website Information
* Scan History
* Vulnerability Reports
* AI Summaries
* Security Scores
* Downloadable Reports

**Why Neon?**

* Serverless Architecture
* Automatic Scaling
* Built-in PostgreSQL Compatibility
* Fast Cloud Deployment
* Reliable Backups
* Developer Friendly

══════════════════════════════════════════════════════════════════════

# ORM

### Drizzle ORM

Drizzle ORM is used to communicate with the PostgreSQL database in a type-safe manner.

Responsibilities:

* Database Schema
* CRUD Operations
* Type-safe Queries
* Migration Management

══════════════════════════════════════════════════════════════════════

# AI ENGINE

### Gemini API

Gemini transforms technical scanner outputs into human-readable reports.

Responsibilities:

* Vulnerability Explanation
* Severity Analysis
* Risk Assessment
* Security Recommendations
* AI Summary Generation

══════════════════════════════════════════════════════════════════════

# SECURITY TOOLS

### Nmap

Responsible for:

* Open Port Detection
* Service Discovery
* Version Detection
* Network Enumeration

---

### Nikto

Responsible for:

* Server Vulnerability Analysis
* Misconfiguration Detection
* Dangerous Files Detection
* Information Disclosure

---

### OWASP ZAP

Responsible for:

* SQL Injection Detection
* Cross-Site Scripting (XSS)
* Missing Security Headers
* Authentication Weaknesses
* Web Application Security Testing

══════════════════════════════════════════════════════════════════════

# CONTAINERIZATION

### Docker

All security scanners execute inside isolated Docker containers.

Benefits:

* Scanner Isolation
* Improved Security
* Easy Deployment
* Consistent Runtime Environment
* Independent Scanner Execution

══════════════════════════════════════════════════════════════════════

# AUTHENTICATION

### JWT (JSON Web Token)

Used for secure user authentication.

Features:

* Secure Login
* Protected APIs
* Session Management
* Token-based Authorization

══════════════════════════════════════════════════════════════════════

# VERSION CONTROL

### Git & GitHub

Used for:

* Source Code Management
* Version Tracking
* Team Collaboration
* CI/CD Integration

══════════════════════════════════════════════════════════════════════

## COMPLETE TECHNOLOGY FLOW

```text
React + TypeScript
        │
        ▼
Axios (REST API)
        │
        ▼
FastAPI (Python)
        │
        ├──────────────┐
        │              │
        ▼              ▼
 Security Tools     Gemini AI
(Nmap • Nikto • ZAP)
        │              │
        └──────┬───────┘
               ▼
      Drizzle ORM
               │
               ▼
      Neon PostgreSQL
               │
               ▼
      React Dashboard
```

══════════════════════════════════════════════════════════════════════

## SYSTEM STATUS

```text
Frontend        : React.js + TypeScript
Backend         : FastAPI (Python)
Database        : Neon PostgreSQL
ORM             : Drizzle ORM
AI Engine       : Gemini API
Security Tools  : Nmap | Nikto | OWASP ZAP
Authentication  : JWT
Deployment      : Docker
Version Control : Git + GitHub
```
