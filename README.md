# 🛡️ HealthGuard AI — Remote Patient Monitoring (RPM) Platform

[![GitHub Repository](https://img.shields.io/badge/GitHub-Phantom--dcode%2FHealthguardAI-181717?style=for-the-badge&logo=github)](https://github.com/Phantom-dcode/HealthgaurdAI)
[![Build Status](https://img.shields.io/badge/Build-Passing-emerald?style=for-the-badge&logo=vite)](https://github.com/Phantom-dcode/HealthgaurdAI)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Google Gemini AI](https://img.shields.io/badge/AI_Engine-Gemini_3.1_Flash-8E7CC3?style=for-the-badge&logo=googlecloud)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-19.0.1-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Backend-Express_4-000000?style=for-the-badge&logo=express)](https://expressjs.com/)

> **Next-Generation Clinical Telehealth & Remote Patient Monitoring Powered by Google Gemini AI.**
>
> **Repository:** [https://github.com/Phantom-dcode/HealthgaurdAI](https://github.com/Phantom-dcode/HealthgaurdAI)
>
>🌐 **Live Web Application Links:**
> - 🚀 **Shared Preview App URL**: [https://ais-pre-7dbltetvl7srzfgyfaj6jr-121615617305.asia-east1.run.app](https://ais-pre-7dbltetvl7srzfgyfaj6jr-121615617305.asia-east1.run.app)

---

## 🌟 Executive Summary

**HealthGuard AI** is a production-grade, full-stack medical remote patient monitoring (RPM) and clinical triage application. Built to bridge the communication gap between patients suffering from chronic conditions (hypertension, diabetes, heart failure) and specialized physicians, HealthGuard AI delivers real-time vitals telemetry, instant clinical alerts, and AI risk prediction summaries.

---

## 🚀 Key Features & Role Portals

### 🔑 1. Complete Role-Based Onboarding & Authentication
* **Dedicated Role Selection**: Choose between **Doctor**, **Patient**, or **Compliance Admin** upon registration.
* **Google OAuth & Direct Sign-Up**: Easy account creation with name, email, password, and custom avatar.
* **Auto-Calculated Age & DOB**: Input Date of Birth to dynamically generate verified age.
* **Global Phone & Country Codes**: Support for international phone number formats (`+1`, `+44`, `+91`, `+61`, `+81`, `+971`, etc.).
* **Comprehensive Residential Address**: Capture street address, city, state, postal code, and country.
* **Editable Profile Modal**: Update personal details, emergency contacts, profile photo, or sign out anytime.

---

### 🏥 2. Doctor Console (Physician RPM Dashboard)
* **Live Patient Triage Roster**: Real-time listing of assigned patients categorized by clinical risk levels (**CRITICAL**, **HIGH**, **MEDIUM**, **LOW**).
* **Deep Patient Profiling**: Access complete contact details, DOB, calculated age, home address, emergency contacts, diagnosed conditions, and documented allergies.
* **AI Health Risk Prediction**: Trigger Google's Gemini Flash AI to analyze 30-day vitals history, calculating risk scores (0–100) and generating clinical recommendations.
* **Interactive Vitals Trend Charts**: Multi-metric visual chart for Blood Pressure, Heart Rate, Blood Glucose, and SpO2.
* **Clinical Telehealth Reports**: Create, save, and export medical reports detailing vitals overview and updated treatment/medication plans.

---

### 🛌 3. Patient Portal (Remote Telehealth Dashboard)
* **Direct Vitals Entry**: Support for manual logging, Bluetooth Health Kits, and Continuous Wearable Patches.
* **Live Heartbeat Pulse Canvas**: Real-time visual ECG waveform synchronized to cardiac rate.
* **Primary Care Doctor Connect**: Quick access to assigned physician's specialty, office address, and direct click-to-call clinic link.
* **Emergency Hotline**: Instant 911 call shortcut and direct emergency contact phone link.
* **Historical Vitals Log**: Encrypted historical telemetry table displaying flagged critical events and notes.

---

### 🔒 4. Compliance Admin & Audit Dashboard
* **Immutable Audit Trail**: Log all platform actions including vitals submissions, alert resolutions, and report generation with timestamp & IP records.
* **System Analytics**: Platform health metrics, average alert response times, and user distribution graphs.
* **User Security Directory**: Manage verified doctor and patient accounts with role-based permission safeguards.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT / FRONTEND                               │
│                   React 19 + TypeScript + Tailwind CSS v4                   │
│         [Auth Page] <---> [Patient Portal] <---> [Doctor Console]          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST API Requests
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EXPRESS BACKEND ENGINE                           │
│                          Node.js (Port 3000 / ESM)                          │
│   ├── /api/auth (Login & Register)     ├── /api/vitals (Telemetry Logs)   │
│   ├── /api/patients (Roster)           ├── /api/ai/predict (Gemini AI)    │
│   └── /api/alerts (Clinical Triage)    └── /api/audit (HIPAA Logs)        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ @google/genai SDK
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE GEMINI AI ENGINE                             │
│                     Gemini 3.1 Flash / Gemini 3.6 Flash                     │
│    Analyzes BP, HR, Glucose, SpO2 -> Calculates Clinical Risk Scores       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack & Dependencies

* **Frontend Framework**: React 19, Vite 6, TypeScript 5.8
* **Styling & Motion**: Tailwind CSS v4, Motion (`motion/react`), Lucide React Icons
* **Charts & Visuals**: Recharts (Medical telemetry charts), HTML5 Canvas Engine
* **Server Framework**: Express 4, Node.js v22
* **AI Integration**: `@google/genai` (Google Gen AI SDK)
* **Build & Bundle**: `tsx` (Dev), `esbuild` (Production bundle to `dist/server.cjs`)

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v20 or higher
* **npm**: v10 or higher
* **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com)

### 1. Clone Repository
```bash
git clone https://github.com/Phantom-dcode/HealthgaurdAI.git
cd HealthgaurdAI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file at the root:
```env
GEMINI_API_KEY="your_google_gemini_api_key_here"
PORT=3000
```

### 4. Launch Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🛡️ Security, Privacy & Compliance

* **Role-Based Access Control (RBAC)**: Strict API middleware checks ensuring patients can only view their own records and physicians only access assigned patients.
* **Encrypted Data Representation**: AES-256 standard encryption design patterns applied to patient vitals logs and audit timestamps.
* **JNC 8 & ADA Clinical Thresholds**: Alert rules programmed in compliance with Joint National Committee 8 hypertension guidelines and American Diabetes Association glucose target ranges.

---

## 👨‍💻 Project Maintainer & Repository

* **GitHub Repository**: [https://github.com/Phantom-dcode/HealthgaurdAI](https://github.com/Phantom-dcode/HealthgaurdAI)
* **License**: MIT License

---

*Built with ❤️ for AI-assisted healthcare delivery.*
