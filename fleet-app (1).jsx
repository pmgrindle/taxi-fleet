import { useState, useEffect } from "react";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap";

const INIT_DRIVERS = [
  { id: 1, name: "عبد الحكيم", car: "37963", dailyRequired: 28, active: true, balance: -4,  phone: "0791000001", username: "abdulhakeem", password: "1234" },
  { id: 2, name: "أنور",        car: "45821", dailyRequired: 32, active: true, balance: 0,   phone: "0791000002", username: "anwar",        password: "1234" },
  { id: 3, name: "بدر مساعدة",  car: "62104", dailyRequired: 28, active: true, balance: 8,   phone: "0791000003", username: "badr",          password: "1234" },
  { id: 4, name: "سامي الخالد", car: "71345", dailyRequired: 35, active: true, balance: -12, phone: "0791000004", username: "sami",          password: "1234" },
  { id: 5, name: "محمود النور",  car: "88901", dailyRequired: 30, active: true, balance: 0,   phone: "0791000005", username: "mahmoud",       password: "1234" },
];

const INIT_PAYMENTS = [
  { id: 1, driverId: 1, driverName: "عبد الحكيم", car: "37963", date: "2026-03-07", expected: 28, paid: 24, diff: -4,  method: "كاش",        note: "دفع جزء", status: "partial" },
  { id: 2, driverId: 2, driverName: "أنور",        car: "45821", date: "2026-03-07", expected: 32, paid: 32, diff: 0,   method: "CliQ",        note: "",        status: "full"    },
  { id: 3, driverId: 3, driverName: "بدر مساعدة",  car: "62104", date: "2026-03-07", expected: 28, paid: 36, diff: 8,   method: "زين كاش",    note: "زيادة",   status: "over"    },
  { id: 4, driverId: 4, driverName: "سامي الخالد", car: "71345", date: "2026-03-07", expected: 35, paid: 0,  diff: -35, method: "",            note: "",        status: "unpaid"  },
  { id: 5, driverId: 5, driverName: "محمود النور",  car: "88901", date: "2026-03-07", expected: 30, paid: 30, diff: 0,   method: "تحويل بنكي", note: "",        status: "full"    },
  { id: 6, driverId: 1, driverName: "عبد الحكيم",  car: "37963", date: "2026-03-06", expected: 28, paid: 28, diff: 0,   method: "كاش",        note: "",        status: "full"    },
  { id: 7, driverId: 2, driverName: "أنور",         car: "45821", date: "2026-03-06", expected: 32, paid: 28, diff: -4,  method: "CliQ",        note: "",        status: "partial" },
];

const INIT_EXPENSES = [
  { id: 1, date: "2026-03-07", category: "صيانة",      description: "تغيير زيت - سيارة 37963", amount: 15  },
  { id: 2, date: "2026-03-06", category: "إيجار مكتب", description: "إيجار شهري",              amount: 200 },
  { id: 3, date: "2026-03-05", category: "وقود",       description: "بنزين احتياطي",           amount: 25  },
];

const TODAY = "2026-03-11";

const statusColor = (s) => ({ full: "#22c55e", partial: "#f59e0b", over: "#3b82f6", unpaid: "#ef4444" }[s] || "#ef4444");
const statusLabel = (s) => ({ full: "مدفوع", partial: "جزئي", over: "زيادة", unpaid: "غير مدفوع" }[s] || "غير مدفوع");
const fmtDiff = (n) => (n >= 0 ? "+" : "") + n + " JD";

const S = {
  input: { width: "100%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "Cairo, sans-serif" },
  card: { background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 20 },
  label: { color: "#94a3b8", fontSize: 13, marginBottom: 6, display: "block" },
};

function Field({ label, value, onChange, type = "text", placeholder = "", span = 1, options = null }) {
  return (
    <div style={{ marginBottom: 14, gridColumn: span === 2 ? "1 / -1" : undefined }}>
      {label && <label style={S.label}>{label}</label>}
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ ...S.input, background: "#1e293b" }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={S.input} />
      )}
    </div>
  );
}

