import { useState, useEffect } from "react";

const FONT_URL = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap";
const ff = "Inter, sans-serif";
const TODAY = new Date().toISOString().split("T")[0];
const NOW = () => new Date().toISOString();
const isFriday = (d) => new Date(d + "T00:00:00").getDay() === 5;

function getExpected(driver, date) {
  if (driver.frequency === "daily") return isFriday(date) ? 0 : driver.dailyRate;
  if (driver.frequency === "weekly") return Math.round(driver.dailyRate * 6 * 0.95);
  if (driver.frequency === "monthly") return Math.round(driver.dailyRate * 26 * 0.90);
  return driver.dailyRate;
}
const freqLabel = (f) => ({ daily: "Daily", weekly: "Weekly", monthly: "Monthly" }[f] || f);
const freqColor = (f) => ({ daily: "#0ea5e9", weekly: "#8b5cf6", monthly: "#ec4899" }[f] || "#94a3b8");
const statusColor = (s) => ({ full: "#059669", partial: "#d97706", over: "#2563eb", unpaid: "#dc2626", pending: "#94a3b8" }[s] || "#dc2626");
const statusLabel = (s) => ({ full: "Paid", partial: "Partial", over: "Overpaid", unpaid: "Unpaid", pending: "Pending Review" }[s] || s);
const fmtDiff = (n) => (n >= 0 ? "+" : "") + n + " JD";
const methodIsOnline = (m) => m !== "Cash";

const INIT_DRIVERS = [
  { id: 1, name: "Abdul Hakeem", car: "37963", dailyRate: 28, frequency: "daily", active: true, balance: -4, phone: "0791000001", email: "abdulhakeem@email.com", username: "abdulhakeem", passwordHash: "1234", passwordSet: true, pendingReset: false, gdriveBackup: false },
  { id: 2, name: "Anwar", car: "45821", dailyRate: 32, frequency: "daily", active: true, balance: 0, phone: "0791000002", email: "anwar@email.com", username: "anwar", passwordHash: "1234", passwordSet: true, pendingReset: false, gdriveBackup: false },
  { id: 3, name: "Badr Musaada", car: "62104", dailyRate: 28, frequency: "weekly", active: true, balance: 8, phone: "0791000003", email: "badr@email.com", username: "badr", passwordHash: "1234", passwordSet: true, pendingReset: false, gdriveBackup: false },
  { id: 4, name: "Sami Al-Khaled", car: "71345", dailyRate: 35, frequency: "monthly", active: true, balance: -12, phone: "0791000004", email: "sami@email.com", username: "sami", passwordHash: "1234", passwordSet: true, pendingReset: false, gdriveBackup: false },
  { id: 5, name: "Mahmoud Al-Nour", car: "88901", dailyRate: 30, frequency: "daily", active: true, balance: 0, phone: "0791000005", email: "mahmoud@email.com", username: "mahmoud", passwordHash: "1234", passwordSet: true, pendingReset: false, gdriveBackup: false },
];

const INIT_PAYMENTS = [
  { id: 1, driverId: 1, driverName: "Abdul Hakeem", car: "37963", date: "2026-03-07", expected: 28, entries: [{ id: "e1", amount: 24, method: "Cash", receiptNumber: "RC-0071", receiptImage: null }], totalPaid: 24, diff: -4, status: "partial", approved: "approved", adminNote: "" },
  { id: 2, driverId: 2, driverName: "Anwar", car: "45821", date: "2026-03-07", expected: 32, entries: [{ id: "e1", amount: 32, method: "CliQ", receiptNumber: "TXN-88421", receiptImage: null }], totalPaid: 32, diff: 0, status: "full", approved: "approved", adminNote: "" },
  { id: 3, driverId: 3, driverName: "Badr Musaada", car: "62104", date: "2026-03-07", expected: 160, entries: [{ id: "e1", amount: 100, method: "Cash", receiptNumber: "RC-0072", receiptImage: null }, { id: "e2", amount: 60, method: "Zain Cash", receiptNumber: "ZC-4412", receiptImage: null }], totalPaid: 160, diff: 0, status: "full", approved: "approved", adminNote: "" },
];

const INIT_EXPENSES = [
  { id: 1, date: "2026-03-07", category: "Maintenance", description: "Oil change - Car 37963", amount: 15 },
  { id: 2, date: "2026-03-06", category: "Office Rent", description: "Monthly rent", amount: 200 },
  { id: 3, date: "2026-03-05", category: "Fuel", description: "Backup fuel", amount: 25 },
];

function useIsMobile(bp = 768) {
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth < bp : false);
  useEffect(() => { const h = () => setM(window.innerWidth < bp); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, [bp]);
  return m;
}

const S = {
  input: { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: ff },
  card: { background: "rgba(255,255,255,0.035)", borderRadius: 14, padding: 18 },
  label: { color: "#94a3b8", fontSize: 12, marginBottom: 6, display: "block", fontWeight: 600 },
  btn: { border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: ff },
  btnP: { background: "linear-gradient(135deg,#d97706,#b45309)", color: "#fff" },
  btnG: { background: "rgba(255,255,255,0.06)", color: "#94a3b8" },
};

function Field({ label, value, onChange, type = "text", placeholder = "", span = 1, options = null, disabled = false }) {
  return (
    <div style={{ marginBottom: 14, gridColumn: span === 2 ? "1 / -1" : undefined }}>
      {label && <label style={S.label}>{label}</label>}
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...S.input, background: "#1a2332" }} disabled={disabled}>
          {options.map(o => typeof o === "object" ? <option key={o.value} value={o.value}>{o.label}</option> : <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...S.input, opacity: disabled ? 0.5 : 1 }} disabled={disabled} />
      )}
    </div>
  );
}

