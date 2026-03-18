import { useState, useEffect } from "react";
import Sidebar1 from "../Sidebar";
import "./Attendance.css";

const todayJob = {
  farm: "Patel Farm",
  work: "Harvesting",
  date: "10 March 2025",
  time: "9:00 AM – 5:00 PM",
  jobId: "JOB-2025-041",
};

const history = [
  { date: "12 Mar 2025", job: "Harvest",    type: "Seasonal",    hours: "8h 00m", status: "Verified" },
  { date: "11 Mar 2025", job: "Tractor Op", type: "Mechanical",  hours: "6h 15m", status: "Verified" },
  { date: "10 Mar 2025", job: "Harvest",    type: "Seasonal",    hours: "7h 53m", status: "Pending"  },
  { date: "09 Mar 2025", job: "Irrigation", type: "Maintenance", hours: "5h 30m", status: "Verified" },
  { date: "08 Mar 2025", job: "Planting",   type: "Seasonal",    hours: "9h 10m", status: "Verified" },
];

function fmt(date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function fmtClock(date) {
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
}
function calcHours(a, b) {
  const diff = b - a;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

const todayLabel = new Date().toLocaleDateString("en-IN", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});

export default function WorkerAttendance() {
  const [tab,      setTab]      = useState("today");
  const [stage,    setStage]    = useState("idle");
  const [checkIn,  setCheckIn]  = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [now,      setNow]      = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="wa-layout">

      {/* ── Sidebar ── */}
      <Sidebar1 />

      {/* ── Main ── */}
      <div className="wa-main">

        {/* Top Bar */}
        <div className="wa-topbar">
          <div className="wa-topbar-title">
            {tab === "today" ? "Today's Attendance" : "Attendance History"}
          </div>
          <div className="wa-date-pill">📅 {todayLabel}</div>
        </div>

        {/* Tabs */}
        <div className="wa-tabs">
          <button className={`wa-tab ${tab === "today" ? "active" : ""}`} onClick={() => setTab("today")}>
            Today's Work
          </button>
          <button className={`wa-tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
            Attendance History
          </button>
        </div>

        {/* Body */}
        <div className="wa-body">
          {tab === "today" ? (
            <TodayView
              stage={stage} checkIn={checkIn} checkOut={checkOut} now={now}
              onCheckIn={() => { setCheckIn(new Date()); setStage("working"); }}
              onCheckOut={() => { setCheckOut(new Date()); setStage("done"); }}
            />
          ) : (
            <HistoryView />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── TODAY VIEW ─────────────────── */
function TodayView({ stage, checkIn, checkOut, now, onCheckIn, onCheckOut }) {
  return (
    <>
      <div className="wa-grid">

        {/* Job Info */}
        <div className="wa-job-card">
          <div className="wa-job-top">
            <div>
              <div className="wa-card-label">Today's Job</div>
              <div className="wa-job-farm">{todayJob.farm}</div>
              <div className="wa-job-work">{todayJob.work}</div>
            </div>
            <div className="wa-job-badge">Active</div>
          </div>
          <div className="wa-job-meta-row">
            <div className="wa-meta-chip">📅 {todayJob.date}</div>
            <div className="wa-meta-chip">⏰ {todayJob.time}</div>
            <div className="wa-meta-chip">🏷 {todayJob.jobId}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="wa-quick-stats">
          <div className="wa-card">
            <div className="wa-card-label">Work Status</div>
            <div className="wa-card-value" style={{
              color: stage === "idle" ? "#6b7280" : stage === "working" ? "#16a34a" : "#2563eb",
            }}>
              {stage === "idle" ? "Not Started" : stage === "working" ? "● Working" : "✓ Completed"}
            </div>
            <div className="wa-card-sub">
              {stage === "idle"    && "Check in to begin your shift"}
              {stage === "working" && `Started at ${fmt(checkIn)}`}
              {stage === "done"    && `${calcHours(checkIn, checkOut)} worked today`}
            </div>
          </div>
          <div className="wa-card">
            <div className="wa-card-label">This Week</div>
            <div className="wa-card-value">36h 45m</div>
            <div className="wa-card-sub">Across 5 working days</div>
          </div>
        </div>
      </div>

      {/* Attendance Action Panel */}
      <div className="wa-attend-card">

        {/* IDLE */}
        {stage === "idle" && (
          <>
            <div className="wa-clock-wrap">
              <div className="wa-big-clock">{fmtClock(now)}</div>
              <div className="wa-clock-label">Current Time</div>
            </div>
            <p className="wa-attend-hint">
              Mark your attendance by checking in when you arrive at the farm.
            </p>
            <button className="wa-btn wa-btn-primary" onClick={onCheckIn}>
              ✅ &nbsp;Check In
            </button>
          </>
        )}

        {/* WORKING */}
        {stage === "working" && (
          <>
            <div className="wa-working-badge">
              <span className="wa-pulse" /> Currently Working
            </div>
            <div className="wa-clock-wrap">
              <div className="wa-big-clock">{fmtClock(now)}</div>
              <div className="wa-clock-label">Live Time</div>
            </div>
            <div className="wa-stat-boxes">
              <div className="wa-stat-box">
                <div className="wa-stat-label">Checked In</div>
                <div className="wa-stat-val">{fmt(checkIn)}</div>
              </div>
              <div className="wa-stat-box">
                <div className="wa-stat-label">Elapsed</div>
                <div className="wa-stat-val green">{calcHours(checkIn, new Date())}</div>
              </div>
              <div className="wa-stat-box">
                <div className="wa-stat-label">Expected Out</div>
                <div className="wa-stat-val">05:00 PM</div>
              </div>
            </div>
            <button className="wa-btn wa-btn-danger" onClick={onCheckOut}>
              🔴 &nbsp;Check Out
            </button>
          </>
        )}

        {/* DONE */}
        {stage === "done" && (
          <>
            <div className="wa-done-header">
              <div className="wa-done-icon">✅</div>
              <div>
                <div className="wa-done-title">Work Completed</div>
                <div className="wa-done-sub">Your attendance has been recorded</div>
              </div>
            </div>
            <div className="wa-summ-table">
              <div className="wa-summ-row">
                <span className="wa-summ-label">Check In Time</span>
                <span className="wa-summ-val">{fmt(checkIn)}</span>
              </div>
              <div className="wa-summ-row">
                <span className="wa-summ-label">Check Out Time</span>
                <span className="wa-summ-val">{fmt(checkOut)}</span>
              </div>
              <div className="wa-summ-row">
                <span className="wa-summ-label">Total Hours Worked</span>
                <span className="wa-summ-val accent">{calcHours(checkIn, checkOut)}</span>
              </div>
              <div className="wa-summ-row">
                <span className="wa-summ-label">Job</span>
                <span className="wa-summ-val">{todayJob.farm} — {todayJob.work}</span>
              </div>
            </div>
            <div className="wa-verify-note">
              ⏳ Attendance submitted — pending provider verification
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ─────────────── HISTORY VIEW ───────────────── */
function HistoryView() {
  return (
    <>
      <div className="wa-stats-row">
        <div className="wa-stat-card">
          <div className="wa-stat-card-num">5</div>
          <div className="wa-stat-card-lbl">Days Worked</div>
        </div>
        <div className="wa-stat-card">
          <div className="wa-stat-card-num">36h 55m</div>
          <div className="wa-stat-card-lbl">Total Hours</div>
        </div>
        <div className="wa-stat-card">
          <div className="wa-stat-card-num green">4</div>
          <div className="wa-stat-card-lbl">Days Verified</div>
        </div>
      </div>

      <div className="wa-table-wrap">
        <table className="wa-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Job</th>
              <th>Type</th>
              <th>Hours Worked</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td className="bold">{r.job}</td>
                <td>{r.type}</td>
                <td className="bold">{r.hours}</td>
                <td>
                  <span className={`wa-badge ${r.status === "Verified" ? "verified" : "pending"}`}>
                    {r.status === "Verified" ? "✓" : "⏳"} {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}