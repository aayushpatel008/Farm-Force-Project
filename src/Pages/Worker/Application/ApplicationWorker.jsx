import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar1 from "../Sidebar";
import "./ApplicationWorker.css";

/* ─── Icons ─────────────────────────────────────── */
const IconHome = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconBriefcase = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconInbox = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);
const IconClipboard = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="12" y1="11" x2="16" y2="11" />
    <line x1="12" y1="15" x2="16" y2="15" />
    <line x1="8" y1="11" x2="8.01" y2="11" />
    <line x1="8" y1="15" x2="8.01" y2="15" />
  </svg>
);

/* ─── Skeleton Card ──────────────────────────────── */
const SkeletonCard = () => (
  <div className="wd-skeleton-card">
    <div className="wd-skeleton-top">
      <div className="wd-skeleton-lines">
        <div className="wd-skeleton-line wd-skeleton-title" />
        <div className="wd-skeleton-line wd-skeleton-meta" />
        <div className="wd-skeleton-line wd-skeleton-meta wd-skeleton-meta--short" />
      </div>
      <div className="wd-skeleton-badge" />
    </div>
    <div className="wd-skeleton-footer" />
  </div>
);

/* ─── Empty State ────────────────────────────────── */
const EmptyState = ({ icon, title, sub }) => (
  <div className="wd-empty">
    <div className="wd-empty-icon">{icon}</div>
    <p className="wd-empty-title">{title}</p>
    <p className="wd-empty-sub">{sub}</p>
  </div>
);

/* ─── Status Badge ───────────────────────────────── */
const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase();
  return <span className={`wd-badge wd-badge--${key}`}>{status}</span>;
};

