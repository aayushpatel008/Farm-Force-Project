import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from './sidebar';
import "./Applicationprovider.css";

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

/* ─── Helpers ─────────────────────────────────────────────────── */
const getAvatarColor = (str = "") => {
  const colors = ["green", "teal", "amber", "blue", "coral", "purple"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "??";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

/* ─── Extract worker from application ────────────────────────── */
const getWorker = (app) => app.applicant || app.worker || {};

/* ─── Header ─────────────────────────────────────────────────── */
const Header = ({ searchQuery, setSearchQuery }) => (
  <div className="am-header">
    <div className="am-header-left">
      <h1 className="am-page-title">Job Applications</h1>
      <p className="am-page-subtitle">Monitor and manage all applications received</p>
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
    { label: "Total Applications",    value: applications.length + invitations.length, icon: <TotalIcon /> },
    { label: "Received",  value: applied,            icon: <AppliedIcon /> },
    { label: "Offers Sent",  value: invitations.length, icon: <InvitedIcon /> },
    { label: "Hired", value: accepted,           icon: <AcceptedIcon /> },
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
   APPLICATION CARD - For worker-initiated applications (initiatedBy === "worker")
   Shows Accept/Reject buttons for pending applications
═══════════════════════════════════════════════════════════════ */
function ApplicationCard({ app, onCardClick, onAccept, onReject, isAccepting, isRejecting }) {
  const worker     = getWorker(app);
  const status     = app.status || "pending";
  const initiatedBy = app.initiatedBy; // Should be "worker" for this card

  const workerName   = worker.name || worker.fullName || `${worker.firstName || ""} ${worker.lastName || ""}`.trim() || "Unknown Worker";
  const workerRole   = worker.role || worker.jobTitle || worker.preferredRole || "Farm Worker";
  const workerLoc    = worker.location || worker.city || "—";
  const workerExp    = worker.experience || worker.experienceYears || worker.yearsOfExperience || worker.experienceRequired || "—";
  const workerSkills = Array.isArray(worker.skills) ? worker.skills : [];
  const availability = worker.availableFrom || worker.availability || null;

  const initials    = getInitials(workerName);
  const avatarColor = getAvatarColor(workerName);
  const appliedDate = formatDate(app.appliedAt || app.createdAt);

  const chips = workerSkills.length > 0 ? workerSkills : [workerRole].filter(Boolean);
  
  // Determine if we should show action buttons (only for pending status)
  const showActions = status.toLowerCase() === "pending";
  const isBusy = isAccepting || isRejecting;

  return (
    <div className="amc-card" onClick={() => onCardClick(app)}>
      <div className="amc-card__top">
        <div className={`amc-card__avatar avatar--${avatarColor}`}>{initials}</div>
        <div className="amc-card__identity">
          <h4 className="amc-card__name">{workerName}</h4>
          <p className="amc-card__role">{workerRole}</p>
        </div>
      </div>

      <div className="amc-card__details">
        <div className="amc-card__detail-row">
          {workerLoc !== "—" && (
            <span className="amc-card__detail-item">
              <span className="amc-card__detail-icon">📍</span>
              {workerLoc}
            </span>
          )}
          {workerExp !== "—" && (
            <span className="amc-card__detail-item">
              <span className="amc-card__detail-icon">🧑‍🌾</span>
              {workerExp} exp
            </span>
          )}
        </div>
        {availability && (
          <div className="amc-card__detail-row">
            <span className="amc-card__detail-item">
              <span className="amc-card__detail-icon">📅</span>
              Available from {formatDate(availability)}
            </span>
          </div>
        )}
      </div>

      <div className="amc-card__divider" />

      <div className="amc-card__chips">
        {chips.slice(0, 3).map((chip, i) => (
          <span key={i} className="amc-card__chip-tag">{chip}</span>
        ))}
      </div>

      <div className="amc-card__footer" onClick={e => e.stopPropagation()}>
        <span className="amc-card__applied-date">
          <span className="amc-card__detail-icon">📅</span>
          Applied: {appliedDate}
        </span>
        
        {showActions ? (
          <div className="amc-card__actions">
            <button
              className="amc-btn amc-btn--accept"
              onClick={() => onAccept(app._id)}
              disabled={isBusy}
            >
              {isAccepting
                ? <span className="amc-spinner amc-spinner--green" />
                : <><CheckIcon /> Accept</>}
            </button>
            <button
              className="amc-btn amc-btn--decline"
              onClick={() => onReject(app._id)}
              disabled={isBusy}
            >
              {isRejecting
                ? <span className="amc-spinner amc-spinner--red" />
                : <><XIcon /> Reject</>}
            </button>
          </div>
        ) : (
          <span className={`amc-status-badge amc-status-badge--${status.toLowerCase()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   OFFER CARD - For provider-initiated invitations (initiatedBy === "provider")
   Shows status badge only, no action buttons (matching the requirement)
═══════════════════════════════════════════════════════════════ */
function OfferCard({ inv, onCardClick }) {
  const worker = getWorker(inv);
  const status = inv.status || "pending";

  const workerName   = worker.name || worker.fullName || `${worker.firstName || ""} ${worker.lastName || ""}`.trim() || "Unknown Worker";
  const workerRole   = worker.role || worker.jobTitle || worker.preferredRole || "Farm Worker";
  const workerLoc    = worker.location || worker.city || "—";
  const workerExp    = worker.experience || worker.experienceYears || worker.yearsOfExperience || worker.experienceRequired || "—";
  const workerSkills = Array.isArray(worker.skills) ? worker.skills : [];
  const availability = worker.availableFrom || worker.availability || null;

  const initials    = getInitials(workerName);
  const avatarColor = getAvatarColor(workerName);
  const invitedDate = formatDate(inv.createdAt);

  const chips = workerSkills.length > 0 ? workerSkills : [workerRole].filter(Boolean);

  // Map status to display text
  const getStatusDisplay = () => {
    switch (status.toLowerCase()) {
      case "pending": return "Offer Sent";
      case "accepted": return "Accepted";
      case "rejected": return "Rejected";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const statusDisplay = getStatusDisplay();
  const statusClass = status.toLowerCase() === "pending" ? "invited" : status.toLowerCase();

  return (
    <div className="amc-card amc-card--invite" onClick={() => onCardClick(inv)}>
      <div className="amc-card__top">
        <div className={`amc-card__avatar avatar--${avatarColor}`}>{initials}</div>
        <div className="amc-card__identity">
          <h4 className="amc-card__name">{workerName}</h4>
          <p className="amc-card__role">{workerRole}</p>
        </div>
      </div>

      <div className="amc-card__details">
        <div className="amc-card__detail-row">
          {workerLoc !== "—" && (
            <span className="amc-card__detail-item">
              <span className="amc-card__detail-icon">📍</span>
              {workerLoc}
            </span>
          )}
          {workerExp !== "—" && (
            <span className="amc-card__detail-item">
              <span className="amc-card__detail-icon">🧑‍🌾</span>
              {workerExp} exp
            </span>
          )}
        </div>
        {availability && (
          <div className="amc-card__detail-row">
            <span className="amc-card__detail-item">
              <span className="amc-card__detail-icon">📅</span>
              Available from {formatDate(availability)}
            </span>
          </div>
        )}
      </div>

      <div className="amc-card__divider" />

      <div className="amc-card__chips">
        {chips.slice(0, 3).map((chip, i) => (
          <span key={i} className="amc-card__chip-tag">{chip}</span>
        ))}
      </div>

      <div className="amc-card__footer amc-card__footer--invite">
        <span className="amc-card__applied-date">
          <span className="amc-card__detail-icon">📅</span>
          Invited: {invitedDate}
        </span>
        <span className={`amc-status-badge amc-status-badge--${statusClass}`}>
          {statusDisplay}
        </span>
      </div>
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────── */
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

/* ═══════════════════════════════════════════════════════════════
   WORKER PROFILE MODAL - Shows full worker/applicant profile
═══════════════════════════════════════════════════════════════ */
const WorkerProfileModal = ({ application, isOpen, onClose }) => {
  if (!isOpen || !application) return null;

  const worker = getWorker(application);
  const status = application.status || "Pending";

  const workerName   = worker.name || worker.fullName || `${worker.firstName || ""} ${worker.lastName || ""}`.trim() || "Unknown Worker";
  const workerRole   = worker.role || worker.jobTitle || worker.preferredRole || "Farm Worker";
  const workerLoc    = worker.location || worker.city || "—";
  const workerExp    = worker.experience || worker.experienceYears || worker.yearsOfExperience || worker.experienceRequired || "—";
  const workerSkills = Array.isArray(worker.skills) ? worker.skills : [];
  const workerEmail  = worker.email || "—";
  const workerPhone  = worker.phone || worker.phoneNumber || "—";
  const workerDob    = worker.dateOfBirth || worker.dob || null;
  const workerGender = worker.gender || "—";
  const workerNat    = worker.nationality || "—";
  const workerEmerg  = worker.emergencyContact || "—";
  const workerDesc   = worker.description || worker.bio || worker.about || null;
  const availability = worker.availableFrom || worker.availability || null;
  const appliedDate  = formatDate(application.appliedAt || application.createdAt);
  const initials     = getInitials(workerName);
  const avatarColor  = getAvatarColor(workerName);

  const statusClass = (s = "") =>
    ({ Active:"active", Filled:"filled", Paused:"paused", Closed:"closed",
       Pending:"paused", Accepted:"active", Rejected:"closed", Invited:"filled" }[s] || "active");

  const fmt = (iso) => {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return iso; }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-view" onClick={e => e.stopPropagation()}>

        {/* Banner */}
        <div className="modal-view-banner">
          <div className="modal-view-banner-left">
            <div
              className="modal-view-icon"
              style={{
                background: `var(--avatar-${avatarColor}, rgba(255,255,255,0.12))`,
                fontSize: 20,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.5px"
              }}
            >
              {initials}
            </div>
            <div>
              <h2 className="modal-view-title">{workerName}</h2>
              <span className={`status-badge ${statusClass(status)}`}>{status}</span>
            </div>
          </div>
          <button className="modal-close modal-close-white" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body modal-view-body">

          {/* Quick info chips */}
          <div className="modal-chips modal-field-full">
            <div className="modal-chip">
              <span className="modal-chip-icon">📅</span>
              <div>
                <span className="modal-chip-label">Applied</span>
                <span className="modal-chip-val">{appliedDate}</span>
              </div>
            </div>
            <div className="modal-chip">
              <span className="modal-chip-icon">💼</span>
              <div>
                <span className="modal-chip-label">Role</span>
                <span className="modal-chip-val">{workerRole}</span>
              </div>
            </div>
            <div className="modal-chip">
              <span className="modal-chip-icon">🧑‍🌾</span>
              <div>
                <span className="modal-chip-label">Experience</span>
                <span className="modal-chip-val">{workerExp !== "—" ? `${workerExp}` : "—"}</span>
              </div>
            </div>
            <div className="modal-chip">
              <span className="modal-chip-icon">📍</span>
              <div>
                <span className="modal-chip-label">Location</span>
                <span className="modal-chip-val">{workerLoc}</span>
              </div>
            </div>
          </div>

          {/* Personal details */}
          {workerDob && (
            <div className="modal-field">
              <span className="modal-label">Date of Birth</span>
              <span>{fmt(workerDob)}</span>
            </div>
          )}
          {workerGender !== "—" && (
            <div className="modal-field">
              <span className="modal-label">Gender</span>
              <span>{workerGender}</span>
            </div>
          )}
          {workerNat !== "—" && (
            <div className="modal-field">
              <span className="modal-label">Nationality</span>
              <span>{workerNat}</span>
            </div>
          )}

          {/* Contact details */}
          {workerEmail !== "—" && (
            <div className="modal-field">
              <span className="modal-label">Email Address</span>
              <span>📧 {workerEmail}</span>
            </div>
          )}
          {workerPhone !== "—" && (
            <div className="modal-field">
              <span className="modal-label">Phone Number</span>
              <span>📱 {workerPhone}</span>
            </div>
          )}
          {workerEmerg !== "—" && (
            <div className="modal-field">
              <span className="modal-label">Emergency Contact</span>
              <span>🚨 {workerEmerg}</span>
            </div>
          )}

          {/* Availability */}
          {availability && (
            <div className="modal-field">
              <span className="modal-label">Available From</span>
              <span>{fmt(availability)}</span>
            </div>
          )}

          {/* Skills */}
          {workerSkills.length > 0 && (
            <div className="modal-field modal-field-full">
              <span className="modal-label">Skills</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {workerSkills.map((s, i) => (
                  <span key={i} className="amc-card__chip-tag">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* About / Bio */}
          {workerDesc && (
            <div className="modal-field modal-field-full">
              <span className="modal-label">About</span>
              <p className="modal-text-block">{workerDesc}</p>
            </div>
          )}

        </div>

        <div className="modal-footer">
          <button className="btn-view" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT - Applicationprovider
   Separates applications by initiatedBy field:
   - initiatedBy === "worker" -> Applications Received (with Accept/Reject)
   - initiatedBy === "provider" -> Offers Sent (status only)
═══════════════════════════════════════════════════════════════ */
const Applicationprovider = () => {
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState({});
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  // Fetch all applications from both endpoints and merge
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch worker-initiated applications (applications where worker applied)
      const appsRes = await axios.get(`http://localhost:5000/api/applications/provider`, { withCredentials: true });
      const workerApps = appsRes.data?.data ?? appsRes.data;
      
      // Fetch provider-initiated invitations (offers sent by provider)
      const invitesRes = await axios.get(`http://localhost:5000/api/applications/provider/invites`, { withCredentials: true });
      const providerInvites = invitesRes.data?.data ?? invitesRes.data;
      
      // Mark each application with its initiatedBy type
      const workerApplications = (Array.isArray(workerApps) ? workerApps : []).map(app => ({
        ...app,
        initiatedBy: app.initiatedBy || "worker"
      }));
      
      const providerApplications = (Array.isArray(providerInvites) ? providerInvites : []).map(inv => ({
        ...inv,
        initiatedBy: inv.initiatedBy || "provider"
      }));
      
      const all = [...workerApplications, ...providerApplications];
      setAllApplications(all);
    } catch (err) {
      console.error("Failed to load applications:", err);
      toast.error("Failed to load applications.");
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Handle accept for worker-initiated application
  const handleAccept = async (appId) => {
    setResponding(p => ({ ...p, [appId]: "accept" }));
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${appId}/status`,
        { status: "accepted" },
        { withCredentials: true }
      );
      toast.success("🎉 Applicant accepted successfully!");
      await fetchApplications();
    } catch (err) {
      console.error("Failed to accept:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResponding(p => { const c = { ...p }; delete c[appId]; return c; });
    }
  };

  // Handle reject for worker-initiated application
  const handleReject = async (appId) => {
    setResponding(p => ({ ...p, [appId]: "reject" }));
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${appId}/status`,
        { status: "rejected" },
        { withCredentials: true }
      );
      toast.info("Application rejected.");
      await fetchApplications();
    } catch (err) {
      console.error("Failed to reject:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResponding(p => { const c = { ...p }; delete c[appId]; return c; });
    }
  };

  // Filter and separate applications
  const getFilteredApplications = () => {
    const q = searchQuery.toLowerCase();
    const matchItem = (item) => {
      const worker = getWorker(item);
      const workerName = (worker.name || worker.fullName || "").toLowerCase();
      const workerRole = (worker.role || worker.jobTitle || worker.preferredRole || "").toLowerCase();
      const workerLoc = (worker.location || worker.city || "").toLowerCase();
      return !q || workerName.includes(q) || workerRole.includes(q) || workerLoc.includes(q);
    };

    let filtered = allApplications.filter(matchItem);
    
    // Apply tab filters
    switch (activeFilter) {
      case "applied":
        filtered = filtered.filter(a => a.initiatedBy === "worker");
        break;
      case "invited":
        filtered = filtered.filter(a => a.initiatedBy === "provider");
        break;
      case "accepted":
        filtered = filtered.filter(a => a.status?.toLowerCase() === "accepted");
        break;
      case "rejected":
        filtered = filtered.filter(a => a.status?.toLowerCase() === "rejected");
        break;
      default:
        // "all" - no additional filtering
        break;
    }
    
    // Separate into worker-initiated (applications received) and provider-initiated (offers sent)
    const receivedApps = filtered.filter(a => a.initiatedBy === "worker");
    const sentOffers = filtered.filter(a => a.initiatedBy === "provider");
    
    return { receivedApps, sentOffers };
  };

  const { receivedApps, sentOffers } = getFilteredApplications();
  const totalShown = receivedApps.length + sentOffers.length;

  // Check if a specific app is being responded to
  const isAccepting = (appId) => responding[appId] === "accept";
  const isRejecting = (appId) => responding[appId] === "reject";

  return (
    <div className="layout">
      <Sidebar/>
      <div className="main-content am-main">
        <ToastContainer position="top-right" autoClose={3000} />

        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <FilterTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        <StatsCards 
          applications={allApplications.filter(a => a.initiatedBy === "worker")} 
          invitations={allApplications.filter(a => a.initiatedBy === "provider")} 
        />

        <div className="am-section">
          {/* Applications Received Section - CONDITIONALLY RENDERED ONLY WHEN DATA EXISTS */}
          {receivedApps.length > 0 && (
            <>
              <div className="am-section-header">
                <div className="am-section-title-wrap">
                  <div className="am-section-accent" />
                  <h2 className="am-section-title">Applications Received</h2>
                </div>
                <span className="am-count-pill">{receivedApps.length} results</span>
              </div>

              {loading ? (
                <div className="amc-grid">
                  {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
                </div>
              ) : (
                <div className="amc-grid">
                  {receivedApps.map(app => (
                    <ApplicationCard
                      key={app._id}
                      app={app}
                      onCardClick={handleCardClick}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      isAccepting={isAccepting(app._id)}
                      isRejecting={isRejecting(app._id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Offers Sent Section - CONDITIONALLY RENDERED ONLY WHEN DATA EXISTS */}
          {sentOffers.length > 0 && (
            <div style={{ marginTop: receivedApps.length > 0 ? "2rem" : 0 }}>
              <div className="am-section-header">
                <div className="am-section-title-wrap">
                  <div className="am-section-accent" />
                  <h2 className="am-section-title">Offers Sent</h2>
                </div>
                <span className="am-count-pill">{sentOffers.length} results</span>
              </div>

              {loading ? (
                <div className="amc-grid">
                  {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
                </div>
              ) : (
                <div className="amc-grid">
                  {sentOffers.map(offer => (
                    <OfferCard
                      key={offer._id}
                      inv={offer}
                      onCardClick={handleCardClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <WorkerProfileModal
        application={selectedApplication}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Applicationprovider;