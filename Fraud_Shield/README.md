# FraudShield – Payment Fraud Detector
Built for **Fin-O-Hack × Paytm** Hackathon

---

## Quick Start (VS Code)

### Step 1 – Install Node.js
Download from https://nodejs.org (choose LTS version) and install it.

### Step 2 – Open the project in VS Code
```
File → Open Folder → select the fraud-detector folder
```

### Step 3 – Open the terminal in VS Code
```
Terminal → New Terminal  (or press Ctrl + `)
```

### Step 4 – Install dependencies
```bash
npm install
```

### Step 5 – Start the app
```bash
npm start
```
The app will open automatically at **http://localhost:3000**

---

## Project Structure
```
fraud-detector/
├── public/
│   └── index.html          ← HTML entry point
├── src/
│   ├── App.js              ← Main app + all UI components
│   ├── App.css             ← All styles
│   ├── index.js            ← React entry point
│   └── index.css           ← Global styles & CSS variables
└── package.json
```

---

## Connecting to Your Backend (Round 2)

In `src/App.js`, find the `analyzeWithAI` function and replace the simulated response with a real API call:

```js
async function analyzeWithAI(payload) {
  const res = await fetch('http://localhost:5000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return await res.json();
}
```

Your Flask backend should return JSON in this shape:
```json
{
  "verdict": "FAKE",
  "confidence": 87,
  "risk_score": 91,
  "flags": [
    { "severity": "HIGH", "label": "Inconsistent font rendering", "found": true }
  ],
  "summary": "The payment screenshot shows signs of digital manipulation..."
}
```

---

## Features
- Screenshot upload with drag & drop
- JSON transaction payload editor (with live validation)
- Simulated AI analysis with animated scanning state
- Verdict card with confidence score, risk score, and flag list
- "Report to Paytm" and "Export Report" actions

---

## Team
Built for Fin-O-Hack – Fintech Hackathon by Paytm × DTU
