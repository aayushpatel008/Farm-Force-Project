import React, { useState, useMemo } from 'react';
import './attendance.css';
import Sidebar from './sidebar';

// ── Inline SVG Icons ─────────────────────────────────────────────────────────
const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const DownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const ExportIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
// ─────────────────────────────────────────────────────────────────────────────

const WAGE_MAP = { present: 500, late: 250, halfday: 250, absent: 0 };

const INITIAL_WORKERS = [
  { id: 1, name: 'Ramesh Kumar',  role: 'Harvester',  task: 'Harvesting',  status: 'present', timeIn: '8:02 AM',  timeOut: '5:10 PM',  daysPresent: 22, absents: 2, totalEarned: 11000, rating: 4.5 },
  { id: 2, name: 'Mohan Singh',   role: 'Driver',      task: 'Transport',   status: 'absent',  timeIn: '—',        timeOut: '—',        daysPresent: 18, absents: 6, totalEarned: 9000,  rating: 3.8 },
  { id: 3, name: 'Suresh Patel',  role: 'Plucker',     task: 'Plucking',    status: 'late',    timeIn: '9:15 AM',  timeOut: '5:00 PM',  daysPresent: 20, absents: 3, totalEarned: 10250, rating: 4.1 },
  { id: 4, name: 'Priya Sharma',  role: 'Packer',      task: 'Packing',     status: 'present', timeIn: '7:55 AM',  timeOut: '5:05 PM',  daysPresent: 24, absents: 0, totalEarned: 12000, rating: 4.9 },
  { id: 5, name: 'Amit Verma',    role: 'Harvester',   task: 'Harvesting',  status: 'present', timeIn: '8:30 AM',  timeOut: '5:15 PM',  daysPresent: 21, absents: 3, totalEarned: 10500, rating: 4.2 },
  { id: 6, name: 'Neha Gupta',    role: 'Supervisor',  task: 'Supervision', status: 'present', timeIn: '7:45 AM',  timeOut: '6:00 PM',  daysPresent: 23, absents: 1, totalEarned: 11500, rating: 4.7 },
  { id: 7, name: 'Rajesh Yadav',  role: 'Driver',      task: 'Transport',   status: 'absent',  timeIn: '—',        timeOut: '—',        daysPresent: 15, absents: 9, totalEarned: 7500,  rating: 3.2 },
  { id: 8, name: 'Sunita Devi',   role: 'Packer',      task: 'Packing',     status: 'late',    timeIn: '9:45 AM',  timeOut: '5:00 PM',  daysPresent: 19, absents: 4, totalEarned: 9750,  rating: 3.9 },
];

const WEEKLY = [
  { day: 'Mon', count: 14 },
  { day: 'Tue', count: 16 },
  { day: 'Wed', count: 15 },
  { day: 'Thu', count: 17 },
  { day: 'Fri', count: 13 },
  { day: 'Sat', count: 10 },
  { day: 'Sun', count: 0,  today: true },
];

const MAX_WORKERS = 18;
const TODAY_IDX = 6;

const stars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
};

const initials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

