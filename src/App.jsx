import { useState } from "react";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const BLOOD_PRODUCTS = ["WB", "PC", "PRP", "FFP", "PLT", "CRYO"];
const PRODUCT_LABELS = {
  WB: "Whole Blood",
  PC: "Packed Cells",
  PRP: "Platelet Rich Plasma",
  FFP: "Fresh Frozen Plasma",
  PLT: "Platelets",
  CRYO: "Cryoprecipitate",
};

const TABS = ["donors", "requests", "history"];
const TAB_LABELS = { donors: "🩸 Donors", requests: "🏥 Requests", history: "📋 History" };

const initialDonors = [
  { id: 1, name: "Aung Ko Ko", bloodType: "O+", phone: "09-123456789", lastDonated: "2024-12-10", units: 1, notes: "Healthy" },
  { id: 2, name: "Ma Thin Zar", bloodType: "A-", phone: "09-987654321", lastDonated: "2025-01-15", units: 1, notes: "" },
];

const initialRequests = [
  { id: 1, facility: "Yangon General Hospital", product: "PC", bloodType: "B+", units: 2, date: "2025-05-01", status: "Fulfilled", notes: "Urgent" },
  { id: 2, facility: "Mandalay Clinic", product: "FFP", bloodType: "AB+", units: 1, date: "2025-05-05", status: "Pending", notes: "" },
];

function Badge({ text, color }) {
  const colors = {
    red: "background:#fee2e2;color:#991b1b",
    green: "background:#dcfce7;color:#166534",
    blue: "background:#dbeafe;color:#1e40af",
    purple: "background:#ede9fe;color:#6d28d9",
    yellow: "background:#fef9c3;color:#854d0e",
    orange: "background:#ffedd5;color:#9a3412",
    gray: "background:#f3f4f6;color:#374151",
  };
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "999px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.05em",
      ...(Object.fromEntries((colors[color] || colors.gray).split(";").map(s => s.split(":"))))
    }}>
      {text}
    </span>
  );
}

const PRODUCT_COLORS = { WB: "red", PC: "red", PRP: "purple", FFP: "blue", PLT: "yellow", CRYO: "orange" };
const BTYPE_COLORS = { "O+": "green", "O-": "green", "A+": "blue", "A-": "blue", "B+": "purple", "B-": "purple", "AB+": "orange", "AB-": "orange" };

