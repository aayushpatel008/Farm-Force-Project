import { useState, useEffect } from "react";
import axios from "axios";
import "./Browse.css";
import Sidebar from "./sidebar";
import { toast } from "react-toastify";

// ── Avatar colours ─────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#2d6a4f", "#1b4332", "#40916c", "#52b788",
  "#74c69d", "#1a3d22", "#277a2e", "#4caf58",
];

// ── Map one WorkerApplication doc → card + modal shape ────────────────────
const normaliseWorker = (a, index) => {
  const firstName = a.firstName || "";
  const lastName  = a.lastName  || "";
  const fullName  = `${firstName} ${lastName}`.trim() || "Unknown";
  const initials  = [firstName[0], lastName[0]]
                      .filter(Boolean)
                      .map(c => c.toUpperCase())
                      .join("") || "??";

  const available = a.availableFrom
    ? new Date(a.availableFrom) <= new Date()
    : true;

  const fmtDate = (d) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      });
    } catch { return String(d); }
  };

  return {
    // ── FIX 1: Always expose _id as the primary key ───────────────────────
    _id:              a._id,          // primary MongoDB ID
    id:               a._id,          // optional alias for UI (same value)
    // ── card fields ───────────────────────────────────────────
    name:             fullName,
    initials,
    rating:           a.rating   ?? 0,
    reviews:          a.reviews  ?? 0,
    experience:       a.experienceRequired || "—",
    location:         a.location || "—",
    skills:           Array.isArray(a.skills) ? a.skills : [],
    bio:              a.description || "",
    available,
    wage:             a.salaryRange || "—",
    wageNum:          parseInt((a.salaryRange || "0").replace(/\D/g, "")) || 0,
    color:            AVATAR_COLORS[index % AVATAR_COLORS.length],
    // ── modal — personal ──────────────────────────────────────
    firstName:        a.firstName        || "—",
    lastName:         a.lastName         || "—",
    dateOfBirth:      fmtDate(a.dateOfBirth) || "—",
    gender:           a.gender           || "—",
    nationality:      a.nationality      || "—",
    // ── modal — contact ───────────────────────────────────────
    email:            a.email            || "—",
    phone:            a.phone            || "—",
    emergencyContact: a.emergencyContact || "—",
    // ── modal — work ──────────────────────────────────────────
    jobTitle:         a.jobTitle         || "—",
    jobDuration:      a.jobDuration      || "—",
    employmentType:   a.employmentType   || "—",
    numberOfWorkers:  a.numberOfWorkers  ?? 1,
    salaryRange:      a.salaryRange      || null,
    experienceRequired: a.experienceRequired || "—",
    availableFrom:    fmtDate(a.availableFrom) || null,
    description:      a.description     || "",
    appliedDate:      fmtDate(a.createdAt) || "—",
  };
};

const skillOptions = ["Tractor Driving", "Harvesting", "Irrigation", "Livestock Handling"];

