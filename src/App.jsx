import React, { useState, useRef, useCallback } from 'react';
import './App.css';

// ─── Sample JSON template that mimics a real Paytm transaction payload ───────
const SAMPLE_JSON = {
  transaction_id: "TXN2024031500123456",
  utr_number: "403015123456789",
  timestamp: "2024-03-15T14:32:10+05:30",
  amount: 5000.00,
  currency: "INR",
  sender: {
    name: "Rahul Sharma",
    vpa: "rahul.sharma@paytm",
    mobile: "98XXXXXXXX",
    account_last4: "4521"
  },
  receiver: {
    name: "Ankit Verma",
    vpa: "ankit.v@okicici",
    mobile: "97XXXXXXXX"
  },
  payment_method: "UPI",
  status: "SUCCESS",
  bank_ref_number: "403015543210987",
  merchant_id: null,
  device_id: "d3f8a2b1c9e4",
  ip_address: "103.21.XX.XX",
  platform: "ANDROID",
  app_version: "10.5.2"
};

// ─── Fake response simulator (replace with real API call) ────────────────────
async function analyzeWithAI(payload) {
  // TODO: Replace this with your actual backend call:
  // const res = await fetch('http://localhost:5000/analyze', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload)
  // });
  // return await res.json();

  await new Promise(r => setTimeout(r, 2800)); // simulate network delay

  // Simulated AI response structure
  return {
    verdict: Math.random() > 0.4 ? 'FAKE' : 'AUTHENTIC',
    confidence: Math.floor(70 + Math.random() * 29),
    risk_score: Math.floor(40 + Math.random() * 59),
    flags: [
      { severity: 'HIGH',   label: 'Inconsistent font rendering around amount field', found: true },
      { severity: 'HIGH',   label: 'UTR number fails Luhn-style checksum validation', found: Math.random() > 0.5 },
      { severity: 'MEDIUM', label: 'Timestamp timezone offset anomaly detected',     found: Math.random() > 0.4 },
      { severity: 'MEDIUM', label: 'Logo pixel density mismatch (possible crop/paste)', found: Math.random() > 0.5 },
      { severity: 'LOW',    label: 'Status badge color outside official Paytm palette', found: Math.random() > 0.3 },
      { severity: 'LOW',    label: 'Shadow/layer artifacts near transaction ID area', found: Math.random() > 0.6 },
    ].filter(f => f.found),
    summary: "The submitted payment evidence shows multiple indicators of digital manipulation. The amount field exhibits compression artifacts inconsistent with native app rendering, and the UTR number does not conform to NPCI formatting standards."
  };
}

// ─── Severity badge ───────────────────────────────────────────────────────────
function SeverityBadge({ level }) {
  const map = { HIGH: '#ff3b5c', MEDIUM: '#ffb800', LOW: '#7a8fa6' };
  return (
    <span style={{
      fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 500,
      color: map[level], border: `1px solid ${map[level]}33`,
      padding: '2px 7px', borderRadius: '3px', letterSpacing: '0.05em'
    }}>{level}</span>
  );
}