function Badge({ status }) {
  const c = statusColor(status);
  return <span style={{ background: c + "25", color: c, fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>{statusLabel(status)}</span>;
}

function Toast({ msg, type }) {
  return (
    <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", background: type === "error" ? "#ef4444" : "#22c55e", color: "#fff", padding: "12px 32px", borderRadius: 12, zIndex: 9999, fontWeight: 700, fontSize: 15, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", whiteSpace: "nowrap", pointerEvents: "none" }}>
      {msg}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [drivers,  setDrivers]  = useState(INIT_DRIVERS);
  const [payments, setPayments] = useState(INIT_PAYMENTS);
  const [expenses, setExpenses] = useState(INIT_EXPENSES);
  const [user,     setUser]     = useState(null);
  const [page,     setPage]     = useState("dashboard");
  const [toast,    setToast]    = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = FONT_URL;
    document.head.appendChild(link);
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function doLogin(username, password) {
    if (username === "admin" && password === "admin123") {
      setUser({ role: "admin", name: "المدير" }); return true;
    }
    const d = drivers.find(d => d.username === username && d.password === password && d.active);
    if (d) { setUser({ role: "driver", driverId: d.id, name: d.name }); return true; }
    return false;
  }

  const root = { minHeight: "100vh", background: "#0f172a", fontFamily: "Cairo, sans-serif", direction: "rtl", color: "#f1f5f9" };

  return (
    <div style={root}>
      {toast && <Toast {...toast} />}
      {!user
        ? <LoginPage onLogin={doLogin} drivers={drivers} />
        : user.role === "admin"
          ? <AdminShell user={user} page={page} setPage={setPage} drivers={drivers} setDrivers={setDrivers} payments={payments} setPayments={setPayments} expenses={expenses} setExpenses={setExpenses} logout={() => { setUser(null); setPage("dashboard"); }} showToast={showToast} />
          : <DriverShell user={user} drivers={drivers} payments={payments} setPayments={setPayments} logout={() => setUser(null)} showToast={showToast} />
      }
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, drivers }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [show, setShow] = useState(false);
  function go() { if (!onLogin(u.trim(), p)) setErr("اسم المستخدم أو كلمة المرور غير صحيحة"); }
  const active = drivers.filter(d => d.active);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0f172a,#1e293b,#0f172a)" }}>
      <div style={{ width: 400, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 52 }}>🚖</div>
          <h2 style={{ color: "#f8fafc", margin: "8px 0 4px", fontWeight: 900 }}>ربوع الأردن</h2>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>نظام إدارة تحصيل السائقين</p>
        </div>
        <Field label="اسم المستخدم" value={u} onChange={setU} placeholder="admin أو اسم المستخدم" />
        <div style={{ marginBottom: 20 }}>
          <label style={S.label}>كلمة المرور</label>
          <div style={{ position: "relative" }}>
            <input type={show ? "text" : "password"} value={p} onChange={e => setP(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} placeholder="••••••••"
              style={{ ...S.input, paddingLeft: 44 }} />
            <button onClick={() => setShow(!show)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16 }}>{show ? "🙈" : "👁"}</button>
          </div>
        </div>
        {err && <p style={{ color: "#f87171", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{err}</p>}
        <button onClick={go} style={{ width: "100%", background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: 12, padding: 14, color: "#1c1917", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "Cairo, sans-serif" }}>
          تسجيل الدخول
        </button>
        <div style={{ marginTop: 20, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14, fontSize: 12, color: "#64748b", lineHeight: 2.1 }}>
          <strong style={{ color: "#94a3b8" }}>بيانات الدخول:</strong><br />
          🔑 <code style={{ color: "#f59e0b" }}>admin</code> / <code style={{ color: "#f59e0b" }}>admin123</code><br />
          {active.slice(0, 4).map(d => (
            <span key={d.id}>🚗 {d.name}: <code style={{ color: "#a78bfa" }}>{d.username}</code> / <code style={{ color: "#a78bfa" }}>{d.password}</code><br /></span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ADMIN SHELL ───────────────────────────────────────────────────────────────
function AdminShell(props) {
  const { page, setPage, logout } = props;
  const nav = [
    { id: "dashboard", icon: "📊", label: "الرئيسية" },
    { id: "payments",  icon: "💰", label: "المدفوعات" },
    { id: "drivers",   icon: "👤", label: "السائقون" },
    { id: "expenses",  icon: "📋", label: "المصاريف" },
    { id: "reports",   icon: "📈", label: "التقارير" },
  ];
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: 210, background: "rgba(255,255,255,0.03)", borderLeft: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px 20px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: 28 }}>🚖</div>
          <div style={{ color: "#f59e0b", fontWeight: 900, fontSize: 15 }}>ربوع الأردن</div>
          <div style={{ color: "#475569", fontSize: 12 }}>لوحة المدير</div>
        </div>
        <nav style={{ flex: 1, paddingTop: 12 }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", background: page === n.id ? "rgba(245,158,11,0.15)" : "transparent", border: "none", borderRight: page === n.id ? "3px solid #f59e0b" : "3px solid transparent", color: page === n.id ? "#f59e0b" : "#94a3b8", cursor: "pointer", fontSize: 14, fontFamily: "Cairo, sans-serif", fontWeight: 600 }}>
              {n.icon} {n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px" }}>
          <button onClick={logout} style={{ width: "100%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: 10, color: "#f87171", cursor: "pointer", fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 13 }}>🚪 خروج</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {page === "dashboard" && <Dashboard {...props} />}
        {page === "payments"  && <Payments  {...props} />}
        {page === "drivers"   && <Drivers   {...props} />}
        {page === "expenses"  && <Expenses  {...props} />}
        {page === "reports"   && <Reports   {...props} />}
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ drivers, payments, expenses }) {
  const tp = payments.filter(p => p.date === TODAY);
  const totExp  = drivers.filter(d => d.active).reduce((s, d) => s + d.dailyRequired, 0);
  const totColl = tp.reduce((s, p) => s + p.paid, 0);
  const shortage = tp.reduce((s, p) => s + Math.min(0, p.diff), 0);
  const expToday = expenses.filter(e => e.date === TODAY).reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: "#f8fafc", fontWeight: 900, margin: "0 0 4px" }}>لوحة التحكم</h2>
      <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: 13 }}>اليوم: {TODAY}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "المتوقع اليوم",    val: totExp + " JD",              icon: "🎯", c: "#3b82f6" },
          { label: "المحصّل اليوم",    val: totColl + " JD",             icon: "✅", c: "#22c55e" },
          { label: "العجز",             val: Math.abs(shortage) + " JD",  icon: "⚠️", c: "#f59e0b" },
          { label: "صافي اليوم",        val: (totColl - expToday) + " JD",icon: "💎", c: "#a78bfa" },
        ].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${s.c}30`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ color: s.c, fontSize: 20, fontWeight: 900 }}>{s.val}</div>
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <h3 style={{ color: "#f1f5f9", fontWeight: 700, marginBottom: 14, fontSize: 16 }}>حالة السائقين اليوم</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 12 }}>
        {drivers.map(d => {
          const p = tp.find(p => p.driverId === d.id);
          const st = p ? p.status : "unpaid";
          return (
            <div key={d.id} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${statusColor(st)}35`, borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{d.name}</span>
                <Badge status={st} />
              </div>
              <div style={{ color: "#64748b", fontSize: 12 }}>🚗 {d.car}</div>
              {p
                ? <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>دفع <strong style={{ color: statusColor(st) }}>{p.paid}</strong> من {p.expected} JD</div>
                : <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>لم يدفع بعد</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PAYMENTS ──────────────────────────────────────────────────────────────────
function Payments({ payments, setPayments, showToast }) {
  const [filter, setFilter] = useState("all");
  const [dateF,  setDateF]  = useState("");
  let list = [...payments];
  if (filter !== "all") list = list.filter(p => p.status === filter);
  if (dateF) list = list.filter(p => p.date === dateF);
  list.sort((a, b) => b.date.localeCompare(a.date));
  const thStyle = { padding: "12px 14px", textAlign: "right", color: "#64748b", fontSize: 12, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.07)" };
  const tdStyle = { padding: "11px 14px", fontSize: 13 };
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: "#f8fafc", fontWeight: 900, marginBottom: 20 }}>سجل المدفوعات</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        {["all", "full", "partial", "over", "unpaid"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontFamily: "Cairo, sans-serif", fontWeight: 600, fontSize: 12, background: filter === f ? "#f59e0b" : "rgba(255,255,255,0.07)", color: filter === f ? "#1c1917" : "#94a3b8" }}>
            {f === "all" ? "الكل" : statusLabel(f)}
          </button>
        ))}
        <input type="date" value={dateF} onChange={e => setDateF(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.07)", color: "#f1f5f9", fontSize: 12, outline: "none" }} />
      </div>
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "rgba(255,255,255,0.05)" }}>
            {["التاريخ", "السائق", "السيارة", "المتوقع", "المدفوع", "الفرق", "الطريقة", "الحالة", ""].map((h, i) => <th key={i} style={thStyle}>{h}</th>)}
          </tr></thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ ...tdStyle, color: "#64748b" }}>{p.date}</td>
                <td style={{ ...tdStyle, color: "#f1f5f9", fontWeight: 600 }}>{p.driverName}</td>
                <td style={{ ...tdStyle, color: "#64748b" }}>{p.car}</td>
                <td style={{ ...tdStyle, color: "#f1f5f9" }}>{p.expected} JD</td>
                <td style={{ ...tdStyle, color: "#f1f5f9", fontWeight: 700 }}>{p.paid} JD</td>
                <td style={{ ...tdStyle, color: p.diff < 0 ? "#ef4444" : p.diff > 0 ? "#3b82f6" : "#22c55e", fontWeight: 700 }}>{fmtDiff(p.diff)}</td>
                <td style={{ ...tdStyle, color: "#64748b" }}>{p.method || "—"}</td>
                <td style={tdStyle}><Badge status={p.status} /></td>
                <td style={tdStyle}>
                  <button onClick={() => { setPayments(v => v.filter(x => x.id !== p.id)); showToast("تم الحذف"); }}
                    style={{ background: "rgba(239,68,68,0.1)", border: "none", color: "#f87171", cursor: "pointer", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontFamily: "Cairo, sans-serif" }}>حذف</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={9} style={{ padding: 36, textAlign: "center", color: "#475569" }}>لا توجد سجلات</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── DRIVERS ───────────────────────────────────────────────────────────────────