export default function App() {
  const [tab, setTab] = useState("donors");
  const [donors, setDonors] = useState(initialDonors);
  const [requests, setRequests] = useState(initialRequests);
  const [history, setHistory] = useState([
    { id: 1, type: "Donation", name: "Aung Ko Ko", bloodType: "O+", product: "WB", units: 1, date: "2024-12-10", facility: "-" },
    { id: 2, type: "Request", name: "-", bloodType: "B+", product: "PC", units: 2, date: "2025-05-01", facility: "Yangon General Hospital" },
  ]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(null);
  const [form, setForm] = useState({});
  const [filterBT, setFilterBT] = useState("All");
  const [filterProd, setFilterProd] = useState("All");

  function openModal(type) { setForm({}); setShowModal(type); }
  function closeModal() { setShowModal(null); setForm({}); }

  function saveDonor() {
    if (!form.name || !form.bloodType || !form.phone) return;
    const entry = { id: Date.now(), name: form.name, bloodType: form.bloodType, phone: form.phone, lastDonated: form.lastDonated || new Date().toISOString().slice(0,10), units: Number(form.units)||1, notes: form.notes||"" };
    setDonors(d => [...d, entry]);
    setHistory(h => [...h, { id: Date.now()+1, type: "Donation", name: entry.name, bloodType: entry.bloodType, product: "WB", units: entry.units, date: entry.lastDonated, facility: "-" }]);
    closeModal();
  }

  function saveRequest() {
    if (!form.facility || !form.product || !form.bloodType) return;
    const entry = { id: Date.now(), facility: form.facility, product: form.product, bloodType: form.bloodType, units: Number(form.units)||1, date: form.date || new Date().toISOString().slice(0,10), status: "Pending", notes: form.notes||"" };
    setRequests(r => [...r, entry]);
    setHistory(h => [...h, { id: Date.now()+1, type: "Request", name: "-", bloodType: entry.bloodType, product: entry.product, units: entry.units, date: entry.date, facility: entry.facility }]);
    closeModal();
  }

  function updateRequestStatus(id, status) {
    setRequests(r => r.map(x => x.id === id ? { ...x, status } : x));
  }

  const filteredDonors = donors.filter(d =>
    (filterBT === "All" || d.bloodType === filterBT) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.bloodType.includes(search))
  );
  const filteredRequests = requests.filter(r =>
    (filterBT === "All" || r.bloodType === filterBT) &&
    (filterProd === "All" || r.product === filterProd) &&
    (r.facility.toLowerCase().includes(search.toLowerCase()) || r.bloodType.includes(search))
  );
  const filteredHistory = history.filter(h =>
    (filterBT === "All" || h.bloodType === filterBT) &&
    (filterProd === "All" || h.product === filterProd) &&
    (h.name.toLowerCase().includes(search.toLowerCase()) || h.facility.toLowerCase().includes(search.toLowerCase()) || h.bloodType.includes(search))
  );

  const stats = {
    totalDonors: donors.length,
    totalUnits: donors.reduce((s, d) => s + d.units, 0),
    pendingReq: requests.filter(r => r.status === "Pending").length,
    fulfilledReq: requests.filter(r => r.status === "Fulfilled").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", fontFamily: "'IBM Plex Mono', monospace", color: "#f5f5f5" }}>
      <div style={{ background: "#1a0000", borderBottom: "2px solid #dc2626", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 28 }}>🩸</span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#f87171" }}>BLOOD TRACKER</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>PHLEBOTOMIST MANAGEMENT SYSTEM</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 24, textAlign: "center" }}>
          {[["DONORS", stats.totalDonors], ["UNITS", stats.totalUnits], ["PENDING", stats.pendingReq], ["FULFILLED", stats.fulfilledReq]].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#f87171" }}>{val}</div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1f1f1f", background: "#0a0a0a" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "12px 24px", border: "none", background: "none", cursor: "pointer",
            color: tab === t ? "#f87171" : "#6b7280",
            borderBottom: tab === t ? "2px solid #dc2626" : "2px solid transparent",
            fontFamily: "inherit", fontSize: 13, fontWeight: 700
          }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div style={{ padding: "12px 24px", display: "flex", gap: 10, flexWrap: "wrap", background: "#111", borderBottom: "1px solid #1f1f1f" }}>
        <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ background: "#1a1a1a", border: "1px solid #333", color: "#fff", borderRadius: 6, padding: "6px 12px", fontFamily: "inherit", fontSize: 12, flex: 1, minWidth: 160 }} />
        <select value={filterBT} onChange={e => setFilterBT(e.target.value)}
          style={{ background: "#1a1a1a", border: "1px solid #333", color: "#f87171", borderRadius: 6, padding: "6px 10px", fontFamily: "inherit", fontSize: 12 }}>
          <option value="All">All Blood Types</option>
          {BLOOD_TYPES.map(b => <option key={b}>{b}</option>)}
        </select>
        {tab !== "donors" && (
          <select value={filterProd} onChange={e => setFilterProd(e.target.value)}
            style={{ background: "#1a1a1a", border: "1px solid #333", color: "#f87171", borderRadius: 6, padding: "6px 10px", fontFamily: "inherit", fontSize: 12 }}>
            <option value="All">All Products</option>
            {BLOOD_PRODUCTS.map(p => <option key={p}>{p}</option>)}
          </select>
        )}
        {tab === "donors" && (
          <button onClick={() => openModal("donor")} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ ADD DONOR</button>
        )}
        {tab === "requests" && (
          <button onClick={() => openModal("request")} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ ADD REQUEST</button>
        )}
      </div>

      <div style={{ padding: "20px 24px" }}>
        {tab === "donors" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {filteredDonors.map(d => (
              <div key={d.id} style={{ background: "#141414", border: "1px solid #222", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{d.name}</div>
                  <Badge text={d.bloodType} color={BTYPE_COLORS[d.bloodType] || "gray"} />
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>📞 {d.phone}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>🗓 {d.lastDonated}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>💉 Units: <span style={{ color: "#f87171", fontWeight: 700 }}>{d.units}</span></div>
                {d.notes && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6, fontStyle: "italic" }}>{d.notes}</div>}
              </div>
            ))}
          </div>
        )}

        {tab === "requests" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredRequests.map(r => (
              <div key={r.id} style={{ background: "#141414", border: "1px solid #222", borderRadius: 10, padding: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{r.facility}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>🗓 {r.date} · 💉 {r.units} unit(s)</div>
                  {r.notes && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4, fontStyle: "italic" }}>{r.notes}</div>}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge text={r.bloodType} color={BTYPE_COLORS[r.bloodType] || "gray"} />
                  <Badge text={r.product} color={PRODUCT_COLORS[r.product] || "gray"} />
                  <Badge text={r.status} color={r.status === "Fulfilled" ? "green" : r.status === "Pending" ? "yellow" : "gray"} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {r.status === "Pending" && (
                    <button onClick={() => updateRequestStatus(r.id, "Fulfilled")} style={{ background: "#166534", color: "#fff", border: "none", borderRadius: 5, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit", fontWeight: 700 }}>✓ Fulfill</button>
                  )}
                  <button onClick={() => updateRequestStatus(r.id, "Cancelled")} style={{ background: "#333", color: "#aaa", border: "none", borderRadius: 5, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "history" && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #dc2626", color: "#f87171" }}>
                {["DATE", "TYPE", "NAME / FACILITY", "BLOOD TYPE", "PRODUCT", "UNITS"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 900 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((h, i) => (
                <tr key={h.id} style={{ borderBottom: "1px solid #1a1a1a", background: i % 2 === 0 ? "#0f0f0f" : "#111" }}>
                  <td style={{ padding: "10px 12px", color: "#9ca3af" }}>{h.date}</td>
                  <td style={{ padding: "10px 12px" }}><Badge text={h.type} color={h.type === "Donation" ? "red" : "blue"} /></td>
                  <td style={{ padding: "10px 12px" }}>{h.type === "Donation" ? h.name : h.facility}</td>
                  <td style={{ padding: "10px 12px" }}><Badge text={h.bloodType} color={BTYPE_COLORS[h.bloodType] || "gray"} /></td>
                  <td style={{ padding: "10px 12px" }}><Badge text={h.product} color={PRODUCT_COLORS[h.product] || "gray"} /></td>
                  <td style={{ padding: "10px 12px", color: "#f87171", fontWeight: 700 }}>{h.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#141414", border: "1px solid #333", borderRadius: 12, padding: 28, width: 340, maxWidth: "90vw" }}>
            <div style={{ fontWeight: 900, fontSize: 16, color: "#f87171", marginBottom: 20 }}>
              {showModal === "donor" ? "🩸 ADD DONOR" : "🏥 ADD REQUEST"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {showModal === "donor" ? (
                <>
                  <Field label="Name" value={form.name||""} onChange={v => setForm(f=>({...f,name:v}))} />
                  <SelectField label="Blood Type" value={form.bloodType||""} onChange={v=>setForm(f=>({...f,bloodType:v}))} options={BLOOD_TYPES} />
                  <Field label="Phone" value={form.phone||""} onChange={v=>setForm(f=>({...f,phone:v}))} />
                  <Field label="Date Donated" type="date" value={form.lastDonated||""} onChange={v=>setForm(f=>({...f,lastDonated:v}))} />
                  <Field label="Units" type="number" value={form.units||1} onChange={v=>setForm(f=>({...f,units:v}))} />
                  <Field label="Notes" value={form.notes||""} onChange={v=>setForm(f=>({...f,notes:v}))} />
                </>
              ) : (
                <>
                  <Field label="Facility Name" value={form.facility||""} onChange={v=>setForm(f=>({...f,facility:v}))} />
                  <SelectField label="Blood Product" value={form.product||""} onChange={v=>setForm(f=>({...f,product:v}))} options={BLOOD_PRODUCTS} optionLabels={PRODUCT_LABELS} />
                  <SelectField label="Blood Type" value={form.bloodType||""} onChange={v=>setForm(f=>({...f,bloodType:v}))} options={BLOOD_TYPES} />
                  <Field label="Units Needed" type="number" value={form.units||1} onChange={v=>setForm(f=>({...f,units:v}))} />
                  <Field label="Date" type="date" value={form.date||""} onChange={v=>setForm(f=>({...f,date:v}))} />
                  <Field label="Notes" value={form.notes||""} onChange={v=>setForm(f=>({...f,notes:v}))} />
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={closeModal} style={{ flex: 1, background: "#222", color: "#aaa", border: "1px solid #333", borderRadius: 6, padding: "8px", fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
              <button onClick={showModal === "donor" ? saveDonor : saveRequest} style={{ flex: 2, background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, padding: "8px", fontFamily: "inherit", fontWeight: 700, cursor: "pointer" }}>SAVE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>{label.toUpperCase()}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", background: "#0f0f0f", border: "1px solid #333", color: "#f5f5f5", borderRadius: 6, padding: "7px 10px", fontFamily: "inherit", fontSize: 12 }} />
    </div>
  );
}

function SelectField({ label, value, onChange, options, optionLabels }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>{label.toUpperCase()}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", background: "#0f0f0f", border: "1px solid #333", color: "#f5f5f5", borderRadius: 6, padding: "7px 10px", fontFamily: "inherit", fontSize: 12 }}>
        <option value="">-- Select --</option>
        {options.map(o => <option key={o} value={o}>{optionLabels ? `${o} — ${optionLabels[o]}` : o}</option>)}
      </select>
    </div>
  );
     }