function Badge({ status }) { const c = statusColor(status); return <span style={{ background: c + "20", color: c, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700, whiteSpace: "nowrap" }}>{statusLabel(status)}</span>; }
function FreqBadge({ freq }) { const c = freqColor(freq); return <span style={{ background: c + "18", color: c, fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>{freqLabel(freq)}</span>; }
function Toast({ msg, type }) { return <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: type === "error" ? "#dc2626" : "#059669", color: "#fff", padding: "12px 28px", borderRadius: 12, zIndex: 9999, fontWeight: 700, fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.5)", whiteSpace: "nowrap", pointerEvents: "none", fontFamily: ff }}>{msg}</div>; }

function Modal({ children, onClose, title, mobile }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#151d2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, padding: mobile ? 20 : 28, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ color: "#d97706", margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [drivers, setDrivers] = useState(INIT_DRIVERS);
  const [payments, setPayments] = useState(INIT_PAYMENTS);
  const [expenses, setExpenses] = useState(INIT_EXPENSES);
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const link = document.createElement("link"); link.rel = "stylesheet"; link.href = FONT_URL; document.head.appendChild(link);
    const meta = document.createElement("meta"); meta.name = "viewport"; meta.content = "width=device-width, initial-scale=1"; document.head.appendChild(meta);
  }, []);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const addLog = (action, details, userId, userName, role) => {
    const u = userId || user?.driverId || "system", n = userName || user?.name || "System", r = role || user?.role || "system";
    setLogs(prev => [{ id: Date.now() + Math.random(), timestamp: NOW(), userId: u, userName: n, userRole: r, action, details }, ...prev]);
  };

  function doLogin(username, password) {
    if (username === "admin" && password === "admin123") { setUser({ role: "admin", name: "Admin" }); addLog("login", "Admin login", "admin", "Admin", "admin"); return { ok: true }; }
    const d = drivers.find(d => d.username === username && d.active);
    if (!d) return { ok: false, error: "Username not found or account suspended" };
    if (!d.passwordSet || d.pendingReset) return { ok: false, needsPassword: true, driver: d };
    if (d.passwordHash !== password) return { ok: false, error: "Incorrect password" };
    setUser({ role: "driver", driverId: d.id, name: d.name }); addLog("login", `Login: ${d.name}`, d.id, d.name, "driver"); return { ok: true };
  }

  function setPasswordFn(driverId, newPassword) {
    setDrivers(p => p.map(d => d.id === driverId ? { ...d, passwordHash: newPassword, passwordSet: true, pendingReset: false } : d));
    const d = drivers.find(x => x.id === driverId);
    addLog("password_set", `Password set — ${d?.name}`, driverId, d?.name, "driver"); showToast("Password set successfully");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0c1220", fontFamily: ff, direction: "ltr", color: "#e2e8f0" }}>
      {toast && <Toast {...toast} />}
      {!user ? <LoginPage onLogin={doLogin} setPassword={setPasswordFn} drivers={drivers} />
        : user.role === "admin"
          ? <AdminShell user={user} page={page} setPage={setPage} drivers={drivers} setDrivers={setDrivers} payments={payments} setPayments={setPayments} expenses={expenses} setExpenses={setExpenses} logs={logs} addLog={addLog} logout={() => { addLog("logout", "Admin logout"); setUser(null); setPage("dashboard"); }} showToast={showToast} />
          : <DriverShell user={user} drivers={drivers} setDrivers={setDrivers} payments={payments} setPayments={setPayments} addLog={addLog} logout={() => { addLog("logout", `Logout: ${user.name}`); setUser(null); }} showToast={showToast} />
      }
    </div>
  );
}