function Drivers({ drivers, setDrivers, payments, showToast }) {
  const EMPTY = { name: "", car: "", dailyRequired: 28, phone: "", username: "", password: "1234", active: true };
  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState(EMPTY);
  const [showPw, setShowPw] = useState({});
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function validate() {
    if (!form.name.trim())     return "يرجى إدخال اسم السائق";
    if (!form.car.trim())      return "يرجى إدخال رقم السيارة";
    if (!form.username.trim()) return "يرجى إدخال اسم المستخدم";
    if (!form.password.trim()) return "يرجى إدخال كلمة المرور";
    const dup = drivers.find(d => d.username === form.username.trim() && d.id !== modal?.id);
    if (dup) return "اسم المستخدم مستخدم مسبقاً";
    return null;
  }

  function save() {
    const err = validate(); if (err) return showToast(err, "error");
    if (modal.mode === "add") {
      setDrivers(p => [...p, { ...form, id: Date.now(), balance: 0, dailyRequired: Number(form.dailyRequired) }]);
      showToast("تم إضافة السائق ✅");
    } else {
      setDrivers(p => p.map(d => d.id === modal.id ? { ...d, ...form, dailyRequired: Number(form.dailyRequired) } : d));
      showToast("تم تحديث البيانات ✅");
    }
    setModal(null);
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: "#f8fafc", fontWeight: 900, margin: 0 }}>إدارة السائقين</h2>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 13 }}>{drivers.length} سائق — {drivers.filter(d => d.active).length} نشط</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal({ mode: "add" }); }}
          style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: 12, padding: "10px 22px", color: "#1c1917", fontWeight: 900, fontSize: 14, cursor: "pointer", fontFamily: "Cairo, sans-serif" }}>
          + إضافة سائق
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
        {drivers.map(d => (
          <div key={d.id} style={{ ...S.card, border: `1px solid ${d.active ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.07)"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ color: "#f8fafc", fontWeight: 800, fontSize: 16 }}>{d.name}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>🚗 {d.car} {d.phone ? "· 📱 " + d.phone : ""}</div>
              </div>
              <span style={{ background: d.active ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: d.active ? "#22c55e" : "#ef4444", fontSize: 11, padding: "4px 10px", borderRadius: 20, fontWeight: 700, height: "fit-content" }}>
                {d.active ? "نشط" : "موقوف"}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px" }}>
                <div style={{ color: "#64748b", fontSize: 11 }}>المبلغ اليومي</div>
                <div style={{ color: "#f59e0b", fontWeight: 700 }}>{d.dailyRequired} JD</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px" }}>
                <div style={{ color: "#64748b", fontSize: 11 }}>الرصيد</div>
                <div style={{ color: d.balance < 0 ? "#ef4444" : d.balance > 0 ? "#3b82f6" : "#22c55e", fontWeight: 700 }}>{fmtDiff(d.balance)}</div>
              </div>
            </div>
            <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 5, fontWeight: 700 }}>🔐 بيانات الدخول</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#a78bfa", fontSize: 13 }}>👤 {d.username}</span>
                <span style={{ color: "#a78bfa", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                  🔑 {showPw[d.id] ? d.password : "••••"}
                  <button onClick={() => setShowPw(p => ({ ...p, [d.id]: !p[d.id] }))} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14 }}>
                    {showPw[d.id] ? "🙈" : "👁"}
                  </button>
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setForm({ ...d }); setModal({ mode: "edit", id: d.id }); }}
                style={{ flex: 1, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: 8, color: "#f59e0b", cursor: "pointer", fontSize: 13, fontFamily: "Cairo, sans-serif", fontWeight: 600 }}>✏️ تعديل</button>
              <button onClick={() => setDrivers(p => p.map(x => x.id === d.id ? { ...x, active: !x.active } : x))}
                style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 10, padding: 8, color: "#94a3b8", cursor: "pointer", fontSize: 13, fontFamily: "Cairo, sans-serif" }}>
                {d.active ? "⏸ إيقاف" : "▶ تفعيل"}
              </button>
              <button onClick={() => { if (payments.some(p => p.driverId === d.id)) return showToast("لا يمكن حذف سائق لديه سجلات", "error"); setDrivers(p => p.filter(x => x.id !== d.id)); showToast("تم الحذف"); }}
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "8px 12px", color: "#f87171", cursor: "pointer", fontSize: 15 }}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h3 style={{ color: "#f59e0b", margin: 0, fontSize: 17, fontWeight: 900 }}>{modal.mode === "add" ? "➕ إضافة سائق" : "✏️ تعديل السائق"}</h3>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Field label="اسم السائق *" value={form.name} onChange={v => setF("name", v)} placeholder="الاسم الكامل" span={2} />
              <Field label="رقم السيارة *" value={form.car} onChange={v => setF("car", v)} placeholder="37963" />
              <Field label="المبلغ اليومي (JD)" value={form.dailyRequired} onChange={v => setF("dailyRequired", v)} type="number" placeholder="28" />
              <Field label="رقم الهاتف" value={form.phone} onChange={v => setF("phone", v)} placeholder="07xxxxxxxx" span={2} />
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "16px 0", paddingTop: 16 }}>
              <p style={{ color: "#a78bfa", fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>🔐 بيانات تسجيل الدخول</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <Field label="اسم المستخدم *" value={form.username} onChange={v => setF("username", v.toLowerCase().replace(/\s/g, ""))} placeholder="ahmad2026" />
                <Field label="كلمة المرور *" value={form.password} onChange={v => setF("password", v)} placeholder="كلمة مرور" />
              </div>
              <p style={{ background: "rgba(167,139,250,0.08)", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
                💡 يستخدم السائق هذه البيانات لتسجيل دخوله وتسجيل دفعاته اليومية
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={save} style={{ flex: 1, background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: 12, padding: 13, color: "#1c1917", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "Cairo, sans-serif" }}>
                {modal.mode === "add" ? "✅ إضافة" : "💾 حفظ"}
              </button>
              <button onClick={() => setModal(null)} style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 12, padding: 13, color: "#94a3b8", fontWeight: 700, cursor: "pointer", fontFamily: "Cairo, sans-serif" }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── EXPENSES ──────────────────────────────────────────────────────────────────
function Expenses({ expenses, setExpenses, showToast }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ date: TODAY, category: "صيانة", description: "", amount: "" });
  const cats = ["صيانة", "وقود", "إيجار مكتب", "رواتب", "تأمين", "مصاريف أخرى"];
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function add() {
    if (!form.description || !form.amount) return showToast("يرجى تعبئة جميع الحقول", "error");
    setExpenses(p => [...p, { ...form, id: Date.now(), amount: Number(form.amount) }]);
    setForm({ date: TODAY, category: "صيانة", description: "", amount: "" });
    setShow(false); showToast("تم إضافة المصروف");
  }

  const thStyle = { padding: "12px 14px", textAlign: "right", color: "#64748b", fontSize: 12, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.07)" };
  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <h2 style={{ color: "#f8fafc", fontWeight: 900, margin: 0 }}>المصاريف</h2>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 13 }}>الإجمالي: <strong style={{ color: "#f87171" }}>{total} JD</strong></p>
        </div>
        <button onClick={() => setShow(true)} style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: 12, padding: "10px 22px", color: "#1c1917", fontWeight: 900, fontSize: 14, cursor: "pointer", fontFamily: "Cairo, sans-serif" }}>+ إضافة</button>
      </div>
      {show && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 14, padding: 22, marginBottom: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0 14px" }}>
            <Field label="التاريخ" value={form.date} onChange={v => setF("date", v)} type="date" />
            <Field label="الفئة" value={form.category} onChange={v => setF("category", v)} options={cats} />
            <Field label="الوصف" value={form.description} onChange={v => setF("description", v)} placeholder="وصف المصروف" />
            <Field label="المبلغ (JD)" value={form.amount} onChange={v => setF("amount", v)} type="number" placeholder="0" />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={add} style={{ background: "#f59e0b", border: "none", borderRadius: 10, padding: "9px 22px", color: "#1c1917", fontWeight: 700, cursor: "pointer", fontFamily: "Cairo, sans-serif" }}>حفظ</button>
            <button onClick={() => setShow(false)} style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 10, padding: "9px 22px", color: "#94a3b8", cursor: "pointer", fontFamily: "Cairo, sans-serif" }}>إلغاء</button>
          </div>
        </div>
      )}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "rgba(255,255,255,0.05)" }}>
            {["التاريخ", "الفئة", "الوصف", "المبلغ", ""].map((h, i) => <th key={i} style={thStyle}>{h}</th>)}
          </tr></thead>
          <tbody>
            {[...expenses].sort((a, b) => b.date.localeCompare(a.date)).map(e => (
              <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "11px 14px", color: "#64748b", fontSize: 13 }}>{e.date}</td>
                <td style={{ padding: "11px 14px" }}><span style={{ background: "rgba(248,113,113,0.15)", color: "#f87171", fontSize: 12, padding: "3px 10px", borderRadius: 20 }}>{e.category}</span></td>
                <td style={{ padding: "11px 14px", color: "#f1f5f9", fontSize: 13 }}>{e.description}</td>
                <td style={{ padding: "11px 14px", color: "#f87171", fontWeight: 700 }}>{e.amount} JD</td>
                <td style={{ padding: "11px 14px" }}>
                  <button onClick={() => { setExpenses(p => p.filter(x => x.id !== e.id)); showToast("تم الحذف"); }}
                    style={{ background: "rgba(239,68,68,0.1)", border: "none", color: "#f87171", cursor: "pointer", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontFamily: "Cairo, sans-serif" }}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── REPORTS ───────────────────────────────────────────────────────────────────
function Reports({ drivers, payments, expenses }) {
  const tc = payments.reduce((s, p) => s + p.paid, 0);
  const te = payments.reduce((s, p) => s + p.expected, 0);
  const tx = expenses.reduce((s, e) => s + e.amount, 0);
  const rate = te > 0 ? Math.round((tc / te) * 100) : 0;
  const ds = drivers.map(d => {
    const dp = payments.filter(p => p.driverId === d.id);
    const c = dp.reduce((s, p) => s + p.paid, 0), e = dp.reduce((s, p) => s + p.expected, 0);
    return { ...d, c, e, diff: c - e, days: dp.length };
  });
  const thStyle = { padding: "12px 14px", textAlign: "right", color: "#64748b", fontSize: 12, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.07)" };
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: "#f8fafc", fontWeight: 900, marginBottom: 22 }}>التقارير المالية</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "إجمالي المحصّل",  val: tc + " JD",  c: "#22c55e" },
          { label: "إجمالي المصاريف", val: tx + " JD",  c: "#f87171" },
          { label: "صافي الربح",      val: (tc-tx)+" JD",c: "#a78bfa" },
          { label: "نسبة التحصيل",    val: rate + "%",  c: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${s.c}30`, borderRadius: 14, padding: 18, textAlign: "center" }}>
            <div style={{ color: s.c, fontSize: 22, fontWeight: 900 }}>{s.val}</div>
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <h3 style={{ color: "#f1f5f9", fontWeight: 700, marginBottom: 14, fontSize: 16 }}>أداء السائقين</h3>
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "rgba(255,255,255,0.05)" }}>
            {["السائق", "السيارة", "الأيام", "المتوقع", "المحصّل", "الفرق", "الأداء"].map((h, i) => <th key={i} style={thStyle}>{h}</th>)}
          </tr></thead>
          <tbody>
            {ds.map(d => {
              const r = d.e > 0 ? Math.round((d.c / d.e) * 100) : 0;
              const rc = r >= 100 ? "#22c55e" : r >= 80 ? "#f59e0b" : "#ef4444";
              return (
                <tr key={d.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "11px 14px", color: "#f1f5f9", fontWeight: 600 }}>{d.name}</td>
                  <td style={{ padding: "11px 14px", color: "#64748b" }}>{d.car}</td>
                  <td style={{ padding: "11px 14px", color: "#64748b" }}>{d.days}</td>
                  <td style={{ padding: "11px 14px", color: "#f1f5f9" }}>{d.e} JD</td>
                  <td style={{ padding: "11px 14px", color: "#f1f5f9", fontWeight: 700 }}>{d.c} JD</td>
                  <td style={{ padding: "11px 14px", color: d.diff < 0 ? "#ef4444" : "#22c55e", fontWeight: 700 }}>{fmtDiff(d.diff)}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
                        <div style={{ width: `${Math.min(r, 100)}%`, height: "100%", background: rc, borderRadius: 3 }} />
                      </div>
                      <span style={{ color: rc, fontWeight: 700, fontSize: 12, minWidth: 36 }}>{r}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── DRIVER SHELL ──────────────────────────────────────────────────────────────
function DriverShell({ user, drivers, payments, setPayments, logout, showToast }) {
  const driver = drivers.find(d => d.id === user.driverId);
  const [tab,  setTab]  = useState("submit");
  const [form, setForm] = useState({ date: TODAY, amount: "", method: "كاش", note: "" });
  const mine = payments.filter(p => p.driverId === user.driverId).sort((a, b) => b.date.localeCompare(a.date));
  const totalPaid = mine.reduce((s, p) => s + p.paid, 0);
  const totalExp  = mine.reduce((s, p) => s + p.expected, 0);
  const balance   = totalPaid - totalExp;
  const paidToday = mine.find(p => p.date === form.date);

  function submit() {
    if (!form.amount) return showToast("يرجى إدخال المبلغ", "error");
    if (paidToday)    return showToast("سجّلت دفعة لهذا اليوم مسبقاً", "error");
    const paid = Number(form.amount), exp = driver.dailyRequired, diff = paid - exp;
    const status = diff === 0 ? "full" : diff > 0 ? "over" : "partial";
    setPayments(p => [...p, { id: Date.now(), driverId: driver.id, driverName: driver.name, car: driver.car, date: form.date, expected: exp, paid, diff, method: form.method, note: form.note, status }]);
    setForm(p => ({ ...p, amount: "", note: "" }));
    showToast("✅ تم تسجيل الدفعة");
    setTab("history");
  }

  if (!driver) return <div style={{ padding: 40, color: "#f87171" }}>السائق غير موجود</div>;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ background: "rgba(245,158,11,0.1)", borderBottom: "1px solid rgba(245,158,11,0.2)", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: "#f59e0b", fontWeight: 900, fontSize: 16 }}>مرحباً، {driver.name}</div>
          <div style={{ color: "#64748b", fontSize: 12 }}>🚗 {driver.car} · 👤 {driver.username}</div>
        </div>
        <button onClick={logout} style={{ background: "rgba(239,68,68,0.1)", border: "none", color: "#f87171", cursor: "pointer", borderRadius: 10, padding: "7px 14px", fontSize: 13, fontFamily: "Cairo, sans-serif" }}>خروج</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, padding: "14px 14px 0" }}>
        {[
          { val: totalPaid + " JD", label: "إجمالي المدفوع", c: "#22c55e" },
          { val: driver.dailyRequired + " JD", label: "المطلوب يومياً", c: "#f59e0b" },
          { val: fmtDiff(balance), label: "الرصيد", c: balance < 0 ? "#ef4444" : "#22c55e" },
        ].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 12, textAlign: "center" }}>
            <div style={{ color: s.c, fontWeight: 900, fontSize: 17 }}>{s.val}</div>
            <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", padding: "12px 14px 0" }}>
        {[{ id: "submit", label: "تسجيل دفعة" }, { id: "history", label: "السجل" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: 12, border: "none", borderBottom: tab === t.id ? "2px solid #f59e0b" : "2px solid transparent", background: "transparent", color: tab === t.id ? "#f59e0b" : "#64748b", fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, padding: 14 }}>
        {tab === "submit" && (
          <div style={{ ...S.card, border: "1px solid rgba(255,255,255,0.07)" }}>
            {paidToday && (
              <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: 12, marginBottom: 14, color: "#f59e0b", fontSize: 13 }}>
                ⚠️ سجّلت دفعة لهذا اليوم: {paidToday.paid} JD
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>التاريخ</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={S.input} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>المبلغ المدفوع (JD) — المطلوب: {driver.dailyRequired} JD</label>
              <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0" style={S.input} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={S.label}>طريقة الدفع</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["كاش", "CliQ", "زين كاش", "تحويل بنكي"].map(m => (
                  <button key={m} onClick={() => setForm(p => ({ ...p, method: m }))}
                    style={{ padding: 10, borderRadius: 10, border: form.method === m ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.1)", background: form.method === m ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)", color: form.method === m ? "#f59e0b" : "#94a3b8", cursor: "pointer", fontFamily: "Cairo, sans-serif", fontWeight: 600, fontSize: 13 }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={S.label}>ملاحظات</label>
              <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} rows={2} placeholder="أي ملاحظة إضافية..."
                style={{ ...S.input, resize: "none" }} />
            </div>
            <button onClick={submit} style={{ width: "100%", background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: 12, padding: 14, color: "#1c1917", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "Cairo, sans-serif" }}>
              ✅ تسجيل الدفعة
            </button>
          </div>
        )}
        {tab === "history" && (
          <div>
            {mine.length === 0 && <div style={{ color: "#475569", textAlign: "center", padding: 40 }}>لا توجد سجلات بعد</div>}
            {mine.map(p => (
              <div key={p.id} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${statusColor(p.status)}30`, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ color: "#64748b", fontSize: 13 }}>{p.date}</span>
                  <Badge status={p.status} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748b", fontSize: 12 }}>دفع: <strong style={{ color: "#f1f5f9" }}>{p.paid} JD</strong></span>
                  <span style={{ color: "#64748b", fontSize: 12 }}>الفرق: <strong style={{ color: statusColor(p.status) }}>{fmtDiff(p.diff)}</strong></span>
                  <span style={{ color: "#64748b", fontSize: 12 }}>{p.method}</span>
                </div>
                {p.note && <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>📝 {p.note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