const AttendanceDashboard = () => {
  const [workers, setWorkers]           = useState(INITIAL_WORKERS);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterTask, setFilterTask]     = useState('all');
  const [showHistory, setShowHistory]   = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('present');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [profileWorker, setProfileWorker] = useState(null);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const stats = useMemo(() => ({
    total:   workers.length,
    present: workers.filter(w => w.status === 'present').length,
    absent:  workers.filter(w => w.status === 'absent').length,
    late:    workers.filter(w => w.status === 'late').length,
    wage:    workers.reduce((sum, w) => sum + WAGE_MAP[w.status], 0),
  }), [workers]);

  const attendanceRate = ((stats.present / stats.total) * 100).toFixed(0);

  const tasks = ['all', ...new Set(workers.map(w => w.task))];

  const filtered = workers.filter(w => {
    const q = searchTerm.toLowerCase();
    const matchQ = w.name.toLowerCase().includes(q) || w.role.toLowerCase().includes(q);
    const matchT = filterTask === 'all' || w.task === filterTask;
    return matchQ && matchT;
  });

  const handleStatus = (id, status) => {
    setWorkers(ws => ws.map(w => {
      if (w.id !== id) return w;
      const timeIn = (status === 'present')
        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : status === 'late' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '—';
      return { ...w, status, timeIn };
    }));
  };

  const handleMarkAll = () => {
    setWorkers(ws => ws.map(w => ({
      ...w, status: 'present',
      timeIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })));
  };

  const handleMarkForm = (e) => {
    e.preventDefault();
    if (!selectedWorker) return;
    handleStatus(parseInt(selectedWorker), selectedStatus);
    setSelectedWorker('');
    setSelectedStatus('present');
  };

  const getStatusLabel = (s) => ({ present: 'Present', absent: 'Absent', late: 'Late', halfday: 'Half Day' }[s] || s);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <main className="main-content">

        {/* ── Top Bar ── */}
        <div className="topbar">
          <div className="topbar-brand">
            <h1>FarmForce</h1>
            <p>Attendance Dashboard</p>
          </div>
          <div className="topbar-right">
            <div className="date-pill">
              <CalIcon /> {today}
            </div>
            <button className="mark-all-btn" onClick={handleMarkAll}>
              <CheckIcon style={{width:14,height:14}} /> Mark All Present
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="kpi-grid">
          <div className="kpi-card workers">
            <div className="kpi-icon">👷</div>
            <div className="kpi-body">
              <span className="kpi-label">Total Workers</span>
              <span className="kpi-value">{stats.total}</span>
              <span className="kpi-sub">Assigned today</span>
            </div>
          </div>
          <div className="kpi-card present">
            <div className="kpi-icon">✅</div>
            <div className="kpi-body">
              <span className="kpi-label">Present Today</span>
              <span className="kpi-value">{stats.present}</span>
              <span className="kpi-sub">{stats.late} arrived late</span>
            </div>
          </div>
          <div className="kpi-card absent">
            <div className="kpi-icon">❌</div>
            <div className="kpi-body">
              <span className="kpi-label">Absent Today</span>
              <span className="kpi-value">{stats.absent}</span>
              <span className="kpi-sub">{((stats.absent/stats.total)*100).toFixed(0)}% of workforce</span>
            </div>
          </div>
          <div className="kpi-card wage">
            <div className="kpi-icon">💰</div>
            <div className="kpi-body">
              <span className="kpi-label">Today's Wage Total</span>
              <span className="kpi-value">₹{stats.wage.toLocaleString()}</span>
              <span className="kpi-sub">₹500/day · ₹250 half/late</span>
            </div>
          </div>
        </div>

        {/* ── Attendance Progress ── */}
        <div className="progress-card">
          <div className="progress-info">
            <div className="progress-title">
              <span>Today's Attendance — {stats.present}/{stats.total} workers present</span>
              <span>{attendanceRate}% rate</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${attendanceRate}%` }} />
            </div>
          </div>
          <div className="progress-legend">
            <div className="legend-item"><span className="legend-dot green" /> Present</div>
            <div className="legend-item"><span className="legend-dot amber" /> Late</div>
            <div className="legend-item"><span className="legend-dot red"   /> Absent</div>
          </div>
        </div>

        {/* ── Two-column: Table + Chart ── */}
        <div className="content-row">

          {/* Attendance Table */}
          <div className="section-card">
            {/* Combined Header + Filter in one row */}
            <div className="table-toolbar">
              <span className="section-title" style={{ flexShrink: 0 }}>Today's Attendance</span>
              <input
                className="filter-input"
                type="text"
                placeholder="Search worker or role..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                className="filter-select"
                value={filterTask}
                onChange={e => setFilterTask(e.target.value)}
              >
                {tasks.map(t => (
                  <option key={t} value={t}>{t === 'all' ? 'All Tasks' : t}</option>
                ))}
              </select>
              <button className="btn-sm"><ExportIcon /> Export</button>
            </div>

            <div className="table-wrap">
              <table className="att-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Task</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Status</th>
                    <th>Wage</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(w => (
                    <tr key={w.id} className={`row-${w.status}`}>
                      <td>
                        <div className="worker-cell">
                          <div className="w-avatar">{initials(w.name)}</div>
                          <div>
                            <div className="w-name" onClick={() => setProfileWorker(w)}>{w.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-400)', marginTop: 1 }}>{w.role}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="task-badge">{w.task}</span></td>
                      <td>
                        <span className={`time-cell ${w.timeIn === '—' ? 'time-missing' : ''}`}>
                          {w.timeIn}
                        </span>
                      </td>
                      <td>
                        <span className={`time-cell ${w.timeOut === '—' ? 'time-missing' : ''}`}>
                          {w.timeOut}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${w.status}`}>
                          <span className="s-dot" /> {getStatusLabel(w.status)}
                        </span>
                      </td>
                      <td>
                        <span className="wage-cell">
                          {WAGE_MAP[w.status] > 0 ? `₹${WAGE_MAP[w.status]}` : '₹0'}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            className={`row-btn rb-present ${w.status === 'present' ? 'active-present' : ''}`}
                            title="Mark Present"
                            onClick={() => handleStatus(w.id, 'present')}
                          ><CheckIcon /></button>
                          <button
                            className={`row-btn rb-absent ${w.status === 'absent' ? 'active-absent' : ''}`}
                            title="Mark Absent"
                            onClick={() => handleStatus(w.id, 'absent')}
                          ><XIcon /></button>
                          <button
                            className={`row-btn rb-late ${w.status === 'late' ? 'active-late' : ''}`}
                            title="Mark Late"
                            onClick={() => handleStatus(w.id, 'late')}
                          ><ClockIcon /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-title-group">
                <div className="section-title">Weekly Summary</div>
              </div>
            </div>
            <div className="chart-body">
              <div className="chart-days">
                {WEEKLY.map((d, i) => (
                  <div className="chart-row" key={d.day}>
                    <span className="chart-day" style={i === TODAY_IDX ? { color: 'var(--green-700)', fontWeight: 800 } : {}}>
                      {d.day}
                    </span>
                    <div className="chart-bar-track">
                      <div
                        className={`chart-bar-fill ${d.today ? 'today' : ''}`}
                        style={{ width: `${(d.count / MAX_WORKERS) * 100}%` }}
                      >
                        {d.count > 0 ? d.count : ''}
                      </div>
                    </div>
                    <span className="chart-num">{d.count}</span>
                  </div>
                ))}
              </div>
              <div className="chart-max-note">Max capacity: {MAX_WORKERS} workers</div>
            </div>
          </div>
        </div>

        {/* ── Mark Attendance Form ── */}
        <div className="mark-card">
          <div className="section-header" style={{ padding: 0, marginBottom: 20, border: 'none' }}>
            <div className="section-title-group">
              <div className="section-icon">✍️</div>
              <div>
                <div className="section-title">Mark Attendance</div>
                <div className="section-sub">Manually update a worker's attendance record</div>
              </div>
            </div>
          </div>
          <form onSubmit={handleMarkForm}>
            <div className="mark-form-grid">
              <div className="form-field">
                <label className="form-label">Select Worker</label>
                <select
                  className="form-control"
                  value={selectedWorker}
                  onChange={e => setSelectedWorker(e.target.value)}
                  required
                >
                  <option value="">Choose worker...</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} — {w.role}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Date</label>
                <input
                  className="form-control"
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                >
                  <option value="present">✅ Present</option>
                  <option value="absent">❌ Absent</option>
                  <option value="late">⏰ Late</option>
                  <option value="halfday">🌓 Half Day</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-sm primary" style={{ padding: '10px 28px' }}>
                <CheckIcon style={{ width: 14, height: 14 }} /> Mark Attendance
              </button>
            </div>
          </form>
        </div>

        {/* ── Monthly Report ── */}
        <div className="report-section">
          <button className="report-toggle" onClick={() => setShowHistory(!showHistory)}>
            <div className="report-toggle-left">
              <span className="report-toggle-icon">📂</span>
              View Monthly Report — February 2026
            </div>
            <div className={`report-toggle-arrow ${showHistory ? 'open' : ''}`}>
              <DownIcon />
            </div>
          </button>

          {showHistory && (
            <div className="report-panel">
              <div className="report-header">
                <h3>February 2026 Attendance Summary</h3>
                <div className="report-actions">
                  <button className="btn-sm"><FilterIcon /> Filter</button>
                  <button className="btn-sm"><ExportIcon /> Export PDF</button>
                </div>
              </div>
              <div className="report-stats">
                <div className="report-stat">
                  <span className="report-stat-label">Working Days</span>
                  <span className="report-stat-value">22</span>
                </div>
                <div className="report-stat">
                  <span className="report-stat-label">Avg. Attendance</span>
                  <span className="report-stat-value">84%</span>
                </div>
                <div className="report-stat">
                  <span className="report-stat-label">Late Days</span>
                  <span className="report-stat-value">12</span>
                </div>
                <div className="report-stat">
                  <span className="report-stat-label">Total Wages Paid</span>
                  <span className="report-stat-value" style={{ fontSize: '1.3rem', color: 'var(--rupee)' }}>₹82,500</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom ── */}
        <div className="bottom-actions">
          <button className="logout-btn">🚪 Logout</button>
        </div>
      </main>

      {/* ── Worker Profile Modal ── */}
      {profileWorker && (
        <div className="modal-overlay" onClick={() => setProfileWorker(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <button className="modal-close" onClick={() => setProfileWorker(null)}>✕</button>
              <div className="modal-avatar">{initials(profileWorker.name)}</div>
              <div>
                <div className="modal-name">{profileWorker.name}</div>
                <div className="modal-role">{profileWorker.role} · {profileWorker.task}</div>
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-stats">
                <div className="modal-stat">
                  <span className="modal-stat-label">Days Present</span>
                  <span className="modal-stat-value green">{profileWorker.daysPresent}</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-label">Absences</span>
                  <span className="modal-stat-value" style={{ color: 'var(--red)' }}>{profileWorker.absents}</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-label">Total Earned</span>
                  <span className="modal-stat-value rupee">₹{profileWorker.totalEarned.toLocaleString()}</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-label">This Month</span>
                  <span className="modal-stat-value">{profileWorker.daysPresent + profileWorker.absents} days</span>
                </div>
              </div>
              <div className="rating-row">
                <span className="rating-label">Performance Rating</span>
                <span className="rating-stars">{stars(profileWorker.rating)}</span>
                <span className="rating-value">{profileWorker.rating} / 5.0</span>
              </div>
              <div className="modal-actions">
                <button className="btn-modal secondary" onClick={() => setProfileWorker(null)}>Close</button>
                <button className="btn-modal primary" onClick={() => { handleStatus(profileWorker.id, 'present'); setProfileWorker(null); }}>
                  Mark Present Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;