// ─── Animated score ring ──────────────────────────────────────────────────────
function ScoreRing({ score, color, label }) {
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="score-ring-wrap">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 44 44)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="score-ring-inner">
        <span className="score-val" style={{ color }}>{score}</span>
        <span className="score-lbl">{label}</span>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('screenshot'); // 'screenshot' | 'json'
  const [dragOver, setDragOver] = useState(false);
  const [image, setImage] = useState(null);         // { file, url }
  const [jsonText, setJsonText] = useState(JSON.stringify(SAMPLE_JSON, null, 2));
  const [jsonError, setJsonError] = useState(null);
  const [status, setStatus] = useState('idle');     // idle | analyzing | done | error
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  // ── File drop / select ──
  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImage({ file, url: URL.createObjectURL(file) });
    setResult(null); setStatus('idle');
  }, []);

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // ── JSON validation ──
  const handleJsonChange = (val) => {
    setJsonText(val);
    try { JSON.parse(val); setJsonError(null); }
    catch (e) { setJsonError(e.message); }
  };

  // ── Analyze ──
  const analyze = async () => {
    setStatus('analyzing'); setResult(null);
    try {
      let payload = { mode: tab };
      if (tab === 'screenshot') {
        if (!image) { setStatus('idle'); return; }
        payload.image_name = image.file.name;
        payload.image_size = image.file.size;
        // In production: convert to base64 and send
      } else {
        payload.transaction = JSON.parse(jsonText);
      }
      const res = await analyzeWithAI(payload);
      setResult(res);
      setStatus('done');
    } catch (e) {
      setStatus('error');
    }
  };

  const reset = () => { setStatus('idle'); setResult(null); setImage(null); };

  const canAnalyze = status !== 'analyzing' && (
    (tab === 'screenshot' && image) ||
    (tab === 'json' && !jsonError)
  );

  return (
    <div className="app">
      {/* Background grid */}
      <div className="bg-grid" />

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">
              <ShieldIcon />
            </div>
            <div>
              <span className="logo-name">FraudShield</span>
              <span className="logo-sub">by Fin-O-Hack × Paytm</span>
            </div>
          </div>
          <div className="header-badge">
            <span className="dot" />
            AI-Powered Detection
          </div>
        </div>
      </header>

      <main className="main">
        {/* Hero text */}
        <div className="hero">
          <h1 className="hero-title">
            Detect Fake<br />
            <span className="accent-text">Payment Proofs</span>
          </h1>
          <p className="hero-sub">
            Upload a screenshot or paste a transaction JSON — our AI will verify
            authenticity and flag suspicious indicators instantly.
          </p>
        </div>

        {/* Input card */}
        <div className="card input-card" style={{ animationDelay: '0.1s' }}>
          {/* Tabs */}
          <div className="tabs">
            <button className={`tab ${tab === 'screenshot' ? 'active' : ''}`}
              onClick={() => { setTab('screenshot'); setResult(null); setStatus('idle'); }}>
              <ImageIcon /> Screenshot Upload
            </button>
            <button className={`tab ${tab === 'json' ? 'active' : ''}`}
              onClick={() => { setTab('json'); setResult(null); setStatus('idle'); }}>
              <JsonIcon /> JSON Payload
            </button>
          </div>

          {/* Screenshot tab */}
          {tab === 'screenshot' && (
            <div className="tab-content">
              {!image ? (
                <div
                  className={`dropzone ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current.click()}
                >
                  <input ref={fileRef} type="file" accept="image/*" hidden
                    onChange={e => handleFile(e.target.files[0])} />
                  <UploadIcon />
                  <p className="drop-title">Drop payment screenshot here</p>
                  <p className="drop-sub">or click to browse · PNG, JPG, WEBP</p>
                  <div className="drop-examples">
                    <span>Paytm receipts</span>
                    <span>UPI confirmations</span>
                    <span>Bank SMS screenshots</span>
                    <span>GPay / PhonePe</span>
                  </div>
                </div>
              ) : (
                <div className="preview-wrap">
                  <div className="preview-img-box">
                    <img src={image.url} alt="uploaded" className="preview-img" />
                    <div className="preview-overlay">
                      <span className="preview-name">{image.file.name}</span>
                      <span className="preview-size">{(image.file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button className="btn-ghost" onClick={reset}>✕ Remove</button>
                </div>
              )}
            </div>
          )}

          {/* JSON tab */}
          {tab === 'json' && (
            <div className="tab-content">
              <div className="json-header">
                <span className="json-label">Transaction Payload <span className="mono-tag">application/json</span></span>
                <button className="btn-ghost small"
                  onClick={() => setJsonText(JSON.stringify(SAMPLE_JSON, null, 2))}>
                  Load sample
                </button>
              </div>
              <div className="json-editor-wrap">
                <div className="line-numbers">
                  {jsonText.split('\n').map((_, i) => (
                    <div key={i} className="ln">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  className="json-editor"
                  value={jsonText}
                  onChange={e => handleJsonChange(e.target.value)}
                  spellCheck={false}
                />
              </div>
              {jsonError && (
                <div className="json-error">
                  <span>⚠</span> {jsonError}
                </div>
              )}
              <div className="json-fields">
                <span className="field-hint">Key fields checked: <code>transaction_id</code> <code>utr_number</code> <code>amount</code> <code>timestamp</code> <code>status</code></span>
              </div>
            </div>
          )}

          {/* Analyze button */}
          <div className="card-footer">
            <button
              className={`btn-analyze ${status === 'analyzing' ? 'loading' : ''}`}
              disabled={!canAnalyze}
              onClick={analyze}
            >
              {status === 'analyzing' ? (
                <><span className="spinner" /> Scanning with AI…</>
              ) : (
                <><ShieldIcon small /> Analyze for Fraud</>
              )}
            </button>
            {status === 'done' && (
              <button className="btn-ghost" onClick={reset}>Start Over</button>
            )}
          </div>
        </div>

        {/* Result card */}
        {status === 'analyzing' && (
          <div className="card result-card scanning">
            <div className="scan-anim">
              <div className="scan-ring" />
              <div className="scan-ring r2" />
              <ShieldIcon large />
            </div>
            <p className="scan-text">Running forensic analysis…</p>
            <div className="scan-steps">
              {['Extracting metadata','Checking pixel integrity','Validating UTR / Transaction ID','Cross-referencing patterns','Generating verdict'].map((s, i) => (
                <div key={i} className="scan-step" style={{ animationDelay: `${i * 0.5}s` }}>
                  <span className="step-dot" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {status === 'done' && result && (
          <div className={`card result-card ${result.verdict === 'FAKE' ? 'verdict-fake' : 'verdict-real'}`}>
            {/* Verdict banner */}
            <div className="verdict-banner">
              <div className="verdict-icon-wrap">
                {result.verdict === 'FAKE' ? <DangerIcon /> : <CheckIcon />}
              </div>
              <div className="verdict-text">
                <span className="verdict-label"
                  style={{ color: result.verdict === 'FAKE' ? 'var(--danger)' : 'var(--success)' }}>
                  {result.verdict === 'FAKE' ? '⚠ FRAUDULENT' : '✓ AUTHENTIC'}
                </span>
                <p className="verdict-summary">{result.summary}</p>
              </div>
            </div>

            {/* Score rings */}
            <div className="scores-row">
              <ScoreRing score={result.confidence} color="var(--accent)" label="Confidence" />
              <ScoreRing score={result.risk_score}
                color={result.risk_score > 70 ? 'var(--danger)' : result.risk_score > 40 ? 'var(--warn)' : 'var(--success)'}
                label="Risk Score" />
              <div className="score-ring-wrap text-stat">
                <span className="stat-num" style={{ color: result.verdict === 'FAKE' ? 'var(--danger)' : 'var(--success)' }}>
                  {result.flags.length}
                </span>
                <span className="stat-label">Flags raised</span>
              </div>
            </div>

            {/* Flags */}
            {result.flags.length > 0 && (
              <div className="flags-section">
                <p className="flags-title">Detected Anomalies</p>
                <div className="flags-list">
                  {result.flags.map((flag, i) => (
                    <div key={i} className="flag-item" style={{ animationDelay: `${i * 0.07}s` }}>
                      <SeverityBadge level={flag.severity} />
                      <span className="flag-label">{flag.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.flags.length === 0 && (
              <div className="no-flags">
                <span>✓</span> No suspicious indicators found
              </div>
            )}

            {/* Actions */}
            <div className="result-actions">
              <button className="btn-report">
                <FlagIcon /> Report to Paytm
              </button>
              <button className="btn-ghost" onClick={() => window.print()}>
                Export Report
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="card result-card error-card">
            <p>⚠ Something went wrong. Check your connection and try again.</p>
          </div>
        )}

        {/* How it works */}
        <div className="how-it-works">
          <p className="how-title">How it works</p>
          <div className="how-steps">
            {[
              { n: '01', t: 'Upload Evidence', d: 'Drop a screenshot or paste the raw JSON transaction payload' },
              { n: '02', t: 'AI Forensics',    d: 'Claude Vision inspects pixels, metadata, font rendering & field checksums' },
              { n: '03', t: 'Verdict',         d: 'Get a confidence score, risk rating, and a detailed list of anomalies' },
            ].map((s, i) => (
              <div key={i} className="how-step">
                <span className="how-n">{s.n}</span>
                <span className="how-t">{s.t}</span>
                <span className="how-d">{s.d}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">
        FraudShield · Built for Fin-O-Hack × Paytm · Team Project
      </footer>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ShieldIcon({ small, large }) {
  const s = large ? 32 : small ? 16 : 22;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}
function JsonIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  );
}
function DangerIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  );
}