function LoginPage({ onLogin, setPassword, drivers }) {
  const mobile = useIsMobile();
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState("");
  const [pwSetup, setPwSetup] = useState(null); const [newPw, setNewPw] = useState(""); const [confirmPw, setConfirmPw] = useState("");
  function go() { setErr(""); const res = onLogin(u.trim(), p); if (res.ok) return; if (res.needsPassword) { setPwSetup(res.driver); return; } setErr(res.error); }
  function handleSetPw() {
    if (newPw.length < 4) { setErr("Password must be at least 4 characters"); return; }
    if (newPw !== confirmPw) { setErr("Passwords do not match"); return; }
    setPassword(pwSetup.id, newPw); setPwSetup(null); setNewPw(""); setConfirmPw(""); setU(""); setP("");
  }
  const active = drivers.filter(d => d.active);
  const boxStyle = { width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: mobile ? 24 : 36 };

  if (pwSetup) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#0c1220,#162032,#0c1220)", padding: 16 }}>
      <div style={boxStyle}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 36 }}>🔐</div>
          <h2 style={{ color: "#f8fafc", margin: "8px 0 4px", fontWeight: 700, fontSize: 18 }}>{pwSetup.pendingReset ? "Reset Password" : "Set Password"}</h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: 13 }}>Hello, {pwSetup.name}</p>
        </div>
        <Field label="New Password" value={newPw} onChange={setNewPw} type="password" placeholder="At least 4 characters" />
        <Field label="Confirm Password" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Retype" />
        {err && <p style={{ color: "#f87171", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{err}</p>}
        <button onClick={handleSetPw} style={{ ...S.btn, ...S.btnP, width: "100%", padding: 14, fontSize: 15 }}>Set Password</button>
        <button onClick={() => { setPwSetup(null); setErr(""); }} style={{ ...S.btn, ...S.btnG, width: "100%", marginTop: 8, padding: 10 }}>Back</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#0c1220,#162032,#0c1220)", padding: 16 }}>
      <div style={boxStyle}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44 }}>🚖</div>
          <h2 style={{ color: "#f8fafc", margin: "6px 0 4px", fontWeight: 700, fontSize: mobile ? 20 : 22 }}>Rubu Al-Urdon</h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: 13 }}>Driver Collection Management System</p>
        </div>
        <Field label="Username" value={u} onChange={setU} placeholder="admin or username" />
        <div style={{ marginBottom: 18 }}><label style={S.label}>Password</label><input type="password" value={p} onChange={e => setP(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} placeholder="••••••••" style={S.input} /></div>
        {err && <p style={{ color: "#f87171", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{err}</p>}
        <button onClick={go} style={{ ...S.btn, ...S.btnP, width: "100%", padding: 14, fontSize: 16 }}>Sign In</button>
        <div style={{ marginTop: 18, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12, fontSize: 12, color: "#64748b", lineHeight: 2 }}>
          <strong style={{ color: "#94a3b8" }}>Demo:</strong><br />🔑 Admin: <code style={{ color: "#d97706" }}>admin / admin123</code><br />
          {active.slice(0, 3).map(d => <span key={d.id}>🚗 {d.name}: <code style={{ color: "#7c9fdb" }}>{d.username}</code><br /></span>)}
          <span style={{ color: "#475569", fontSize: 11 }}>* Default password: 1234</span>
        </div>
      </div>
    </div>
  );
}

function AdminShell(props) {
  const { page, setPage, logout } = props;
  const mobile = useIsMobile();
  const nav = [
    { id: "dashboard", icon: "📊", label: "Dashboard" }, { id: "payments", icon: "💰", label: "Payments" },
    { id: "drivers", icon: "👤", label: "Drivers" }, { id: "expenses", icon: "📋", label: "Expenses" },
    { id: "reports", icon: "📈", label: "Reports" }, { id: "logs", icon: "📜", label: "Audit Log" },
  ];
  const pages = { dashboard: Dashboard, payments: Payments, drivers: Drivers, expenses: Expenses, reports: Reports, logs: AuditLogs };
  const Page = pages[page] || Dashboard;

  if (mobile) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", paddingBottom: 68 }}>
      <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 22 }}>🚖</span><span style={{ color: "#d97706", fontWeight: 700, fontSize: 15 }}>Rubu Al-Urdon</span></div>
        <button onClick={logout} style={{ ...S.btn, background: "rgba(220,38,38,0.1)", color: "#f87171", padding: "6px 12px", fontSize: 12 }}>Logout</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}><Page {...props} /></div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#111827", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom, 0px)", overflowX: "auto" }}>
        {nav.map(n => <button key={n.id} onClick={() => setPage(n.id)} style={{ flex: 1, minWidth: 52, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "10px 0 8px", background: "transparent", border: "none", color: page === n.id ? "#d97706" : "#64748b", cursor: "pointer", fontSize: 9, fontFamily: ff, fontWeight: 600, borderTop: page === n.id ? "2px solid #d97706" : "2px solid transparent" }}><span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: 200, background: "rgba(255,255,255,0.02)", borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "22px 18px 18px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}><div style={{ fontSize: 26 }}>🚖</div><div style={{ color: "#d97706", fontWeight: 700, fontSize: 14 }}>Rubu Al-Urdon</div><div style={{ color: "#475569", fontSize: 11 }}>Admin Panel</div></div>
        <nav style={{ flex: 1, paddingTop: 10 }}>{nav.map(n => <button key={n.id} onClick={() => setPage(n.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 18px", background: page === n.id ? "rgba(217,119,6,0.12)" : "transparent", border: "none", borderRight: page === n.id ? "3px solid #d97706" : "3px solid transparent", color: page === n.id ? "#d97706" : "#94a3b8", cursor: "pointer", fontSize: 13, fontFamily: ff, fontWeight: 600 }}>{n.icon} {n.label}</button>)}</nav>
        <div style={{ padding: "14px 18px" }}><button onClick={logout} style={{ ...S.btn, width: "100%", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.15)", color: "#f87171", fontSize: 12 }}>🚪 Logout</button></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}><Page {...props} /></div>
    </div>
  );
}

function Dashboard({ drivers, payments }) {
  const mobile = useIsMobile();
  const ap = payments.filter(p => p.approved === "approved");
  const tp = ap.filter(p => p.date === TODAY);
  const pendingCount = payments.filter(p => !p.approved || p.approved === "pending").length;
  const totExp = drivers.filter(d => d.active).reduce((s, d) => s + getExpected(d, TODAY), 0);
  const totColl = tp.reduce((s, p) => s + p.totalPaid, 0);
  const shortage = tp.reduce((s, p) => s + Math.min(0, p.diff), 0);
  const fridayToday = isFriday(TODAY);
  return (
    <div style={{ padding: mobile ? 16 : 32 }}>
      <h2 style={{ color: "#f8fafc", fontWeight: 700, margin: "0 0 4px", fontSize: mobile ? 18 : 20 }}>Dashboard</h2>
      <p style={{ color: "#64748b", margin: "0 0 20px", fontSize: 12 }}>Today: {TODAY} {fridayToday ? "🕌 (Friday — Daily Holiday)" : ""}</p>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)", gap: mobile ? 10 : 14, marginBottom: 24 }}>
        {[{ label: "Expected Today", val: totExp + " JD", icon: "🎯", c: "#2563eb" }, { label: "Collected", val: totColl + " JD", icon: "✅", c: "#059669" }, { label: "Shortage", val: Math.abs(shortage) + " JD", icon: "⚠️", c: "#d97706" }, { label: "Awaiting Review", val: pendingCount, icon: "⏳", c: "#8b5cf6" }].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${s.c}25`, borderRadius: 12, padding: mobile ? 14 : 18 }}><div style={{ fontSize: mobile ? 20 : 24, marginBottom: 4 }}>{s.icon}</div><div style={{ color: s.c, fontSize: mobile ? 16 : 20, fontWeight: 700 }}>{s.val}</div><div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{s.label}</div></div>
        ))}
      </div>
      <h3 style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: 12, fontSize: mobile ? 14 : 16 }}>Drivers' Status Today</h3>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
        {drivers.filter(d => d.active).map(d => {
          const exp = getExpected(d, TODAY); const p = tp.find(p => p.driverId === d.id); const st = exp === 0 ? "full" : p ? p.status : "unpaid";
          return (<div key={d.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${statusColor(st)}30`, borderRadius: 12, padding: mobile ? 12 : 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13 }}>{d.name}</span><div style={{ display: "flex", gap: 4 }}><FreqBadge freq={d.frequency} /><Badge status={st} /></div></div>
            <div style={{ color: "#64748b", fontSize: 11 }}>🚗 {d.car} · {exp === 0 ? "Holiday" : `Required: ${exp} JD`}</div>
            {p && <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>Paid <strong style={{ color: statusColor(st) }}>{p.totalPaid} JD</strong> ({p.entries.length} payment(s))</div>}
          </div>);
        })}
      </div>
    </div>
  );
}

