import React, { useState, useMemo } from 'react';
import './attendance.css';
import Sidebar from './sidebar';

const WORKER_LIST = [
  { id: 1,  name: 'Ramesh Kumar',  role: 'Harvester',  avatar: 'RK' },
  { id: 2,  name: 'Mohan Singh',   role: 'Driver',      avatar: 'MS' },
  { id: 3,  name: 'Suresh Patel',  role: 'Plucker',     avatar: 'SP' },
  { id: 4,  name: 'Priya Sharma',  role: 'Packer',      avatar: 'PS' },
  { id: 5,  name: 'Amit Verma',    role: 'Harvester',   avatar: 'AV' },
  { id: 6,  name: 'Neha Gupta',    role: 'Supervisor',  avatar: 'NG' },
  { id: 7,  name: 'Rajesh Yadav',  role: 'Driver',      avatar: 'RY' },
  { id: 8,  name: 'Sunita Devi',   role: 'Packer',      avatar: 'SD' },
  { id: 9,  name: 'Deepak Nair',   role: 'Irrigator',   avatar: 'DN' },
  { id: 10, name: 'Kavita Joshi',  role: 'Quality QC',  avatar: 'KJ' },
];

const STATUS = ['Present', 'Absent', 'Leave'];
const STATUS_META = {
  Present: { color: '#16a34a', bg: '#dcfce7', dot: '#22c55e', short: 'P' },
  Absent:  { color: '#dc2626', bg: '#fee2e2', dot: '#ef4444', short: 'A' },
  Leave:   { color: '#d97706', bg: '#fef3c7', dot: '#f59e0b', short: 'L' },
};

const fmt = (iso) => new Date(iso).toLocaleDateString('en-IN', {
  weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
});

const seedRecords = () => {
  const records = {};
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const day = {};
    WORKER_LIST.forEach(w => {
      const r = Math.random();
      day[w.id] = r > 0.15 ? (r > 0.25 ? 'Present' : 'Leave') : 'Absent';
    });
    records[key] = day;
  }
  return records;
};