/* ─── Application Card ───────────────────────────── */
const ApplicationCard = ({ app, index }) => (
  <div className="wd-card" style={{ animationDelay: `${index * 80}ms` }}>
    <div className="wd-card-accent" />
    <div className="wd-card-body">
      <div className="wd-card-top">
        <div className="wd-card-info">
          <h3 className="wd-job-title">
            {app.job?.title || app.job?.jobTitle || "Job"}
          </h3>
          <div className="wd-meta">
            <span className="wd-meta-item">
              <IconHome />
              {app.provider?.farmName || app.provider?.name || "Farm"}
            </span>
            <span className="wd-meta-item">
              <IconPin />
              {app.job?.location || "Location not specified"}
            </span>
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>
      {app.createdAt && (
        <div className="wd-card-footer">
          <span className="wd-date-label">
            Applied{" "}
            {new Date(app.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </div>
      )}
    </div>
  </div>
);

/* ─── Invite Card ────────────────────────────────── */
const InviteCard = ({ inv, responding, onRespond, index }) => {
  const id = inv._id;
  const isAccepting = responding[id] === "accept";
  const isRejecting = responding[id] === "reject";
  const isBusy = !!responding[id];

  return (
    <div className="wd-card wd-card--invite" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="wd-invite-ribbon">
        <IconMail />
        <span>Farm Invitation</span>
      </div>
      <div className="wd-card-body">
        <div className="wd-card-top" style={{ paddingTop: "14px" }}>
          <div className="wd-card-info">
            <h3 className="wd-job-title">
              {inv.job?.title || inv.job?.jobTitle || "Job"}
            </h3>
            <div className="wd-meta">
              <span className="wd-meta-item">
                <IconHome />
                {inv.provider?.farmName || inv.provider?.name || inv.recruiter?.name || "Farm"}
              </span>
              <span className="wd-meta-item">
                <IconPin />
                {inv.job?.location || "Location not specified"}
              </span>
            </div>
            {/* Display invitation message if available */}
            {inv.message && (
              <p className="wd-invite-message">{inv.message}</p>
            )}
          </div>
        </div>
        {inv.createdAt && (
          <div className="wd-invite-date">
            Invited{" "}
            {new Date(inv.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </div>
        )}
        <div className="wd-card-actions">
          <button
            className="wd-btn wd-btn--accept"
            onClick={() => onRespond(id, "accept")}
            disabled={isBusy}
          >
            {isAccepting
              ? <span className="wd-btn-spinner wd-btn-spinner--white" />
              : <><IconCheck /><span>Accept</span></>}
          </button>
          <button
            className="wd-btn wd-btn--reject"
            onClick={() => onRespond(id, "reject")}
            disabled={isBusy}
          >
            {isRejecting
              ? <span className="wd-btn-spinner wd-btn-spinner--red" />
              : <><IconX /><span>Decline</span></>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Section Header ─────────────────────────────── */
const ApplicationsHeader = ({ title, subtitle, count, countLabel, tag }) => (
  <div className="wd-section-header">
    <div className="wd-section-header-left">
      <div className="wd-title-row">
        <h2 className="wd-section-title">{title}</h2>
        {tag && <span className="wd-important-tag">{tag}</span>}
      </div>
      <p className="wd-section-sub">{subtitle}</p>
    </div>
    {count > 0 && (
      <span className="wd-pill wd-pill--green">
        {count} {countLabel}{count !== 1 ? "s" : ""}
      </span>
    )}
  </div>
);

/* ─── Invite Section ─────────────────────────────── */
const InviteSection = ({ invitations, loading, error, responding, onRespond }) => (
  <section className="wd-section">
    <ApplicationsHeader
      title="Job Invites"
      subtitle="Farms have personally invited you to these positions"
      count={invitations.length}
      countLabel="Pending Invite"
      tag="Important"
    />
    {loading ? (
      <div className="wd-grid">
        {[1, 2].map((i) => <SkeletonCard key={i} />)}
      </div>
    ) : error ? (
      /* ── Error state: shown when fetch fails (e.g. 401 / network) ── */
      <EmptyState
        icon={<IconInbox />}
        title="Could not load invitations"
        sub={error}
      />
    ) : invitations.length === 0 ? (
      <EmptyState
        icon={<IconInbox />}
        title="No invitations available"
        sub="When farms invite you to a job, they'll show up here."
      />
    ) : (
      <div className="wd-grid">
        {invitations.map((inv, i) => (
          <InviteCard
            key={inv._id}
            inv={inv}
            index={i}
            responding={responding}
            onRespond={onRespond}
          />
        ))}
      </div>
    )}
  </section>
);

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
const ApplicationWorker = () => {
  const [applications,    setApplications]    = useState([]);
  const [invitations,     setInvitations]     = useState([]);
  const [loadingApps,     setLoadingApps]     = useState(true);
  const [loadingInvs,     setLoadingInvs]     = useState(true);
  const [invitationsError, setInvitationsError] = useState(null); // NEW: error state for invites
  const [responding,      setResponding]      = useState({});

  // ── Fetch applied jobs ────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/applications/my",
        { withCredentials: true }
      );
      const raw = res.data?.data ?? res.data;
      setApplications(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load applications:", err);
      toast.error("Failed to load applications.");
    } finally {
      setLoadingApps(false);
    }
  }, []);

  // ── NEW: Fetch invitations from dedicated endpoint ────────────────────
  // Uses GET /api/applications/invitations (the new canonical endpoint).
  // This ensures invitations persist on every refresh — no more relying on
  // fragile frontend splits or the stale /api/invite/my endpoint.
  const fetchInvitations = useCallback(async () => {
    setLoadingInvs(true);
    setInvitationsError(null); // clear any previous error before re-fetching

    try {
      const res = await axios.get(
        "http://localhost:5000/api/applications/invitations",
        { withCredentials: true }
      ); 

      // Handle both { data: [...] } envelope and bare array responses
      const raw = res.data?.data ?? res.data;
      setInvitations(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load invitations:", err);

      // 401 → user not logged in; show a friendly, specific message
      if (err.response?.status === 401) {
        setInvitationsError("Please log in to view your invitations.");
        toast.error("Session expired. Please log in again.");
      } else {
        setInvitationsError("Unable to load invitations. Please try again later.");
        toast.error("Failed to load invitations.");
      }
    } finally {
      setLoadingInvs(false);
    }
  }, []);

  // ── Fire both fetches on mount (fresh backend data every page load) ───
  useEffect(() => {
    fetchApplications();
    fetchInvitations(); // NEW: replaces old /api/invite/my call
  }, [fetchApplications, fetchInvitations]);

  // ── Respond to invite (accept / reject) ──────────────────────────────
  // After any action, we re-fetch invitations from the server so the UI
  // stays authoritative — not reliant on optimistic frontend-only state.
  const handleRespond = async (invitationId, action) => {
    setResponding((p) => ({ ...p, [invitationId]: action }));
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${invitationId}/status`,
        { status: action === "accept" ? "accepted" : "rejected" },
        { withCredentials: true }
      );
      toast[action === "accept" ? "success" : "info"](
        action === "accept" ? "🎉 Invitation accepted!" : "Invitation declined."
      );

      // Re-fetch invitations from backend (state-sync fix: don't trust local filter alone)
      await fetchInvitations();

      // If accepted, re-fetch applications so it appears in "Applied Jobs"
      if (action === "accept") fetchApplications();
    } catch (err) {
      console.error("Failed to respond to invitation:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResponding((p) => {
        const copy = { ...p };
        delete copy[invitationId];
        return copy;
      });
    }
  };

  return (
    <div className="layout">
      <Sidebar1 />

      <div className="main-content worker-content">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

        {/* Hero bar */}
        <div className="wd-page-hero">
          <div className="wd-hero-icon">
            <IconBriefcase />
          </div>
          <div>
            <h1 className="wd-page-title">My Applications</h1>
            <p className="wd-page-sub">Manage all your job activity in one place</p>
          </div>
        </div>

        {/* Applied Jobs */}
        <section className="wd-section">
          <ApplicationsHeader
            title="Applied Jobs"
            subtitle="Track the status of all your job applications"
            count={applications.length}
            countLabel="Application"
          />
          {loadingApps ? (
            <div className="wd-grid">
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : applications.length === 0 ? (
            <EmptyState
              icon={<IconClipboard />}
              title="No applications yet"
              sub="Jobs you apply to will appear here."
            />
          ) : (
            <div className="wd-grid">
              {applications.map((app, i) => (
                <ApplicationCard key={app._id} app={app} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Invites — now driven by /api/applications/invitations */}
        <InviteSection
          invitations={invitations}
          loading={loadingInvs}
          error={invitationsError}   // NEW: pass error down for display
          responding={responding}
          onRespond={handleRespond}
        />
      </div>
    </div>
  );
};

export default ApplicationWorker;