// ─────────────────────────────────────────────────────────────────────────────
// JOB SELECTOR MODAL
// ─────────────────────────────────────────────────────────────────────────────
function JobSelectorModal({ jobs, loadingJobs, onSelect, onClose }) {
  return (
    <div
      className="bw-modal-overlay"
      onClick={(e) => e.target.classList.contains("bw-modal-overlay") && onClose()}
    >
      <div className="bw-modal-card bw-jobsel-card" onClick={(e) => e.stopPropagation()}>

        {/* Banner */}
        <div className="bw-modal-banner">
          <div className="bw-modal-banner-left">
            <div className="bw-modal-avatar" style={{ background: "#277a2e" }}>🌾</div>
            <div>
              <h2 className="bw-modal-title">Select a Job</h2>
              <span className="bw-modal-role">Choose the job you want to invite this worker for</span>
            </div>
          </div>
          <button className="bw-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="bw-jobsel-body">
          {loadingJobs ? (
            <p className="bw-jobsel-empty">Loading your job postings…</p>
          ) : jobs.length === 0 ? (
            <p className="bw-jobsel-empty">No active job postings found. Please create a job first.</p>
          ) : (
            jobs.map((job) => (
              <button
                key={job._id}
                className="bw-jobsel-row"
                onClick={() => onSelect(job._id)}
              >
                <div className="bw-jobsel-row-left">
                  <span className="bw-jobsel-title">{job.title || "Untitled Job"}</span>
                  <span className="bw-jobsel-meta">
                    {[job.city, job.state].filter(Boolean).join(", ") || job.farmAddress || "—"}
                    {job.salary ? ` · ${job.salary}` : ""}
                  </span>
                </div>
                <span className="bw-jobsel-arrow">→</span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bw-modal-footer">
          <button className="bw-modal-btn-light" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BrowseWorkers() {
  const [search,         setSearch]         = useState("");
  const [minWage,        setMinWage]        = useState(0);
  const [maxWage,        setMaxWage]        = useState(2000);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [experience,     setExperience]     = useState("All");
  const [location,       setLocation]       = useState("");
  const [availability,   setAvailability]   = useState("All");
  const [filtersOpen,    setFiltersOpen]    = useState(false);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // ── Workers data ───────────────────────────────────────────────────────────
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Profile modal ──────────────────────────────────────────────────────────
  const [viewWorker, setViewWorker] = useState(null);

  // ── Invite state — keyed by worker _id ────────────────────────────────────
  // inviteStatus[_id]: 'idle' | 'selecting' | 'loading' | 'invited' | 'error'
  const [inviteStatus, setInviteStatus] = useState({});

  // ── Job selector modal ─────────────────────────────────────────────────────
  const [pendingWorkerId, setPendingWorkerId] = useState(null);
  const [providerJobs,    setProviderJobs]    = useState([]);
  const [loadingJobs,     setLoadingJobs]     = useState(false);

  // ── STEP 1: Add hired workers state ───────────────────────────────────────
  const [hiredWorkers, setHiredWorkers] = useState([]);

  // ── Fetch workers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const res  = await axios.get(
          "http://localhost:5000/api/Workercard",
          { withCredentials: true }
        );
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length === 0) throw new Error("empty");

        // Get logged-in user ID (adjust source if using context instead of localStorage)
        const userId = localStorage.getItem("userId");

        // Filter out self
        const filteredWorkers = data.filter(w => w._id !== userId);

        setWorkers(filteredWorkers.map(normaliseWorker));
      } catch (err) {
        console.error("Failed to load workers:", err);
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  // ── STEP 2: Add fetchHiredWorkers function ─────────────────────────────────
  const fetchHiredWorkers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/applications/my-hires",
        { withCredentials: true }
      );
      setHiredWorkers(res.data);
    } catch (err) {
      console.error("Failed to fetch hired workers", err);
    }
  };

  // ── STEP 3: Call fetchHiredWorkers in useEffect ────────────────────────────
  useEffect(() => {
    fetchHiredWorkers();
  }, []);

  // ── Step 1: Provider clicks "Hire" — fetch MY jobs fresh, then open modal ─
  // FIX 3: Accept only w._id here — never w.id or w._id || w.id
  const handleHireClick = async (workerId) => {
    if (
      inviteStatus[workerId] === "loading" ||
      inviteStatus[workerId] === "invited"
    ) return;

    setProviderJobs([]);
    setLoadingJobs(true);
    setPendingWorkerId(workerId);                                          // FIX 5: workerId === w._id
    setInviteStatus((prev) => ({ ...prev, [workerId]: "selecting" }));    // FIX 4: keyed by _id
    console.log("🔥 Hire clicked — workerId (_id):", workerId);

    try {
      const res = await axios.get(
        "http://localhost:5000/api/jobs/my",
        { withCredentials: true }
      );
      setProviderJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load provider jobs:", err);
      setProviderJobs([]);
      toast.error("Could not load your job postings. Please try again.");
    } finally {
      setLoadingJobs(false);
    }
  };

  // ── Step 2: Provider picks a job → fire the invite POST ───────────────────
  const handleJobSelect = async (jobId) => {
    const workerId = pendingWorkerId;   // FIX 5: always the MongoDB _id set in handleHireClick
    setPendingWorkerId(null);           // close modal

    if (!workerId || String(workerId).length < 10) {
      console.error("Invalid workerId — aborting invite:", workerId);
      toast.error("Invalid worker selected. Please try again.");
      setInviteStatus((prev) => ({ ...prev, [workerId]: "error" }));
      return;
    }

    // Get logged-in user ID
    const userId = localStorage.getItem("userId");

    // Extra safety: prevent self-invite
    if (workerId === userId) {
      console.error("Cannot invite yourself");
      toast.error("You cannot invite yourself");
      return;
    }

    setInviteStatus((prev) => ({ ...prev, [workerId]: "loading" }));      // FIX 4: keyed by _id

    // Debug logs
    console.log("Inviting worker:", workerId);
    console.log("Logged provider:", userId);

    // FIX 6: Debug log — workerId must be a 24-char hex MongoDB ObjectId
    console.log("Sending invite:", { workerId, jobId });

    try {
      await axios.post(
      "http://localhost:5000/api/applications/invite",
      {
        workerId,
        jobId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

      setInviteStatus((prev) => ({ ...prev, [workerId]: "invited" }));    // FIX 4: keyed by _id
      toast.success("Worker invited successfully!");
      
      // Refresh hired workers after successful invite
      await fetchHiredWorkers();

    } catch (err) {
      const status = err.response?.status;
      const msg =
        status === 409
          ? "Already invited or applied."
          : status === 401
          ? "Please log in to invite workers."
          : err.response?.data?.message || "Something went wrong.";

      setInviteStatus((prev) => ({ ...prev, [workerId]: "error" }));      // FIX 4: keyed by _id
      toast.error(msg);
    }
  };

  // ── STEP 4: Add revoke function ───────────────────────────────────────────
  const handleRevoke = async (jobId, workerId) => {
    try {
      await axios.delete(
        "http://localhost:5000/api/applications/revoke",
        {
          data: { jobId, workerId },
          withCredentials: true
        }
      );

      toast.success("Revoked successfully");

      // Update hiredWorkers state
      setHiredWorkers(prev =>
        prev.filter(h => !(h.jobId === jobId && h.workerId === workerId))
      );

      // Also reset inviteStatus for this worker
      setInviteStatus(prev => ({ ...prev, [workerId]: "idle" }));

    } catch (err) {
      console.error(err);
      toast.error("Failed to revoke");
    }
  };

  // ── Cancel job selector ────────────────────────────────────────────────────
  const handleJobSelectorClose = () => {
    if (pendingWorkerId) {
      setInviteStatus((prev) => ({ ...prev, [pendingWorkerId]: "idle" }));
    }
    setPendingWorkerId(null);
  };

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, minWage, maxWage, selectedSkills, experience, location, availability]);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = workers.filter((w) => {
    const wage = w.wageNum ?? parseInt((w.wage || "0").replace(/\D/g, "")) ?? 0;

    const matchSearch =
      !search ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      w.location.toLowerCase().includes(search.toLowerCase());

    const matchWage   = wage >= minWage && wage <= maxWage;

    const matchSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((s) => w.skills.includes(s));

    const workerExp = parseInt(w.experience);
    const matchExp  =
      experience === "All" ||
      (experience === "Beginner"     && workerExp <= 3) ||
      (experience === "Intermediate" && workerExp > 3 && workerExp <= 7) ||
      (experience === "Expert"       && workerExp > 7);

    const matchLoc =
      !location ||
      w.location.toLowerCase().includes(location.toLowerCase());

    const matchAvail =
      availability === "All" ||
      (availability === "Immediate"     &&  w.available) ||
      (availability === "Within a week" && !w.available);

    return matchSearch && matchWage && matchSkills && matchExp && matchLoc && matchAvail;
  });

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < Math.round(rating) ? "filled" : ""}`}>★</span>
    ));

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="bw-page">

      <Sidebar />

      <div className="bw-content">

        {/* ── SEARCH HERO ── */}
        <section className="bw-hero">
          <div className="bw-hero-glow" />
          <div className="bw-hero-inner">
            <p className="bw-hero-tag">🌾 Agricultural Talent Marketplace</p>
            <h1 className="bw-hero-title">Find Skilled Farm Workers</h1>
            <p className="bw-hero-sub">Connect with verified agricultural professionals across India</p>
            <div className="bw-search-wrap">
              <span className="bw-search-icon">🔍</span>
              <input
                className="bw-search-input"
                placeholder="Search for workers (e.g., tractor driver, harvester, laborer...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="bw-search-btn">Search</button>
            </div>
          </div>
        </section>

        {/* ── MAIN BODY ── */}
        <main className="bw-main">

          {/* LEFT: FILTERS */}
          <aside className={`bw-filters ${filtersOpen ? "mobile-open" : ""}`}>
            <div className="bw-filter-header">
              <span className="bw-filter-title">⚙ Filters</span>
              <button
                className="bw-filter-clear"
                onClick={() => {
                  setSelectedSkills([]);
                  setExperience("All");
                  setLocation("");
                  setAvailability("All");
                  setMinWage(0);
                  setMaxWage(2000);
                }}
              >
                Clear All
              </button>
            </div>

            <div className="bw-filter-section">
              <h4>Daily Wage (₹)</h4>
              <div className="bw-wage-row">
                <div className="bw-wage-field">
                  <label>Min</label>
                  <input
                    type="number"
                    value={minWage}
                    onChange={(e) => setMinWage(Number(e.target.value))}
                    min={0}
                  />
                </div>
                <span className="bw-wage-sep">—</span>
                <div className="bw-wage-field">
                  <label>Max</label>
                  <input
                    type="number"
                    value={maxWage}
                    onChange={(e) => setMaxWage(Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>
            </div>

            <div className="bw-filter-section">
              <h4>Skills</h4>
              {skillOptions.map((skill) => (
                <label key={skill} className="bw-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                  />
                  <span className="bw-checkbox-custom" />
                  {skill}
                </label>
              ))}
            </div>

            <div className="bw-filter-section">
              <h4>Experience Level</h4>
              <select
                className="bw-select"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option>All</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Expert</option>
              </select>
            </div>

            <div className="bw-filter-section">
              <h4>Location</h4>
              <input
                className="bw-text-input"
                placeholder="e.g. Gujarat, Punjab..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="bw-filter-section">
              <h4>Availability</h4>
              {["All", "Immediate", "Within a week"].map((opt) => (
                <label key={opt} className="bw-radio-label">
                  <input
                    type="radio"
                    name="availability"
                    checked={availability === opt}
                    onChange={() => setAvailability(opt)}
                  />
                  <span className="bw-radio-custom" />
                  {opt}
                </label>
              ))}
            </div>
          </aside>

          {/* RIGHT: WORKER CARDS */}
          <section className="bw-results">
            <div className="bw-results-meta">
              <span className="bw-results-count">
                {loading
                  ? <span>Loading workers…</span>
                  : <><strong>{filtered.length}</strong> workers found</>
                }
              </span>
            </div>

            <div className="bw-cards">

              {/* Loading skeletons */}
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div className="bw-card bw-card-skeleton" key={i}>
                    <div className="bw-skeleton-avatar" />
                    <div className="bw-skeleton-body">
                      <div className="bw-skeleton-line bw-skeleton-title" />
                      <div className="bw-skeleton-line bw-skeleton-sub"   />
                      <div className="bw-skeleton-line bw-skeleton-short" />
                    </div>
                  </div>
                ))

              /* Empty state */
              ) : filtered.length === 0 ? (
                <div className="bw-empty">
                  <p>🌱 No workers match your filters.</p>
                  <span>Try adjusting your search or filters.</span>
                </div>

              /* Worker cards */
              ) : (
                (() => {
                  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
                  const paginated  = filtered.slice(
                    (currentPage - 1) * ITEMS_PER_PAGE,
                    currentPage       * ITEMS_PER_PAGE
                  );

                  return paginated.map((w) => {
                    // ── STEP 5: Check if worker is hired ──────────────────────
                    const hired = hiredWorkers.find(h => h.workerId === w._id);
                    
                    return (
                      <div className="bw-card" key={w._id}>
                        <div className="bw-card-left">
                          <div className="bw-card-avatar" style={{ background: w.color }}>
                            {w.initials}
                          </div>
                          {w.available && (
                            <span className="bw-avail-dot" title="Available Now" />
                          )}
                        </div>

                        <div className="bw-card-body">
                          <div className="bw-card-top">
                            <div>
                              <h3 className="bw-card-name">{w.name}</h3>
                              <div className="bw-card-meta">
                                <span className="bw-card-loc">📍 {w.location}</span>
                                <span className="bw-card-exp">🌾 {w.experience}</span>
                                <span className={`bw-avail-badge ${w.available ? "yes" : "no"}`}>
                                  {w.available ? "● Available Now" : "● Within a week"}
                                </span>
                              </div>
                            </div>
                            <div className="bw-card-wage">{w.wage}</div>
                          </div>

                          {w.rating > 0 && (
                            <div className="bw-card-rating">
                              <div className="bw-stars">{renderStars(w.rating)}</div>
                              <span className="bw-rating-val">{w.rating}</span>
                              <span className="bw-reviews">({w.reviews} reviews)</span>
                            </div>
                          )}

                          {w.bio && <p className="bw-card-bio">{w.bio}</p>}

                          <div className="bw-card-skills">
                            {w.skills.map((s) => (
                              <span key={s} className="bw-skill-tag">{s}</span>
                            ))}
                          </div>

                          {/* ── CARD ACTIONS ── */}
                          <div className="bw-card-actions">

                            {/* STEP 5: Replace button with conditional Hire/Revoke */}
                            {hired ? (
                              <button
                                className="bw-btn-hire bw-btn-hire--error"
                                onClick={() => handleRevoke(hired.jobId, w._id)}
                              >
                                Revoke
                              </button>
                            ) : (
                              <button
                                className={`bw-btn-hire${
                                  inviteStatus[w._id] === "invited"
                                    ? " bw-btn-hire--done"
                                    : inviteStatus[w._id] === "error"
                                    ? " bw-btn-hire--error"
                                    : ""
                                }`}
                                onClick={() => handleHireClick(w._id)}
                                disabled={
                                  inviteStatus[w._id] === "loading"   ||
                                  inviteStatus[w._id] === "invited"   ||
                                  inviteStatus[w._id] === "selecting"
                                }
                              >
                                {inviteStatus[w._id] === "loading"
                                  ? "Inviting…"
                                  : inviteStatus[w._id] === "invited"
                                  ? "✓ Invited"
                                  : inviteStatus[w._id] === "selecting"
                                  ? "Selecting…"
                                  : "Hire"}
                              </button>
                            )}

                            <button
                              className="bw-btn-view"
                              onClick={() => setViewWorker(w)}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* ── PAGINATION ── */}
            {!loading && filtered.length > ITEMS_PER_PAGE && (() => {
              const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

              const getPages = () => {
                const pages = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage > 3) pages.push("...");
                  const start = Math.max(2, currentPage - 1);
                  const end   = Math.min(totalPages - 1, currentPage + 1);
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (currentPage < totalPages - 2) pages.push("...");
                  pages.push(totalPages);
                }
                return pages;
              };

              return (
                <div className="bw-pagination">
                  <button
                    className="bw-page-btn bw-page-arrow"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage(p => p - 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    ‹
                  </button>

                  {getPages().map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="bw-page-ellipsis">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`bw-page-btn ${currentPage === p ? "bw-page-active" : ""}`}
                        onClick={() => {
                          setCurrentPage(p);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className="bw-page-btn bw-page-arrow"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage(p => p + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    ›
                  </button>
                </div>
              );
            })()}
          </section>
        </main>
      </div>

      {/* ── JOB SELECTOR MODAL ── */}
      {pendingWorkerId && (
        <JobSelectorModal
          jobs={providerJobs}
          loadingJobs={loadingJobs}
          onSelect={handleJobSelect}
          onClose={handleJobSelectorClose}
        />
      )}

      {/* ── WORKER PROFILE MODAL ── */}
      {viewWorker && (
        <div className="bw-modal-overlay" onClick={() => setViewWorker(null)}>
          <div className="bw-modal-card" onClick={e => e.stopPropagation()}>

            <div className="bw-modal-banner">
              <div className="bw-modal-banner-left">
                <div className="bw-modal-avatar" style={{ background: viewWorker.color }}>
                  {viewWorker.initials}
                </div>
                <div>
                  <h2 className="bw-modal-title">
                    {viewWorker.firstName} {viewWorker.lastName}
                  </h2>
                  <span className="bw-modal-role">{viewWorker.jobTitle}</span>
                  <div className="bw-modal-meta">
                    {viewWorker.location !== "—" && (
                      <span>📍 {viewWorker.location}</span>
                    )}
                    {viewWorker.experienceRequired !== "—" && (
                      <span>🧑‍🌾 {viewWorker.experienceRequired} exp</span>
                    )}
                    {viewWorker.appliedDate && (
                      <span>📅 Applied {viewWorker.appliedDate}</span>
                    )}
                  </div>
                </div>
              </div>
              <button className="bw-modal-close" onClick={() => setViewWorker(null)}>✕</button>
            </div>

            <div className="bw-modal-scroll">

              <div className="bw-modal-row">
                <div className="bw-modal-section">
                  <div className="bw-modal-section-heading"><span>🪪</span> Personal Details</div>
                  <div className="bw-modal-divider" />
                  <div className="bw-modal-grid">
                    <div className="bw-modal-field">
                      <span className="bw-modal-label">FIRST NAME</span>
                      <span className="bw-modal-val">{viewWorker.firstName}</span>
                      <div className="bw-modal-field-divider" />
                    </div>
                    <div className="bw-modal-field">
                      <span className="bw-modal-label">LAST NAME</span>
                      <span className="bw-modal-val">{viewWorker.lastName}</span>
                      <div className="bw-modal-field-divider" />
                    </div>
                    <div className="bw-modal-field">
                      <span className="bw-modal-label">DATE OF BIRTH</span>
                      <span className="bw-modal-val">{viewWorker.dateOfBirth}</span>
                      <div className="bw-modal-field-divider" />
                    </div>
                    <div className="bw-modal-field">
                      <span className="bw-modal-label">GENDER</span>
                      <span className="bw-modal-val">{viewWorker.gender}</span>
                      <div className="bw-modal-field-divider" />
                    </div>
                    <div className="bw-modal-field">
                      <span className="bw-modal-label">NATIONALITY</span>
                      <span className="bw-modal-val">{viewWorker.nationality}</span>
                      <div className="bw-modal-field-divider" />
                    </div>
                    <div className="bw-modal-field">
                      <span className="bw-modal-label">LOCATION</span>
                      <span className="bw-modal-val">
                        <span className="bw-modal-icon">📍</span>
                        {viewWorker.location}
                      </span>
                      <div className="bw-modal-field-divider" />
                    </div>
                  </div>
                </div>

                <div className="bw-modal-section">
                  <div className="bw-modal-section-heading"><span>📞</span> Contact Information</div>
                  <div className="bw-modal-divider" />
                  <div className="bw-modal-single">
                    <div className="bw-modal-field">
                      <span className="bw-modal-label">EMAIL ADDRESS</span>
                      <span className="bw-modal-val">
                        <span className="bw-modal-icon">📧</span>
                        {viewWorker.email}
                      </span>
                      <div className="bw-modal-field-divider" />
                    </div>
                    <div className="bw-modal-field">
                      <span className="bw-modal-label">PHONE NUMBER</span>
                      <span className="bw-modal-val">
                        <span className="bw-modal-icon">📱</span>
                        {viewWorker.phone}
                      </span>
                      <div className="bw-modal-field-divider" />
                    </div>
                    <div className="bw-modal-field">
                      <span className="bw-modal-label">EMERGENCY CONTACT</span>
                      <span className="bw-modal-val">
                        <span className="bw-modal-icon">🚨</span>
                        {viewWorker.emergencyContact}
                      </span>
                      <div className="bw-modal-field-divider" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bw-modal-section bw-modal-section-full">
                <div className="bw-modal-section-heading"><span>💼</span> Work Details</div>
                <div className="bw-modal-divider" />

                <div className="bw-modal-field bw-modal-field-full">
                  <span className="bw-modal-label">JOB TITLE</span>
                  <span className="bw-modal-val">
                    <span className="bw-modal-icon">🧑‍🌾</span>
                    {viewWorker.jobTitle}
                  </span>
                  <div className="bw-modal-field-divider" />
                </div>

                <div className="bw-modal-grid">
                  <div className="bw-modal-field">
                    <span className="bw-modal-label">JOB DURATION</span>
                    <span className="bw-modal-val">
                      <span className="bw-modal-icon">⏱️</span>
                      {viewWorker.jobDuration}
                    </span>
                    <div className="bw-modal-field-divider" />
                  </div>
                  <div className="bw-modal-field">
                    <span className="bw-modal-label">EMPLOYMENT TYPE</span>
                    <span className="bw-modal-val">
                      <span className="bw-modal-icon">👥</span>
                      {viewWorker.employmentType}
                    </span>
                    <div className="bw-modal-field-divider" />
                  </div>
                  <div className="bw-modal-field">
                    <span className="bw-modal-label">WORKERS AVAILABLE</span>
                    <span className="bw-modal-val">
                      <span className="bw-modal-icon">🔢</span>
                      {viewWorker.numberOfWorkers ?? "—"}
                    </span>
                    <div className="bw-modal-field-divider" />
                  </div>
                  <div className="bw-modal-field">
                    <span className="bw-modal-label">EXPECTED SALARY</span>
                    <span className="bw-modal-val">
                      <span className="bw-modal-icon">💰</span>
                      {viewWorker.salaryRange || (
                        <em className="bw-modal-not-provided">Not provided</em>
                      )}
                    </span>
                    <div className="bw-modal-field-divider" />
                  </div>
                  <div className="bw-modal-field">
                    <span className="bw-modal-label">YEARS OF EXPERIENCE</span>
                    <span className="bw-modal-val">
                      <span className="bw-modal-icon">📅</span>
                      {viewWorker.experienceRequired}
                    </span>
                    <div className="bw-modal-field-divider" />
                  </div>
                  <div className="bw-modal-field">
                    <span className="bw-modal-label">AVAILABLE FROM</span>
                    <span className="bw-modal-val">
                      <span className="bw-modal-icon">📅</span>
                      {viewWorker.availableFrom || (
                        <em className="bw-modal-not-provided">Not provided</em>
                      )}
                    </span>
                    <div className="bw-modal-field-divider" />
                  </div>
                </div>

                {viewWorker.skills && viewWorker.skills.length > 0 && (
                  <div className="bw-modal-field bw-modal-field-full" style={{ marginTop: 8 }}>
                    <span className="bw-modal-label">SKILLS</span>
                    <div className="bw-modal-skills-row">
                      {viewWorker.skills.map((s, i) => (
                        <span className="bw-modal-skill-tag" key={i}>{s}</span>
                      ))}
                    </div>
                    <div className="bw-modal-field-divider" />
                  </div>
                )}
              </div>

              {viewWorker.description && (
                <div className="bw-modal-section bw-modal-section-full">
                  <div className="bw-modal-section-heading"><span>📝</span> About Me</div>
                  <div className="bw-modal-divider" />
                  <p className="bw-modal-bio">{viewWorker.description}</p>
                </div>
              )}
            </div>

            <div className="bw-modal-footer">
              <button className="bw-modal-btn-light" onClick={() => setViewWorker(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}