export default function Attendance() {
  const todayISO = new Date().toISOString().split('T')[0];
  const [records,    setRecords]    = useState(seedRecords);
  const [activeDate, setActiveDate] = useState(todayISO);
  const [draft,      setDraft]      = useState({});
  const [editMode,   setEditMode]   = useState(false);
  const [toast,      setToast]      = useState(null);
  const [viewTab,    setViewTab]    = useState('mark');
  const [searchQ,    setSearchQ]    = useState('');
  const [filterRole, setFilterRole] = useState('All');

  const loadDate = (date) => {
    setActiveDate(date);
    setDraft(records[date] ? { ...records[date] } : {});
    setEditMode(!records[date]);
  };

  React.useEffect(() => { loadDate(activeDate); }, []); // eslint-disable-line

  const handleDateChange = (e) => loadDate(e.target.value);

  const setWorkerStatus = (workerId, status) =>
    setDraft(prev => ({ ...prev, [workerId]: status }));

  const roles = useMemo(() => ['All', ...new Set(WORKER_LIST.map(w => w.role))], []);

  const filtered = WORKER_LIST.filter(w => {
    const mq = w.name.toLowerCase().includes(searchQ.toLowerCase()) ||
               w.role.toLowerCase().includes(searchQ.toLowerCase());
    const mr = filterRole === 'All' || w.role === filterRole;
    return mq && mr;
  });

  const markAll = (status) => {
    const all = {};
    filtered.forEach(w => { all[w.id] = status; });
    setDraft(prev => ({ ...prev, ...all }));
  };

  const saveAttendance = () => {
    setRecords(prev => ({ ...prev, [activeDate]: { ...(prev[activeDate] || {}), ...draft } }));
    setEditMode(false);
    setToast('Attendance saved successfully!');
    setTimeout(() => setToast(null), 2800);
  };

  const cancelEdit = () => {
    setDraft(records[activeDate] ? { ...records[activeDate] } : {});
    setEditMode(false);
  };

  const stats = useMemo(() => {
    const snap = { ...records[activeDate], ...draft };
    const counts = { Present: 0, Absent: 0, Leave: 0, Unmarked: 0 };
    WORKER_LIST.forEach(w => {
      const s = snap[w.id];
      if (s) counts[s]++; else counts.Unmarked++;
    });
    return counts;
  }, [records, draft, activeDate]);

  const historyDates = useMemo(() =>
    Object.keys(records).sort((a, b) => b.localeCompare(a)), [records]);

  const hasChanges = Object.keys(draft).length > 0;
  const isSaved = !!records[activeDate];

  return (
    <div className="ap-shell">
      <Sidebar />

      {/* The only scrollable container — sidebar is excluded */}
      <div className="ap-page">

        {/* Toast */}
        {toast && (
          <div className="ap-toast">
            <span className="ap-toast-dot">✓</span>
            {toast}
          </div>
        )}

        {/* ── Header ── */}
        <div className="ap-header">
          <div className="ap-header-left">
            <div className="ap-header-tag">🌿 Attendance Management</div>
            <h1 className="ap-header-title">Worker Attendance</h1>
            <p className="ap-header-sub">Track, mark and review daily attendance for all field workers</p>
          </div>
          <div className="ap-header-stats">
            {[
              { key: 'Present',  cls: 'green' },
              { key: 'Absent',   cls: 'red'   },
              { key: 'Leave',    cls: 'amber' },
              { key: 'Unmarked', cls: 'gray'  },
            ].map(({ key, cls }) => (
              <div key={key} className={`ap-hstat ap-hstat--${cls}`}>
                <span className="ap-hstat-num">{stats[key]}</span>
                <span className="ap-hstat-label">{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="ap-tabs">
          {[
            { id: 'mark',    label: '📋 Mark Attendance'   },
            { id: 'history', label: '📅 History & Records' },
          ].map(t => (
            <button key={t.id}
              className={`ap-tab ${viewTab === t.id ? 'ap-tab--active' : ''}`}
              onClick={() => setViewTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ MARK TAB ══ */}
        {viewTab === 'mark' && (
          <div className="ap-fade">

            {/* Controls */}
            <div className="ap-controls">
              <div className="ap-date-wrap">
                <label className="ap-control-label">Select Date</label>
                <input type="date" className="ap-date-input"
                  value={activeDate} max={todayISO} onChange={handleDateChange} />
              </div>
              <div className="ap-date-info">
                <span className="ap-date-display">{fmt(activeDate)}</span>
                {isSaved
                  ? <span className="ap-chip ap-chip--saved">✓ Saved</span>
                  : <span className="ap-chip ap-chip--unsaved">Not yet recorded</span>
                }
              </div>
              <div className="ap-ctrl-right">
                {editMode ? (
                  <>
                    <div className="ap-markall-group">
                      <span className="ap-control-label">Mark All:</span>
                      {STATUS.map(s => (
                        <button key={s}
                          className={`ap-markall-btn ap-markall-btn--${s.toLowerCase()}`}
                          onClick={() => markAll(s)}>{s}</button>
                      ))}
                    </div>
                    <button className="ap-btn ap-btn--outline" onClick={cancelEdit}>Cancel</button>
                    <button className="ap-btn ap-btn--save" onClick={saveAttendance} disabled={!hasChanges}>
                      💾 Save Attendance
                    </button>
                  </>
                ) : (
                  <button className="ap-btn ap-btn--edit" onClick={() => setEditMode(true)}>
                    ✏️ {isSaved ? 'Edit Attendance' : 'Mark Attendance'}
                  </button>
                )}
              </div>
            </div>

            {/* Search + Filter */}
            <div className="ap-toolbar">
              <div className="ap-search-wrap">
                <span className="ap-search-icon">🔍</span>
                <input className="ap-search" placeholder="Search worker or role…"
                  value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              </div>
              <select className="ap-select" value={filterRole}
                onChange={e => setFilterRole(e.target.value)}>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <span className="ap-count">{filtered.length} workers</span>
            </div>

            {/* Table */}
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Worker</th>
                    <th>Role</th>
                    <th>Status</th>
                    {editMode && <th>Mark</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w, i) => {
                    const snap = { ...records[activeDate], ...draft };
                    const status = snap[w.id] || null;
                    const meta = status ? STATUS_META[status] : null;
                    return (
                      <tr key={w.id}
                        className={`ap-row ${status ? `ap-row--${status.toLowerCase()}` : ''}`}
                        style={{ animationDelay: `${i * 25}ms` }}>
                        <td className="ap-td-num">{i + 1}</td>
                        <td>
                          <div className="ap-worker">
                            <div className="ap-avatar"
                              style={{ background: `hsl(${(w.id * 47) % 360},45%,35%)` }}>
                              {w.avatar}
                            </div>
                            <span className="ap-wname">{w.name}</span>
                          </div>
                        </td>
                        <td><span className="ap-role-tag">{w.role}</span></td>
                        <td>
                          {status
                            ? <span className="ap-status-pill"
                                style={{ background: meta.bg, color: meta.color }}>
                                <span className="ap-status-dot" style={{ background: meta.dot }} />
                                {status}
                              </span>
                            : <span className="ap-status-none">—</span>
                          }
                        </td>
                        {editMode && (
                          <td>
                            <div className="ap-mark-group">
                              {STATUS.map(s => (
                                <button key={s}
                                  className={`ap-mark-btn ap-mark-btn--${s.toLowerCase()}
                                    ${(draft[w.id] === s || (!draft[w.id] && records[activeDate]?.[w.id] === s))
                                      ? 'ap-mark-btn--on' : ''}`}
                                  onClick={() => setWorkerStatus(w.id, s)}>
                                  {STATUS_META[s].short}
                                </button>
                              ))}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="ap-empty">No workers match your search</div>
              )}
            </div>

            {/* ── Sticky footer — sticks to bottom of ap-page scroll container ── */}
            {editMode && (
              <div className="ap-footer-bar">
                <span className="ap-footer-text">
                  {Object.keys(draft).length} of {WORKER_LIST.length} workers marked
                </span>
                <button className="ap-btn ap-btn--footer-ghost" onClick={cancelEdit}>Cancel</button>
                <button className="ap-btn ap-btn--footer-save" onClick={saveAttendance} disabled={!hasChanges}>
                  💾 Save Attendance
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ HISTORY TAB ══ */}
        {viewTab === 'history' && (
          <div className="ap-fade">
            {historyDates.length === 0 ? (
              <div className="ap-empty-state">
                <span style={{ fontSize: 48 }}>📋</span>
                <p>No attendance records yet.</p>
                <button className="ap-btn ap-btn--edit" onClick={() => setViewTab('mark')}>
                  Start Marking Attendance
                </button>
              </div>
            ) : (
              <div className="ap-hist-list">
                {historyDates.map(date => {
                  const rec = records[date];
                  const present = Object.values(rec).filter(s => s === 'Present').length;
                  const absent  = Object.values(rec).filter(s => s === 'Absent').length;
                  const leave   = Object.values(rec).filter(s => s === 'Leave').length;
                  const total   = Object.keys(rec).length;
                  const pct     = Math.round((present / total) * 100);
                  return (
                    <div key={date} className="ap-hist-card">
                      <div className="ap-hist-left">
                        <div className="ap-hist-date">{fmt(date)}</div>
                        <div className="ap-hist-pills">
                          <span className="ap-mini-pill ap-mini-pill--green">✓ {present} Present</span>
                          <span className="ap-mini-pill ap-mini-pill--red">✗ {absent} Absent</span>
                          <span className="ap-mini-pill ap-mini-pill--amber">◐ {leave} Leave</span>
                        </div>
                      </div>
                      <div className="ap-hist-right">
                        <div className="ap-pct-row">
                          <div className="ap-pct-bar">
                            <div className="ap-pct-fill" style={{
                              width: `${pct}%`,
                              background: pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626'
                            }} />
                          </div>
                          <span className="ap-pct-label">{pct}%</span>
                        </div>
                        <button className="ap-btn ap-btn--edit ap-btn--sm"
                          onClick={() => { loadDate(date); setViewTab('mark'); setEditMode(false); }}>
                          View / Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>{/* end ap-page */}
    </div>
  );
}