function Payments({ payments, setPayments, showToast, addLog }) {
  const mobile = useIsMobile();
  const [filter, setFilter] = useState("all");
  const [review, setReview] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  let list = [...payments];
  if (filter === "pending") list = list.filter(p => !p.approved || p.approved === "pending");
  else if (filter !== "all") list = list.filter(p => p.status === filter);
  list.sort((a, b) => b.date.localeCompare(a.date));

  function handleApproval(paymentId, decision) {
    setPayments(p => p.map(x => x.id === paymentId ? { ...x, approved: decision, adminNote } : x));
    const pm = payments.find(x => x.id === paymentId);
    addLog(decision === "approved" ? "payment_approved" : "payment_rejected", `${decision === "approved" ? "Approved" : "Rejected"} payment ${pm?.driverName} (${pm?.totalPaid} JD)${adminNote ? " — " + adminNote : ""}`);
    showToast(decision === "approved" ? "Approved ✅" : "Rejected ❌"); setReview(null); setAdminNote("");
  }

  return (
    <div style={{ padding: mobile ? 16 : 32 }}>
      <h2 style={{ color: "#f8fafc", fontWeight: 700, marginBottom: 16, fontSize: mobile ? 18 : 20 }}>Payment Records</h2>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "pending", "full", "partial", "over", "unpaid"].map(f => <button key={f} onClick={() => setFilter(f)} style={{ ...S.btn, padding: "6px 14px", borderRadius: 20, fontSize: 11, background: filter === f ? "#d97706" : "rgba(255,255,255,0.06)", color: filter === f ? "#fff" : "#94a3b8" }}>{f === "all" ? "All" : f === "pending" ? "⏳ Pending Review" : statusLabel(f)}</button>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map(p => (
          <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${!p.approved || p.approved === "pending" ? "#8b5cf6" : statusColor(p.status)}25`, borderRadius: 12, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>{p.driverName}</span><Badge status={p.status} />
                {(!p.approved || p.approved === "pending") && <span style={{ background: "#8b5cf620", color: "#8b5cf6", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>Waiting</span>}
                {p.approved === "rejected" && <span style={{ background: "#dc262620", color: "#dc2626", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>Rejected</span>}
              </div>
              <span style={{ color: "#64748b", fontSize: 12 }}>{p.date}</span>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ color: "#64748b" }}>Expected: <strong style={{ color: "#e2e8f0" }}>{p.expected} JD</strong></span>
              <span style={{ color: "#64748b" }}>Paid: <strong style={{ color: "#e2e8f0" }}>{p.totalPaid} JD</strong></span>
              <span style={{ color: "#64748b" }}>Difference: <strong style={{ color: statusColor(p.status) }}>{fmtDiff(p.diff)}</strong></span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <div style={{ color: "#64748b", fontSize: 10, fontWeight: 700, marginBottom: 6 }}>Details ({p.entries.length})</div>
              {p.entries.map((e, i) => <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none", fontSize: 12, flexWrap: "wrap", gap: 4 }}><span style={{ color: "#e2e8f0" }}>{e.amount} JD — {e.method}</span><span style={{ color: "#64748b" }}>#{e.receiptNumber}</span>{e.receiptImage && <span style={{ color: "#0ea5e9", fontSize: 11 }}>📎</span>}</div>)}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(!p.approved || p.approved === "pending") && <>
                <button onClick={() => handleApproval(p.id, "approved")} style={{ ...S.btn, background: "rgba(5,150,105,0.12)", color: "#059669", padding: "6px 14px", fontSize: 12 }}>✅ Approve</button>
                <button onClick={() => { setReview(p); setAdminNote(""); }} style={{ ...S.btn, background: "rgba(220,38,38,0.08)", color: "#dc2626", padding: "6px 14px", fontSize: 12 }}>❌ Reject</button>
              </>}
              <button onClick={() => { setReview(p); setAdminNote(""); }} style={{ ...S.btn, ...S.btnG, padding: "6px 14px", fontSize: 12 }}>👁 Review</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div style={{ color: "#475569", textAlign: "center", padding: 36 }}>No records found</div>}
      </div>
      {review && (
        <Modal onClose={() => setReview(null)} title={`Review — ${review.driverName}`} mobile={mobile}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 10 }}><div style={{ color: "#64748b", fontSize: 11 }}>Date</div><div style={{ color: "#e2e8f0", fontWeight: 700 }}>{review.date}</div></div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 10 }}><div style={{ color: "#64748b", fontSize: 11 }}>Total</div><div style={{ color: "#e2e8f0", fontWeight: 700 }}>{review.totalPaid} / {review.expected} JD</div></div>
          </div>
          <h4 style={{ color: "#94a3b8", fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>Payments:</h4>
          {review.entries.map(e => (
            <div key={e.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 4 }}>
                <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{e.amount} JD — {e.method}</span>
                <span style={{ color: methodIsOnline(e.method) ? "#0ea5e9" : "#d97706", fontSize: 12 }}>{methodIsOnline(e.method) ? "Transaction" : "Receipt"}: {e.receiptNumber}</span>
              </div>
              {e.receiptImage ? <img src={e.receiptImage} alt="" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }} /> : <div style={{ color: "#475569", fontSize: 11 }}>No attachment</div>}
            </div>
          ))}
          {(!review.approved || review.approved === "pending") && <>
            <Field label="Note (optional)" value={adminNote} onChange={setAdminNote} placeholder="Notes..." />
            <div style={{ display: "flex", gap: 10 }}><button onClick={() => handleApproval(review.id, "approved")} style={{ ...S.btn, flex: 1, background: "#059669", color: "#fff" }}>✅ Approve</button><button onClick={() => handleApproval(review.id, "rejected")} style={{ ...S.btn, flex: 1, background: "#dc2626", color: "#fff" }}>❌ Reject</button></div>
          </>}
          {review.approved && review.approved !== "pending" && <div style={{ background: review.approved === "approved" ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)", borderRadius: 10, padding: 12, textAlign: "center" }}><span style={{ color: review.approved === "approved" ? "#059669" : "#dc2626", fontWeight: 700 }}>{review.approved === "approved" ? "✅ Approved" : "❌ Rejected"}</span>{review.adminNote && <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>📝 {review.adminNote}</div>}</div>}
        </Modal>
      )}
    </div>
  );
}

function Drivers({ drivers, setDrivers, payments, showToast, addLog }) {
  const mobile = useIsMobile();
  const EMPTY = { name: "", car: "", dailyRate: 28, frequency: "daily", phone: "", email: "", username: "", active: true };
  const [modal, setModal] = useState(null); const [form, setForm] = useState(EMPTY);
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  function validate() {
    if (!form.name.trim()) return "Please enter a name"; if (!form.car.trim()) return "Please enter a car number";
    if (!form.email.trim()) return "Please enter an email"; if (!form.username.trim()) return "Please enter a username";
    if (drivers.find(d => d.username === form.username.trim() && d.id !== modal?.id)) return "Username already exists"; return null;
  }
  function save() {
    const err = validate(); if (err) return showToast(err, "error");
    if (modal.mode === "add") { setDrivers(p => [...p, { ...form, id: Date.now(), balance: 0, dailyRate: Number(form.dailyRate), passwordHash: "", passwordSet: false, pendingReset: false, gdriveBackup: false }]); addLog("driver_added", `Driver added: ${form.name}`); showToast("Driver added ✅"); }
    else { setDrivers(p => p.map(d => d.id === modal.id ? { ...d, name: form.name, car: form.car, dailyRate: Number(form.dailyRate), frequency: form.frequency, phone: form.phone, email: form.email, username: form.username, active: form.active } : d)); addLog("driver_edited", `Driver edited: ${form.name}`); showToast("Updated ✅"); }
    setModal(null);
  }
  function resetPw(d) { setDrivers(p => p.map(x => x.id === d.id ? { ...x, pendingReset: true } : x)); addLog("password_reset", `Password reset for ${d.name} → ${d.email}`); showToast(`Sent to ${d.email}`); }
  const freqOpts = [{ value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" }];

  return (
    <div style={{ padding: mobile ? 16 : 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div><h2 style={{ color: "#f8fafc", fontWeight: 700, margin: 0, fontSize: mobile ? 18 : 20 }}>Driver Management</h2><p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 12 }}>{drivers.length} drivers — {drivers.filter(d => d.active).length} active</p></div>
        <button onClick={() => { setForm(EMPTY); setModal({ mode: "add" }); }} style={{ ...S.btn, ...S.btnP }}>+ Add Driver</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
        {drivers.map(d => {
          const rate = d.frequency === "daily" ? d.dailyRate + " JD/day" : d.frequency === "weekly" ? Math.round(d.dailyRate * 6 * 0.95) + " JD/week" : Math.round(d.dailyRate * 26 * 0.90) + " JD/month";
          return (
            <div key={d.id} style={{ ...S.card, border: `1px solid ${d.active ? "rgba(5,150,105,0.2)" : "rgba(255,255,255,0.06)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div><div style={{ color: "#f8fafc", fontWeight: 700, fontSize: 15 }}>{d.name}</div><div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>🚗 {d.car} · 📧 {d.email}</div></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <span style={{ background: d.active ? "rgba(5,150,105,0.12)" : "rgba(220,38,38,0.12)", color: d.active ? "#059669" : "#dc2626", fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{d.active ? "Active" : "Suspended"}</span>
                  <FreqBadge freq={d.frequency} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "8px 12px" }}><div style={{ color: "#64748b", fontSize: 10 }}>Required</div><div style={{ color: "#d97706", fontWeight: 700, fontSize: 13 }}>{rate}</div></div>
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "8px 12px" }}><div style={{ color: "#64748b", fontSize: 10 }}>Account</div><div style={{ color: "#7c9fdb", fontSize: 12, fontWeight: 600 }}>👤 {d.username}</div><div style={{ color: d.passwordSet ? "#059669" : "#d97706", fontSize: 10 }}>{d.passwordSet ? (d.pendingReset ? "⏳ Pending" : "🔒 Set") : "🔓 Not Set"}</div></div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => { setForm({ name: d.name, car: d.car, dailyRate: d.dailyRate, frequency: d.frequency, phone: d.phone, email: d.email, username: d.username, active: d.active }); setModal({ mode: "edit", id: d.id }); }} style={{ ...S.btn, flex: 1, background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706", padding: "7px 10px", fontSize: 12 }}>✏️ Edit</button>
                <button onClick={() => resetPw(d)} style={{ ...S.btn, flex: 1, background: "rgba(14,165,233,0.08)", color: "#0ea5e9", padding: "7px 10px", fontSize: 12 }}>🔄 Password</button>
                <button onClick={() => { setDrivers(p => p.map(x => x.id === d.id ? { ...x, active: !x.active } : x)); addLog("driver_toggled", `${d.active ? "Deactivate" : "Activate"} ${d.name}`); }} style={{ ...S.btn, ...S.btnG, padding: "7px 10px", fontSize: 12 }}>{d.active ? "⏸" : "▶"}</button>
              </div>
            </div>
          );
        })}
      </div>
      {modal && (
        <Modal onClose={() => setModal(null)} title={modal.mode === "add" ? "➕ Add Driver" : "✏️ Edit"} mobile={mobile}>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: "0 14px" }}>
            <Field label="Full Name *" value={form.name} onChange={v => setF("name", v)} placeholder="Full name" span={2} />
            <Field label="Car Number *" value={form.car} onChange={v => setF("car", v)} placeholder="37963" />
            <Field label="Daily Rate (JD)" value={form.dailyRate} onChange={v => setF("dailyRate", v)} type="number" />
            <Field label="Payment Schedule" value={form.frequency} onChange={v => setF("frequency", v)} options={freqOpts} />
            <Field label="Phone" value={form.phone} onChange={v => setF("phone", v)} placeholder="07xxxxxxxx" />
            <Field label="Email *" value={form.email} onChange={v => setF("email", v)} placeholder="name@email.com" span={2} />
            <Field label="Username *" value={form.username} onChange={v => setF("username", v.toLowerCase().replace(/\s/g, ""))} span={2} />
          </div>
          {form.frequency !== "daily" && <div style={{ background: "rgba(139,92,246,0.08)", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12, color: "#a78bfa" }}>💡 Calculated amount: <strong>{form.frequency === "weekly" ? Math.round(Number(form.dailyRate || 0) * 6 * 0.95) : Math.round(Number(form.dailyRate || 0) * 26 * 0.90)} JD</strong> ({form.frequency === "weekly" ? "5% discount" : "10% discount"})</div>}
          {modal.mode === "add" && <div style={{ background: "rgba(14,165,233,0.08)", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12, color: "#0ea5e9" }}>🔐 Driver will be asked to set a password on first login</div>}
          <div style={{ display: "flex", gap: 10 }}><button onClick={save} style={{ ...S.btn, ...S.btnP, flex: 1, padding: 13 }}>{modal.mode === "add" ? "✅ Add" : "💾 Save"}</button><button onClick={() => setModal(null)} style={{ ...S.btn, ...S.btnG, flex: 1, padding: 13 }}>Cancel</button></div>
        </Modal>
      )}
    </div>
  );
}

