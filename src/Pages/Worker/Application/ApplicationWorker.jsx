import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar1 from "../Sidebar";
import "./ApplicationWorker.css";

/* ─── Icons ─────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const TotalIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const AppliedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const InvitedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const AcceptedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Helpers (copied verbatim from worker.jsx) ──────────────── */
const getAvatarColor = (str = "") => {
  const colors = ["green", "teal", "amber", "blue", "coral", "purple"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "??";

const getTag = (category = "", title = "") => {
  const src = (category || title).toLowerCase();
  if (src.includes("harvest"))  return { label: "Harvesting",  color: "green"  };
  if (src.includes("plant"))    return { label: "Planting",    color: "teal"   };
  if (src.includes("irrigat"))  return { label: "Irrigation",  color: "orange" };
  if (src.includes("spray"))    return { label: "Spraying",    color: "blue"   };
  if (src.includes("weed"))     return { label: "Weeding",     color: "red"    };
  if (src.includes("sort"))     return { label: "Sorting",     color: "purple" };
  if (src.includes("tractor"))  return { label: "Machinery",   color: "orange" };
  if (src.includes("driver"))   return { label: "Transport",   color: "blue"   };
  return { label: category || "General", color: "green" };
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/* ─── Header ─────────────────────────────────────────────────── */
const Header = ({ searchQuery, setSearchQuery }) => (
  <div className="am-header">
    <div className="am-header-left">
      <h1 className="am-page-title">Applications</h1>
      <p className="am-page-subtitle">Monitor and manage all your job applications</p>
    </div>
    <div className="am-header-right">
      <div className="am-search-wrap">
        <SearchIcon />
        <input
          className="am-search"
          placeholder="Search applications..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      <button className="am-icon-btn am-bell-btn">
        <BellIcon />
        <span className="am-bell-dot" />
      </button>
    </div>
  </div>
);

/* ─── Filter Tabs ─────────────────────────────────────────────── */
const FILTERS = ["all", "applied", "invited", "accepted", "rejected"];

const FilterTabs = ({ activeFilter, setActiveFilter }) => (
  <div className="am-filters-row">
    <div className="am-tabs">
      {FILTERS.map(f => (
        <button
          key={f}
          className={`am-tab ${activeFilter === f ? "am-tab--active" : ""}`}
          onClick={() => setActiveFilter(f)}
        >
          {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
    <button className="am-advanced-btn">
      <FilterIcon /> Advanced Filters
    </button>
  </div>
);

/* ─── Stats ───────────────────────────────────────────────────── */
const StatsCards = ({ applications, invitations }) => {
  const accepted = applications.filter(a => a.status?.toLowerCase() === "accepted").length;
  const applied  = applications.filter(a => a.status?.toLowerCase() !== "invited").length;
  const stats = [
    { label: "Total",    value: applications.length + invitations.length, icon: <TotalIcon /> },
    { label: "Applied",  value: applied,            icon: <AppliedIcon /> },
    { label: "Invited",  value: invitations.length, icon: <InvitedIcon /> },
    { label: "Accepted", value: accepted,           icon: <AcceptedIcon /> },
  ];
  return (
    <div className="am-stats-grid">
      {stats.map((s, i) => (
        <div className="am-stat-card" key={i}>
          <div className="am-stat-icon-wrap">{s.icon}</div>
          <div className="am-stat-body">
            <span className="am-stat-value">{s.value}</span>
            <span className="am-stat-label">{s.label}</span>
          </div>
          <div className="am-stat-blob" />
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   APPLICATION CARD
   Structure = wja-card exactly.
   Only change: chips row replaced with divider + chips + footer row
   (applied date LEFT, status badge RIGHT).
═══════════════════════════════════════════════════════════════ */
function ApplicationCard({ app, onCardClick }) {
  const job    = app.job || {};
  const status = app.status || "Pending";

  const tag          = getTag(job.jobCategory, job.title);
  const initials     = getInitials(job.farmName || "");
  const avatarColor  = getAvatarColor(job.farmName || "");
  const locationText = [job.city, job.state].filter(Boolean).join(", ") || job.farmAddress || "Location N/A";
  const chips        = [tag.label, job.employmentType, job.payType].filter(Boolean);
  const appliedDate  = formatDate(app.appliedAt || app.createdAt);

  return (
    <div className="amc-card" onClick={() => onCardClick(app)}>

      {/* TOP: avatar + identity — identical to wja-card__top */}
      <div className="amc-card__top">
        <div className={`amc-card__avatar avatar--${avatarColor}`}>{initials}</div>
        <div className="amc-card__identity">
          <h4 className="amc-card__name">{job.title || "Job Position"}</h4>
          <p className="amc-card__role">{job.farmName || "Farm"}</p>
        </div>
      </div>

      {/* DETAILS: location + experience row, salary row — identical to wja-card__details */}
      <div className="amc-card__details">
        <div className="amc-card__detail-row">
          <span className="amc-card__detail-item">
            <span className="amc-card__detail-icon">📍</span>
            {locationText}
          </span>
          <span className="amc-card__detail-item">
            <span className="amc-card__detail-icon">🧑‍🌾</span>
            {job.experienceRequired || "Open to all"}
          </span>
        </div>
        {job.salary && (
          <div className="amc-card__detail-row">
            <span className="amc-card__detail-item">
              <span className="amc-card__detail-icon">💰</span>
              ₹{job.salary}{job.payType ? ` / ${job.payType}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* DIVIDER — identical to wja-card__divider */}
      <div className="amc-card__divider" />

      {/* CHIPS — identical to wja-card__chips */}
      <div className="amc-card__chips">
        {chips.slice(0, 3).map((chip, i) => (
          <span key={i} className="amc-card__chip-tag">{chip}</span>
        ))}
      </div>

      {/* FOOTER (only difference from wja-card) */}
      <div className="amc-card__footer">
        <span className="amc-card__applied-date">
          <span className="amc-card__detail-icon">📅</span>
          Applied: {appliedDate}
        </span>
        <span className={`amc-status-badge amc-status-badge--${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INVITE CARD
   Same structure as ApplicationCard.
   Footer: status badge LEFT, accept/decline buttons RIGHT.
═══════════════════════════════════════════════════════════════ */
function InviteCard({ inv, responding, onRespond, onCardClick }) {
  const id  = inv._id;
  const job = inv.job || {};

  const isAccepting = responding[id] === "accept";
  const isRejecting = responding[id] === "reject";
  const isBusy      = !!responding[id];

  const tag          = getTag(job.jobCategory, job.title);
  const initials     = getInitials(job.farmName || "");
  const avatarColor  = getAvatarColor(job.farmName || "");
  const locationText = [job.city, job.state].filter(Boolean).join(", ") || job.farmAddress || "Location N/A";
  const chips        = [tag.label, job.employmentType, job.payType].filter(Boolean);

  return (
    <div className="amc-card amc-card--invite" onClick={() => onCardClick(inv)}>

      {/* TOP */}
      <div className="amc-card__top">
        <div className={`amc-card__avatar avatar--${avatarColor}`}>{initials}</div>
        <div className="amc-card__identity">
          <h4 className="amc-card__name">{job.title || "Job Position"}</h4>
          <p className="amc-card__role">{job.farmName || "Farm"}</p>
        </div>
      </div>

      {/* DETAILS */}
      <div className="amc-card__details">
        <div className="amc-card__detail-row">
          <span className="amc-card__detail-item">
            <span className="amc-card__detail-icon">📍</span>
            {locationText}
          </span>
          <span className="amc-card__detail-item">
            <span className="amc-card__detail-icon">🧑‍🌾</span>
            {job.experienceRequired || "Open to all"}
          </span>
        </div>
        {job.salary && (
          <div className="amc-card__detail-row">
            <span className="amc-card__detail-item">
              <span className="amc-card__detail-icon">💰</span>
              ₹{job.salary}{job.payType ? ` / ${job.payType}` : ""}
            </span>
          </div>
        )}
      </div>

      {/* DIVIDER */}
      <div className="amc-card__divider" />

      {/* CHIPS */}
      <div className="amc-card__chips">
        {chips.slice(0, 3).map((chip, i) => (
          <span key={i} className="amc-card__chip-tag">{chip}</span>
        ))}
      </div>

      {/* FOOTER — invite variant with dynamic status rendering */}
      <div className="amc-card__footer amc-card__footer--invite" onClick={e => e.stopPropagation()}>

        {inv.status === "pending" ? (
          <>
            <span className="amc-status-badge amc-status-badge--invited">
              Invited
            </span>

            <div className="amc-card__actions">
              <button
                className="amc-btn amc-btn--accept"
                onClick={() => onRespond(id, "accept")}
                disabled={isBusy}
              >
                {isAccepting
                  ? <span className="amc-spinner amc-spinner--green" />
                  : <><CheckIcon /> Accept</>}
              </button>

              <button
                className="amc-btn amc-btn--decline"
                onClick={() => onRespond(id, "reject")}
                disabled={isBusy}
              >
                {isRejecting
                  ? <span className="amc-spinner amc-spinner--red" />
                  : <><XIcon /> Reject</>}
              </button>
            </div>
          </>
        ) : (
          <span className={`amc-status-badge amc-status-badge--${inv.status}`}>
            {inv.status === "accepted" ? "Accepted" : "Rejected"}
          </span>
        )}

      </div>

    </div>
  );
}

/* ─── Skeleton (mirrors wja-card skeleton) ────────────────────── */
function CardSkeleton() {
  return (
    <div className="amc-card amc-card--skeleton">
      <div className="amc-card__top">
        <div className="skel skel--avatar" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="skel skel--line skel--lg" />
          <div className="skel skel--line skel--md" />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        <div className="skel skel--line skel--sm" />
        <div className="skel skel--line skel--sm" />
      </div>
      <div className="amc-card__divider" />
      <div style={{ display: "flex", gap: 8 }}>
        <div className="skel skel--pill" />
        <div className="skel skel--pill" />
      </div>
      <div className="amc-card__footer">
        <div className="skel skel--line skel--md" />
        <div className="skel skel--pill" />
      </div>
    </div>
  );
}

/* ─── Job Details Modal (unchanged from your existing code) ────── */
const JobDetailsModal = ({ job, application, isOpen, onClose }) => {
  if (!isOpen || !job) return null;

  const fmt = (iso) => {
    try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return iso; }
  };

  const statusClass = (s = "") =>
    ({ Active:"active", Filled:"filled", Paused:"paused", Closed:"closed",
       Pending:"paused", Accepted:"active", Rejected:"closed", Invited:"filled" }[s] || "active");

  const appliedDate = fmt(application?.appliedAt || application?.createdAt);
  const appStatus   = application?.status || "Pending";
  const locationText = [job.city, job.state].filter(Boolean).join(", ") || "—";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-view" onClick={e => e.stopPropagation()}>
        <div className="modal-view-banner">
          <div className="modal-view-banner-left">
            <div className="modal-view-icon">💼</div>
            <div>
              <h2 className="modal-view-title">{job.title}</h2>
              <span className={`status-badge ${statusClass(appStatus)}`}>{appStatus}</span>
            </div>
          </div>
          <button className="modal-close modal-close-white" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body modal-view-body">
          <div className="modal-chips modal-field-full">
            <div className="modal-chip">
              <span className="modal-chip-icon">📅</span>
              <div><span className="modal-chip-label">Applied</span><span className="modal-chip-val">{appliedDate}</span></div>
            </div>
            <div className="modal-chip">
              <span className="modal-chip-icon">👷</span>
              <div><span className="modal-chip-label">Workers Needed</span><span className="modal-chip-val">{job.workersNeeded || "—"}</span></div>
            </div>
            <div className="modal-chip">
              <span className="modal-chip-icon">💰</span>
              <div>
                <span className="modal-chip-label">Salary</span>
                <span className="modal-chip-val">{job.salary ? `₹${job.salary}${job.payType ? ` / ${job.payType}` : ""}` : "—"}</span>
              </div>
            </div>
            <div className="modal-chip">
              <span className="modal-chip-icon">📍</span>
              <div><span className="modal-chip-label">Location</span><span className="modal-chip-val">{locationText}</span></div>
            </div>
          </div>
          {job.employmentType && <div className="modal-field"><span className="modal-label">Employment Type</span><span>{job.employmentType}</span></div>}
          {job.duration       && <div className="modal-field"><span className="modal-label">Duration</span><span>{job.duration}</span></div>}
          {job.experienceRequired && <div className="modal-field"><span className="modal-label">Experience Required</span><span>{job.experienceRequired}</span></div>}
          {job.deadline       && <div className="modal-field"><span className="modal-label">Deadline</span><span>{fmt(job.deadline)}</span></div>}
          <div className="modal-field modal-field-full">
            <span className="modal-label">Description</span>
            <p className="modal-text-block">{job.description || "No description provided."}</p>
          </div>
          {job.startDate && <div className="modal-field"><span className="modal-label">Posted On</span><span className="modal-muted">{fmt(job.startDate)}</span></div>}
        </div>

        <div className="modal-footer">
          <button className="btn-view" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const ApplicationManagement = () => {
  const [applications,        setApplications]        = useState([]);
  const [invitations,         setInvitations]         = useState([]);
  const [loadingApps,         setLoadingApps]         = useState(true);
  const [loadingInvs,         setLoadingInvs]         = useState(true);
  const [responding,          setResponding]          = useState({});
  const [activeFilter,        setActiveFilter]        = useState("all");
  const [searchQuery,         setSearchQuery]         = useState("");
  const [selectedJob,         setSelectedJob]         = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal,           setShowModal]           = useState(false);

  const handleCardClick = (application) => {
    setSelectedJob(application.job);
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
    setSelectedApplication(null);
  };

  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const res = await axios.get("http://localhost:5000/api/applications/my", { withCredentials: true });
      const raw = res.data?.data ?? res.data;
      setApplications(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load applications:", err);
      toast.error("Failed to load applications.");
    } finally { setLoadingApps(false); }
  }, []);

  const fetchInvitations = useCallback(async () => {
    setLoadingInvs(true);
    try {
      const res = await axios.get("http://localhost:5000/api/applications/invitations", { withCredentials: true });
      const raw = res.data?.data ?? res.data;
      setInvitations(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load invitations:", err);
      if (err.response?.status === 401) toast.error("Session expired. Please log in again.");
      else toast.error("Failed to load invitations.");
    } finally { setLoadingInvs(false); }
  }, []);

  useEffect( () => {
    const loadData = async () => {
      await fetchInvitations();
      await fetchApplications();
    };
    loadData();
  }, [fetchApplications, fetchInvitations]);

  // ── FIXED handleRespond with instant UI update ──────────────────────────
  const handleRespond = async (invitationId, action) => {
    setResponding(p => ({ ...p, [invitationId]: action }));
    
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${invitationId}/status`,
        { status: action === "accept" ? "accepted" : "rejected" },
        { withCredentials: true }
      );
      
      toast[action === "accept" ? "success" : "info"](
        action === "accept" ? "🎉 Invitation accepted!" : "Invitation rejected."
      );
      
      // Update UI instantly without refresh
      if (action === "accept") {
        // Find the accepted invitation
        const acceptedInv = invitations.find(inv => inv._id === invitationId);
        
        if (acceptedInv) {
          // Move accepted invite to applications with status "accepted"
          setApplications(prev => [
            ...prev,
            { ...acceptedInv, status: "accepted" }
          ]);
        }
        
        // Remove from invitations
        setInvitations(prev =>
          prev.filter(inv => inv._id !== invitationId)
        );
      } else if (action === "reject") {
        // For reject: just update status in invitations
        setInvitations(prev =>
          prev.map(inv =>
            inv._id === invitationId
              ? { ...inv, status: "rejected" }
              : inv
          )
        );
      }
      
      // Optional: Background refresh to ensure consistency
      await fetchInvitations();
      if (action === "accept") await fetchApplications();
      
    } catch (err) {
      console.error("Failed to respond:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResponding(p => { const c = { ...p }; delete c[invitationId]; return c; });
    }
  };

  const filterItems = () => {
    const q = searchQuery.toLowerCase();
    const match = item => {
      const title = (item.job?.title || "").toLowerCase();
      const loc   = `${item.job?.city || ""} ${item.job?.state || ""}`.toLowerCase();
      return !q || title.includes(q) || loc.includes(q);
    };
    const apps = applications.filter(match);
    const invs = invitations.filter(match);
    switch (activeFilter) {
      case "applied":  return { apps: apps.filter(a => a.status?.toLowerCase() !== "invited"), invs: [] };
      case "invited":  return { apps: [], invs };
      case "accepted": return {
        apps: apps.filter(a => a.status?.toLowerCase() === "accepted"),
        invs: invs.filter(i => i.status?.toLowerCase() === "accepted")
      };
      case "rejected": return {
        apps: apps.filter(a => a.status?.toLowerCase() === "rejected"),
        invs: invs.filter(i => i.status?.toLowerCase() === "rejected")
      };
      default:         return { apps, invs };
    }
  };

  const { apps: filteredApps, invs: filteredInvs } = filterItems();
  const isLoading  = loadingApps || loadingInvs;
  const totalShown = filteredApps.length + filteredInvs.length;

  return (
    <div className="layout">
      <Sidebar1 />
      <div className="main-content am-main">
        <ToastContainer position="top-right" autoClose={3000} />

        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <StatsCards applications={applications} invitations={invitations} />

        <div className="am-section">
          <div className="am-section-header">
            <div className="am-section-title-wrap">
              <div className="am-section-accent" />
              <h2 className="am-section-title">Active Applications</h2>
            </div>
            <span className="am-count-pill">{totalShown} results</span>
          </div>

          {isLoading ? (
            <div className="amc-grid">
              {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : totalShown === 0 ? (
            <div className="am-empty">
              <div className="am-empty-icon">🌱</div>
              <p className="am-empty-title">No applications found</p>
              <p className="am-empty-sub">Try a different filter or search term.</p>
            </div>
          ) : (
            <>
              {filteredApps.length > 0 && (
                <div className="amc-grid">
                  {filteredApps.map(app => (
                    <ApplicationCard key={app._id} app={app} onCardClick={handleCardClick} />
                  ))}
                </div>
              )}

              {filteredInvs.length > 0 && (
                <>
                  {filteredApps.length > 0 && (
                    <div className="am-divider"><span>Invitations</span></div>
                  )}
                  <div className="amc-grid">
                    {filteredInvs.map(inv => (
                      <InviteCard
                        key={inv._id}
                        inv={inv}
                        responding={responding}
                        onRespond={handleRespond}
                        onCardClick={handleCardClick}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <JobDetailsModal
        job={selectedJob}
        application={selectedApplication}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ApplicationManagement;