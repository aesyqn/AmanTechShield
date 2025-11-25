# AmanTech Shield - Cybersecurity Audit Platform

A comprehensive cybersecurity auditing platform designed for banking and financial institutions, combining cutting-edge security analysis with Islamic ethical principles.

![AmanTech Shield](https://img.shields.io/badge/Security-Audit-00D9FF?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🌟 Features

### Core Security Modules

1. **Penetration Test Simulation**
   - URL vulnerability scanning
   - SSL/TLS certificate validation
   - Weak password policy detection
   - SQL injection risk assessment
   - Security header configuration checks
   - Session management analysis

2. **Advanced Phishing Detection**
   - Text content analysis with 27+ phishing keywords
   - Image and PDF OCR text extraction
   - URL pattern recognition (shorteners, IP addresses, brand impersonation)
   - Suspicious pattern detection (monetary amounts, sensitive info requests)
   - Multi-factor risk scoring algorithm
   - Real-time threat assessment

3. **Intrusion Detection System (IDS)**
   - Log file analysis (CSV/TXT/LOG formats)
   - Failed login attempt detection
   - Unusual access pattern identification
   - Geographic anomaly detection
   - Data exfiltration monitoring
   - Behavioral analysis

4. **Risk Scoring with Islamic Ethics**
   - Technical risk assessment (1-5 scale)
   - Ethical risk evaluation based on Islamic principles
   - Combined risk percentage calculation
   - Severity categorization (Critical/High/Medium/Low)
   - Priority action recommendations
   - Amanah (Trust) and Maslahah (Public Benefit) alignment

5. **Recovery & Disclosure Plan**
   - Comprehensive PDF report generation
   - Text file export option
   - Ethical disclosure policy templates
   - Step-by-step recovery plans
   - Islamic ethical alignment documentation
   - Stakeholder communication guidelines

### Additional Features

- **User Authentication System**
  - Secure registration and login
  - Session persistence
  - User profile management

- **Multi-Step Scanning Flow**
  - Visual progress indicator
  - Step-by-step guidance
  - Real-time vulnerability detection
  - Comprehensive results display

- **Professional Landing Page**
  - Hero section with animated elements
  - About section with mission/vision/values
  - Team member profiles (7 experts)
  - Service showcase
  - Customer testimonials
  - Responsive footer

- **Responsive Design**
  - Mobile-first approach
  - Tablet and desktop optimized
  - Touch-friendly interactions
  - Adaptive layouts

## 🛠️ Tech Stack

### Frontend Framework
- **React 18.x** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework

### Key Libraries
- **Lucide React** - Icon library
- **React Router** (via BrowserRouter pattern) - Client-side routing

### Design System
- **Orbitron** - Futuristic headings font
- **Inter** - Clean body text font
- **JetBrains Mono** - Monospace for code/technical content

### Color Palette
- Primary: `#00D9FF` (Cyber Blue)
- Secondary: `#0066FF` (Electric Blue)
- Success: `#00FF88` (Matrix Green)
- Danger: `#FF0055` (Neon Red)
- Background: `#0A0E27` (Deep Blue-Black)
- Secondary BG: `#131829`

## 📋 Prerequisites

- **Node.js** 16.x or higher
- **npm** 8.x or higher (or **yarn** 1.22.x)
- **Visual Studio Code** (recommended)

## 🚀 Installation & Setup

### 1. Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd amantechshield

# Or extract the ZIP file and navigate to the folder
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Run Development Server

```bash
npm start
# or
yarn start
```

The application will open automatically at `http://localhost:3000`

## 💻 Running in Visual Studio Code

### Method 1: Using Integrated Terminal

1. Open the project folder in VSCode:
   ```bash
   code .
   ```

2. Open the integrated terminal:
   - **Windows/Linux**: `Ctrl + `` ` ``
   - **Mac**: `Cmd + `` ` ``

3. Run the development server:
   ```bash
   npm start
   ```

### Method 2: Using VSCode Tasks

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type "Tasks: Run Task"
3. Select "npm: start"

### Method 3: Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "preLaunchTask": "npm: start"
    }
  ]
}
```

## 📁 Project Structure

```
amantechshield/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── FileUpload.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Navigation.tsx
│   │   ├── RiskScoreDisplay.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── StepIndicator.tsx
│   │   ├── TeamMemberCard.tsx
│   │   ├── TestimonialCard.tsx
│   │   └── VulnerabilityList.tsx
│   │
│   ├── pages/               # Page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ScanningFlow.tsx
│   │
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── mockData.ts
│   │   ├── pdfGenerator.ts
│   │   └── vulnerabilityDetector.ts
│   │
│   ├── App.tsx              # Main app component
│   ├── index.tsx            # Entry point
│   ├── index.css            # Global styles
│   └── tailwind.config.js   # Tailwind configuration
│
├── public/                  # Static assets
├── package.json             # Dependencies
└── README.md               # This file
```

## 🔧 Key Technical Details

### Authentication System
- Uses `localStorage` for session persistence
- Simple email/password validation
- User profile stored as JSON object
- Auto-login on page refresh if session exists

### Vulnerability Detection Algorithms

**Penetration Test:**
- URL pattern matching for SSL validation
- Randomized vulnerability simulation
- Severity scoring (1-5 scale)
- Ethical risk assessment

**Phishing Detection:**
- **Keyword Matching**: 27 phishing indicators
- **URL Analysis**: 5 pattern checks (shorteners, IPs, brand impersonation)
- **Suspicious Patterns**: 6 behavioral indicators
- **Risk Calculation**: 
  - Keywords: 60% weight + 8 points per match
  - URLs: 25 points per match
  - Patterns: 15 points per match
  - Threshold: 2+ keywords OR 1+ URL OR 2+ patterns OR 40%+ risk

**IDS Analysis:**
- Log file parsing (CSV/TXT/LOG)
- Failed login threshold detection (5+ attempts)
- Geographic anomaly simulation
- Data exfiltration pattern recognition

### PDF Generation
- HTML-to-PDF conversion via browser print dialog
- Styled report with gradient headers
- Severity-colored vulnerability cards
- Islamic ethical alignment section
- Recovery plan with timeline

### State Management
- React hooks (`useState`, `useEffect`)
- Custom `useAuth` hook for authentication
- Local component state for scanning flow
- No external state management library

## 🎨 Design Philosophy

### Cybersecurity Aesthetic
- **Dark theme** with neon accents
- **Animated grid background** (Matrix-style)
- **Glassmorphism effects** on cards
- **Glow effects** on interactive elements
- **Smooth transitions** and hover states

### Typography Hierarchy
- **Headings**: Orbitron (futuristic, tech-forward)
- **Body**: Inter (clean, readable)
- **Code**: JetBrains Mono (technical content)

### Motion Design
- Purposeful animations (scanning progress, step transitions)
- Pulse effects on active elements
- Smooth color transitions
- Loading states with spinners

## 🔐 Security Notes

⚠️ **Important**: This is a **demonstration platform** with simulated security checks.

- Vulnerability detection uses pattern matching and randomization
- No actual network scanning or penetration testing
- OCR text extraction is simulated
- PDF reports are generated client-side
- No backend API or database

**For production use**, integrate with:
- Real vulnerability scanning APIs (e.g., OWASP ZAP, Nessus)
- Actual OCR services (e.g., Tesseract.js, Google Vision API)
- Backend authentication system
- Database for storing audit results
- Server-side PDF generation (e.g., Puppeteer, jsPDF)

## 📝 Usage Guide

### For Auditors

1. **Register/Login**
   - Create an account with name, email, position
   - Login persists across sessions

2. **Start Scanning**
   - Click "Start Scanning" from navigation or hero section
   - Complete 5 steps sequentially

3. **Step 1: Penetration Test**
   - Enter target bank website URL
   - Click "Start Penetration Test"
   - Review detected vulnerabilities

4. **Step 2: Phishing Detection**
   - Paste suspicious email content OR
   - Upload email file (.txt, .eml, .msg) OR
   - Upload image/PDF for OCR analysis
   - Click "Analyze for Phishing"
   - Review detection results

5. **Step 3: IDS Analysis**
   - Upload system log file (CSV/TXT/LOG)
   - Click "Analyze Log Files"
   - Review detected anomalies

6. **Step 4: Risk Scoring**
   - Click "Calculate Risk Score"
   - Review overall risk assessment
   - Check technical vs. ethical risk breakdown
   - Review priority actions

7. **Step 5: Recovery Plan**
   - Download report as PDF or Text
   - Share with stakeholders
   - Implement recommended actions

## 🤝 Contributing

This is a demonstration project. For production deployment:

1. Implement real security scanning APIs
2. Add backend authentication
3. Integrate database for audit history
4. Add user role management
5. Implement real-time notifications
6. Add multi-language support
7. Enhance accessibility (WCAG 2.1 AA)

## 📄 License

This project is for educational and demonstration purposes.

## 🙏 Islamic Ethical Principles

AmanTech Shield aligns with core Islamic values:

- **Amanah (Trust)**: Protecting customer data as a sacred trust
- **Maslahah (Public Benefit)**: Prioritizing user safety and security
- **Ihsan (Excellence)**: Pursuing the highest security standards
- **Adl (Justice)**: Fair and transparent disclosure practices

---

**Built with ❤️ for secure financial institutions**

For questions or support, contact: contact@amantechshield.com