function Expenses({ expenses, setExpenses, showToast, addLog }) {
  const mobile = useIsMobile();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ date: TODAY, category: "Maintenance", description: "", amount: "" });
  const cats = ["Maintenance", "Fuel", "Office Rent", "Salaries", "Insurance", "Other Expenses"];
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  function add() {
    if (!form.description || !form.amount) return showToast("Please fill in all fields", "error");
    setExpenses(p => [...p, { ...form, id: Date.now(), amount: Number(form.amount) }]);
    addLog("expense_added", `Expense: ${form.category} — ${form.description} (${form.amount} JD)`);
    setForm({ date: TODAY, category: "Maintenance", description: "", amount: "" }); setShow(false); showToast("Added successfully");
  }
  return (
    <div style={{ padding: mobile ? 16 : 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        <div><h2 style={{ color: "#f8fafc", fontWeight: 700, margin: 0, fontSize: mobile ? 18 : 20 }}>Expenses</h2><p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 12 }}>Total: <strong style={{ color: "#f87171" }}>{total} JD</strong></p></div>
        <button onClick={() => setShow(true)} style={{ ...S.btn, ...S.btnP }}>+ Add</button>
      </div>
      {show && <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 14, padding: mobile ? 16 : 22, marginBottom: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr 1fr 1fr", gap: "0 12px" }}>
          <Field label="Date" value={form.date} onChange={v => setF("date", v)} type="date" /><Field label="Category" value={form.category} onChange={v => setF("category", v)} options={cats} /><Field label="Description" value={form.description} onChange={v => setF("description", v)} placeholder="Description" /><Field label="Amount" value={form.amount} onChange={v => setF("amount", v)} type="number" placeholder="0" />
        </div>
        <div style={{ display: "flex", gap: 8 }}><button onClick={add} style={{ ...S.btn, background: "#d97706", color: "#fff" }}>Save</button><button onClick={() => setShow(false)} style={{ ...S.btn, ...S.btnG }}>Cancel</button></div>
      </div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...expenses].sort((a, b) => b.date.localeCompare(a.date)).map(e => (
          <div key={e.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, border: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div><span style={{ background: "rgba(248,113,113,0.12)", color: "#f87171", fontSize: 11, padding: "2px 8px", borderRadius: 20, marginLeft: 8 }}>{e.category}</span><span style={{ color: "#e2e8f0", fontSize: 13 }}>{e.description}</span><span style={{ color: "#64748b", fontSize: 11 }}> · {e.date}</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><strong style={{ color: "#f87171" }}>{e.amount} JD</strong><button onClick={() => { setExpenses(p => p.filter(x => x.id !== e.id)); addLog("expense_deleted", `Deleted: ${e.description}`); showToast("Deleted"); }} style={{ ...S.btn, background: "rgba(220,38,38,0.08)", color: "#f87171", padding: "4px 8px", fontSize: 11 }}>Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Reports({ drivers, payments, expenses }) {
  const mobile = useIsMobile();
  const ap = payments.filter(p => p.approved === "approved");
  const tc = ap.reduce((s, p) => s + p.totalPaid, 0), te = ap.reduce((s, p) => s + p.expected, 0), tx = expenses.reduce((s, e) => s + e.amount, 0);
  const rate = te > 0 ? Math.round((tc / te) * 100) : 0;
  const ds = drivers.map(d => { const dp = ap.filter(p => p.driverId === d.id); const c = dp.reduce((s, p) => s + p.totalPaid, 0), e = dp.reduce((s, p) => s + p.expected, 0); return { ...d, c, e, diff: c - e, days: dp.length }; });
  return (
    <div style={{ padding: mobile ? 16 : 32 }}>
      <h2 style={{ color: "#f8fafc", fontWeight: 700, marginBottom: 6, fontSize: mobile ? 18 : 20 }}>Financial Reports</h2>
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 16 }}>* Approved payments only</p>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)", gap: mobile ? 10 : 14, marginBottom: 24 }}>
        {[{ label: "Collected", val: tc + " JD", c: "#059669" }, { label: "Expenses", val: tx + " JD", c: "#dc2626" }, { label: "Profit", val: (tc - tx) + " JD", c: "#7c3aed" }, { label: "Collection Rate", val: rate + "%", c: "#d97706" }].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${s.c}25`, borderRadius: 12, padding: mobile ? 14 : 18, textAlign: "center" }}><div style={{ color: s.c, fontSize: mobile ? 18 : 22, fontWeight: 700 }}>{s.val}</div><div style={{ color: "#64748b", fontSize: 11, marginTop: 3 }}>{s.label}</div></div>
        ))}
      </div>
      <h3 style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: 12 }}>Driver Performance</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {ds.map(d => { const r = d.e > 0 ? Math.round((d.c / d.e) * 100) : 0; const rc = r >= 100 ? "#059669" : r >= 80 ? "#d97706" : "#dc2626"; return (
          <div key={d.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#e2e8f0", fontWeight: 700 }}>{d.name}</span><FreqBadge freq={d.frequency} /></div><span style={{ color: rc, fontWeight: 700 }}>{r}%</span></div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, marginBottom: 10 }}><div style={{ width: `${Math.min(r, 100)}%`, height: "100%", background: rc, borderRadius: 3 }} /></div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, flexWrap: "wrap" }}><span style={{ color: "#64748b" }}>Days: <strong style={{ color: "#e2e8f0" }}>{d.days}</strong></span><span style={{ color: "#64748b" }}>Expected: <strong style={{ color: "#e2e8f0" }}>{d.e} JD</strong></span><span style={{ color: "#64748b" }}>Collected: <strong style={{ color: "#e2e8f0" }}>{d.c} JD</strong></span><span style={{ color: "#64748b" }}>Difference: <strong style={{ color: d.diff < 0 ? "#dc2626" : "#059669" }}>{fmtDiff(d.diff)}</strong></span></div>
          </div>
        ); })}
      </div>
    </div>
  );
}

function AuditLogs({ logs }) {
  const mobile = useIsMobile();
  const [search, setSearch] = useState(""); const [typeF, setTypeF] = useState("all");
  const types = [...new Set(logs.map(l => l.action))];
  let filtered = logs;
  if (typeF !== "all") filtered = filtered.filter(l => l.action === typeF);
  if (search) filtered = filtered.filter(l => l.details.includes(search) || l.userName.includes(search));
  const aLabel = (a) => ({ login: "🔑 Login", logout: "🚪 Logout", payment_submitted: "💰 Payment", payment_approved: "✅ Approved", payment_rejected: "❌ Rejected", driver_added: "👤 Added", driver_edited: "✏️ Edit", driver_toggled: "🔄 Status", password_reset: "🔐 Reset", password_set: "🔑 Set", expense_added: "📋 Expense", expense_deleted: "🗑 Deleted", gdrive_backup: "☁️ Backup" }[a] || a);
  return (
    <div style={{ padding: mobile ? 16 : 32 }}>
      <h2 style={{ color: "#f8fafc", fontWeight: 700, marginBottom: 4, fontSize: mobile ? 18 : 20 }}>Audit Log</h2>
      <p style={{ color: "#64748b", margin: "0 0 16px", fontSize: 12 }}>{logs.length} operations — for auditing and review</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...S.input, maxWidth: 250 }} />
        <select value={typeF} onChange={e => setTypeF(e.target.value)} style={{ ...S.input, maxWidth: 200, background: "#1a2332" }}><option value="all">All Types</option>{types.map(t => <option key={t} value={t}>{aLabel(t)}</option>)}</select>
      </div>
      {filtered.length === 0 && <div style={{ color: "#475569", textAlign: "center", padding: 40 }}>No records{search || typeF !== "all" ? " match" : " yet"}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {filtered.map(l => (
          <div key={l.id} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: mobile ? "flex-start" : "center", flexDirection: mobile ? "column" : "row", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace" }}>{l.timestamp.replace("T", " ").substring(0, 19)}</span>
              <span style={{ background: "rgba(217,119,6,0.1)", color: "#d97706", fontSize: 10, padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>{aLabel(l.action)}</span>
              <span style={{ color: "#7c9fdb", fontSize: 11, fontWeight: 600 }}>{l.userName}</span>
            </div>
            <span style={{ color: "#94a3b8", fontSize: 12 }}>{l.details}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DriverShell({ user, drivers, setDrivers, payments, setPayments, addLog, logout, showToast }) {
  const driver = drivers.find(d => d.id === user.driverId);
  const [tab, setTab] = useState("submit");
  const emptyEntry = () => ({ id: "e" + Date.now() + Math.random(), amount: "", method: "Cash", receiptNumber: "", receiptImage: null });
  const [date, setDate] = useState(TODAY); const [entries, setEntries] = useState([emptyEntry()]);
  const mine = payments.filter(p => p.driverId === user.driverId).sort((a, b) => b.date.localeCompare(a.date));
  const aMine = mine.filter(p => p.approved === "approved");
  const totalPaid = aMine.reduce((s, p) => s + p.totalPaid, 0), totalExp = aMine.reduce((s, p) => s + p.expected, 0);
  const balance = totalPaid - totalExp;
  const expected = driver ? getExpected(driver, date) : 0;
  const paidToday = mine.find(p => p.date === date);

  function updateEntry(id, key, value) { setEntries(prev => prev.map(e => e.id === id ? { ...e, [key]: value } : e)); }
  function handleFile(entryId, file) { if (!file) return; const r = new FileReader(); r.onload = (ev) => updateEntry(entryId, "receiptImage", ev.target.result); r.readAsDataURL(file); }

  function submit() {
    const valid = entries.filter(e => e.amount && Number(e.amount) > 0);
    if (valid.length === 0) return showToast("Please enter an amount", "error");
    for (const e of valid) { if (!e.receiptNumber.trim()) return showToast(`Please enter ${methodIsOnline(e.method) ? "transaction number" : "receipt number"}`, "error"); }
    if (paidToday) return showToast("A payment was already recorded for today", "error");
    const tp = valid.reduce((s, e) => s + Number(e.amount), 0), diff = tp - expected;
    const st = expected === 0 ? "over" : diff === 0 ? "full" : diff > 0 ? "over" : "partial";
    setPayments(p => [...p, { id: Date.now(), driverId: driver.id, driverName: driver.name, car: driver.car, date, expected, entries: valid.map(e => ({ id: e.id, amount: Number(e.amount), method: e.method, receiptNumber: e.receiptNumber.trim(), receiptImage: e.receiptImage })), totalPaid: tp, diff, status: st, approved: null, adminNote: "", submittedAt: NOW() }]);
    addLog("payment_submitted", `Payment ${tp} JD (${valid.length} entry) — ${date}`);
    if (driver.gdriveBackup) { addLog("gdrive_backup", `Backup — ${date}`); showToast("✅ Done + backed up"); } else showToast("✅ Done — awaiting approval");
    setEntries([emptyEntry()]); setTab("history");
  }

  function toggleGDrive() {
    const nv = !driver.gdriveBackup; setDrivers(p => p.map(d => d.id === driver.id ? { ...d, gdriveBackup: nv } : d));
    addLog("gdrive_backup", nv ? "Google Drive enabled" : "Google Drive disabled"); showToast(nv ? "Enabled ☁️" : "Disabled");
  }

  if (!driver) return <div style={{ padding: 40, color: "#f87171" }}>Driver not found</div>;
  const totalEntered = entries.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 520, margin: "0 auto" }}>
      <div style={{ background: "rgba(217,119,6,0.08)", borderBottom: "1px solid rgba(217,119,6,0.15)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><div style={{ color: "#d97706", fontWeight: 700, fontSize: 15 }}>Hello, {driver.name}</div><div style={{ color: "#64748b", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>🚗 {driver.car} · <FreqBadge freq={driver.frequency} /></div></div>
        <button onClick={logout} style={{ ...S.btn, background: "rgba(220,38,38,0.08)", color: "#f87171", padding: "6px 12px", fontSize: 12 }}>Logout</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "12px 14px 0" }}>
        {[{ val: totalPaid + " JD", label: "Paid", c: "#059669" }, { val: expected + " JD", label: isFriday(date) && driver.frequency === "daily" ? "Holiday" : `Required (${freqLabel(driver.frequency)})`, c: "#d97706" }, { val: fmtDiff(balance), label: "Balance", c: balance < 0 ? "#dc2626" : "#059669" }].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.035)", borderRadius: 10, padding: 10, textAlign: "center" }}><div style={{ color: s.c, fontWeight: 700, fontSize: 15 }}>{s.val}</div><div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>{s.label}</div></div>
        ))}
      </div>
      <div style={{ display: "flex", padding: "10px 14px 0" }}>
        {[{ id: "submit", label: "Submit Payment" }, { id: "history", label: "History" }, { id: "settings", label: "Settings" }].map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: 10, border: "none", borderBottom: tab === t.id ? "2px solid #d97706" : "2px solid transparent", background: "transparent", color: tab === t.id ? "#d97706" : "#64748b", fontFamily: ff, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t.label}</button>)}
      </div>
      <div style={{ flex: 1, padding: 14 }}>
        {tab === "submit" && (
          <div style={{ ...S.card, border: "1px solid rgba(255,255,255,0.06)" }}>
            {paidToday && <div style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 10, padding: 10, marginBottom: 12, color: "#d97706", fontSize: 12 }}>⚠️ Payment already recorded ({paidToday.totalPaid} JD) — {paidToday.approved === "approved" ? "✅" : paidToday.approved === "rejected" ? "❌" : "⏳"}</div>}
            {isFriday(date) && driver.frequency === "daily" && <div style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 10, padding: 10, marginBottom: 12, color: "#0ea5e9", fontSize: 12 }}>🕌 Friday Holiday</div>}
            <div style={{ marginBottom: 14 }}><label style={S.label}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={S.input} /></div>
            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Payments (add multiple)</div>
            {entries.map((entry, idx) => (
              <div key={entry.id} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>Payment {idx + 1}</span>
                  {entries.length > 1 && <button onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))} style={{ ...S.btn, background: "rgba(220,38,38,0.08)", color: "#f87171", padding: "3px 8px", fontSize: 11 }}>✕</button>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div><label style={S.label}>Amount (JD)</label><input type="number" value={entry.amount} onChange={e => updateEntry(entry.id, "amount", e.target.value)} placeholder="0" style={S.input} /></div>
                  <div><label style={S.label}>Method</label><select value={entry.method} onChange={e => updateEntry(entry.id, "method", e.target.value)} style={{ ...S.input, background: "#1a2332" }}>{["Cash", "CliQ", "Zain Cash", "Bank Transfer"].map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                </div>
                <div style={{ marginBottom: 10 }}><label style={S.label}>{methodIsOnline(entry.method) ? "Transaction No. *" : "Receipt No. *"}</label><input value={entry.receiptNumber} onChange={e => updateEntry(entry.id, "receiptNumber", e.target.value)} placeholder={methodIsOnline(entry.method) ? "TXN-XXXX" : "RC-XXXX"} style={S.input} /></div>
                <div>
                  <label style={S.label}>{methodIsOnline(entry.method) ? "📎 Screenshot" : "📎 Receipt Image"}</label>
                  <label style={{ display: "block", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 10, padding: 14, textAlign: "center", cursor: "pointer", color: "#64748b", fontSize: 12 }}>
                    {entry.receiptImage ? "✅ Uploaded — click to change" : "Click to upload"}
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(entry.id, e.target.files[0])} />
                  </label>
                  {entry.receiptImage && <img src={entry.receiptImage} alt="" style={{ marginTop: 8, maxWidth: "100%", maxHeight: 120, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }} />}
                </div>
              </div>
            ))}
            <button onClick={() => setEntries(prev => [...prev, emptyEntry()])} style={{ ...S.btn, width: "100%", background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.12)", color: "#94a3b8", marginBottom: 14, fontSize: 13 }}>+ Add Another Payment</button>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: "#64748b", fontSize: 13 }}>Total:</span><span style={{ color: totalEntered >= expected ? "#059669" : "#d97706", fontWeight: 700, fontSize: 18 }}>{totalEntered} JD</span></div>
            <button onClick={submit} disabled={!!paidToday} style={{ ...S.btn, ...S.btnP, width: "100%", padding: 14, fontSize: 15, opacity: paidToday ? 0.5 : 1 }}>✅ Submit Payment</button>
          </div>
        )}
        {tab === "history" && (
          <div>
            {mine.length === 0 && <div style={{ color: "#475569", textAlign: "center", padding: 40 }}>No records found</div>}
            {mine.map(p => (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${statusColor(p.status)}25`, borderRadius: 12, padding: 14, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ color: "#64748b", fontSize: 12 }}>{p.date}</span>
                  <div style={{ display: "flex", gap: 4 }}><Badge status={p.status} />{p.approved === "approved" && <span style={{ background: "#05966920", color: "#059669", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>✅</span>}{p.approved === "rejected" && <span style={{ background: "#dc262620", color: "#dc2626", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>❌</span>}{(!p.approved || p.approved === "pending") && <span style={{ background: "#8b5cf620", color: "#8b5cf6", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>⏳</span>}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "#64748b" }}>Paid: <strong style={{ color: "#e2e8f0" }}>{p.totalPaid} JD</strong></span><span style={{ color: "#64748b" }}>Required: <strong style={{ color: "#e2e8f0" }}>{p.expected} JD</strong></span><span style={{ color: "#64748b" }}>Difference: <strong style={{ color: statusColor(p.status) }}>{fmtDiff(p.diff)}</strong></span></div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{p.entries.map((e, i) => <span key={e.id}>{e.amount} JD {e.method} (#{e.receiptNumber}){e.receiptImage ? " 📎" : ""}{i < p.entries.length - 1 ? " · " : ""}</span>)}</div>
                {p.adminNote && <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 4, background: "rgba(255,255,255,0.02)", padding: 6, borderRadius: 6 }}>📝 {p.adminNote}</div>}
              </div>
            ))}
          </div>
        )}
        {tab === "settings" && (
          <div>
            <h3 style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Settings</h3>
            <div style={{ ...S.card, border: "1px solid rgba(255,255,255,0.06)", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>☁️ Google Drive</div><div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>Auto-backup receipts and records</div></div>
                <button onClick={toggleGDrive} style={{ ...S.btn, minWidth: 64, background: driver.gdriveBackup ? "#059669" : "rgba(255,255,255,0.08)", color: driver.gdriveBackup ? "#fff" : "#64748b", fontSize: 13, padding: "8px 16px" }}>{driver.gdriveBackup ? "Enabled" : "Disabled"}</button>
              </div>
              {driver.gdriveBackup && <div style={{ marginTop: 12, background: "rgba(5,150,105,0.08)", borderRadius: 10, padding: 12, fontSize: 12, color: "#059669" }}>✅ Enabled — "Rubu Al-Urdon — My Records" folder in Drive</div>}
            </div>
            <div style={{ ...S.card, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Account Info</div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 2.2 }}>
                👤 {driver.username}<br />📧 {driver.email}<br />🚗 {driver.car}<br />
                📅 <span style={{ color: freqColor(driver.frequency) }}>{freqLabel(driver.frequency)}</span><br />
                💰 <span style={{ color: "#d97706" }}>{driver.frequency === "daily" ? driver.dailyRate + " JD/day" : driver.frequency === "weekly" ? Math.round(driver.dailyRate * 6 * 0.95) + " JD/week" : Math.round(driver.dailyRate * 26 * 0.90) + " JD/month"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
