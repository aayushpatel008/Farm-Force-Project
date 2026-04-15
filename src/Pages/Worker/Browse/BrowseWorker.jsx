import { useState, useEffect } from "react";
import axios from "axios";
import "./BrowseWorker.css";
import Sidebar1 from "../Sidebar";
import { toast } from "react-toastify";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

const AVATAR_COLORS = ["#2d6a4f", "#1b4332", "#40916c", "#74c69d", "#52b788", "#1f4d2a"];
const getColor = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getTags = (category = "", title = "") => {
  const src = (category + " " + title).toLowerCase();
  const tags = [];
  if (src.includes("tractor") || src.includes("driver"))  tags.push("Tractor Driving");
  if (src.includes("harvest"))                             tags.push("Harvesting");
  if (src.includes("irrigat"))                             tags.push("Irrigation");
  if (src.includes("livestock") || src.includes("dairy")) tags.push("Livestock Handling");
  if (src.includes("plant"))                               tags.push("Planting");
  if (src.includes("spray"))                               tags.push("Spraying");
  if (src.includes("weed"))                                tags.push("Weeding");
  if (src.includes("sort"))                                tags.push("Sorting");
  if (tags.length === 0) tags.push(category || "General");
  if (!tags.includes("No Experience") && /no.?exp/i.test(src)) tags.push("No Experience");
  return tags;
};

const getBadge = (job) => {
  if (job.status === "urgent") return { label: "Urgent",     bg: "#fef3c7", text: "#92400e" };
  if (job.status === "new")    return { label: "New",        bg: "#dbeafe", text: "#1e40af" };
  if (job.status === "open")   return { label: "Hiring Now", bg: "#d1fae5", text: "#065f46" };
  return                              { label: "Open",       bg: "#ede9fe", text: "#5b21b6" };
};

const normaliseExp = (exp = "") => {
  if (!exp || /no.?exp/i.test(exp)) return "No Experience";
  if (/1/i.test(exp))               return "1+ Year";
  if (/2/i.test(exp))               return "2+ Years";
  return exp;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

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

const SKILLS_LIST          = ["Tractor Driving", "Harvesting", "Irrigation", "Livestock Handling"];
const AVAILABILITY_OPTIONS = ["Now", "This Week", "This Month"];

// ─────────────────────────────────────────────────────────────
// JOB DETAIL MODAL  (wja-modal-*)
// ─────────────────────────────────────────────────────────────

function JobDetailModal({ job, onClose }) {
  if (!job) return null;

  const tag          = getTag(job.jobCategory, job.title);
  const initials     = getInitials(job.farmName || "");
  const avatarColor  = getColor(job.farmName || "");
  const locationText =
    [job.city, job.state].filter(Boolean).join(", ") || job.farmAddress || "—";

  return (
    <div
      className="wja-modal-overlay"
      onClick={(e) =>
        e.target.classList.contains("wja-modal-overlay") && onClose()
      }
    >
      <div className="wja-modal">

        {/* Banner */}
        <div className="wja-modal__banner">
          <div className="wja-modal__banner-left">
            <div className="wja-modal__avatar" style={{ background: avatarColor }}>
              {initials}
            </div>
            <div>
              <h2 className="wja-modal__name">{job.title}</h2>
              <span className="wja-modal__role-label">{job.farmName}</span>
              <div className="wja-modal__banner-meta">
                {locationText && locationText !== "—" && <span>📍 {locationText}</span>}
                {job.jobCategory && <span>🌾 {job.jobCategory}</span>}
                {job.status      && <span>✅ {job.status}</span>}
              </div>
            </div>
          </div>
          <button className="wja-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Scrollable body */}
        <div className="wja-modal__scroll">

          {/* Row 1: Role Overview + Pay side by side */}
          <div className="wja-modal__row">

            {/* Role Overview */}
            <div className="wja-modal__section">
              <div className="wja-modal__section-heading"><span>💼</span> Role Overview</div>
              <div className="wja-modal__section-divider" />
              <div className="wja-modal__fields-grid">
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">CATEGORY</span>
                  <span className="wja-modal__field-val">{job.jobCategory || "—"}</span>
                  <div className="wja-modal__field-line" />
                </div>
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">EMPLOYMENT TYPE</span>
                  <span className="wja-modal__field-val">{job.employmentType || "—"}</span>
                  <div className="wja-modal__field-line" />
                </div>
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">WORKERS NEEDED</span>
                  <span className="wja-modal__field-val">{job.workersNeeded ?? "—"}</span>
                  <div className="wja-modal__field-line" />
                </div>
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">EXPERIENCE</span>
                  <span className="wja-modal__field-val">{job.experienceRequired || "Open to all"}</span>
                  <div className="wja-modal__field-line" />
                </div>
              </div>
            </div>

            {/* Pay & Schedule */}
            <div className="wja-modal__section">
              <div className="wja-modal__section-heading"><span>💰</span> Pay &amp; Schedule</div>
              <div className="wja-modal__section-divider" />
              <div className="wja-modal__fields-single">
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">SALARY</span>
                  <span className="wja-modal__field-val">
                    <span className="wja-modal__field-icon">💰</span>
                    {job.salary || "—"}
                  </span>
                  <div className="wja-modal__field-line" />
                </div>
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">PAY TYPE</span>
                  <span className="wja-modal__field-val">{job.payType || "—"}</span>
                  <div className="wja-modal__field-line" />
                </div>
                <div className="wja-modal__field">
                  <span className="wja-modal__field-label">DURATION</span>
                  <span className="wja-modal__field-val">
                    <span className="wja-modal__field-icon">⏱️</span>
                    {job.duration || "—"}
                  </span>
                  <div className="wja-modal__field-line" />
                </div>
              </div>
            </div>
          </div>

          {/* Location & Dates — full width */}
          <div className="wja-modal__section wja-modal__section--full">
            <div className="wja-modal__section-heading"><span>📍</span> Location &amp; Dates</div>
            <div className="wja-modal__section-divider" />

            <div className="wja-modal__fields-grid">
              <div className="wja-modal__field">
                <span className="wja-modal__field-label">CITY / VILLAGE</span>
                <span className="wja-modal__field-val">
                  <span className="wja-modal__field-icon">📍</span>
                  {job.city || "—"}
                </span>
                <div className="wja-modal__field-line" />
              </div>
              <div className="wja-modal__field">
                <span className="wja-modal__field-label">STATE</span>
                <span className="wja-modal__field-val">{job.state || "—"}</span>
                <div className="wja-modal__field-line" />
              </div>
              <div className="wja-modal__field">
                <span className="wja-modal__field-label">START DATE</span>
                <span className="wja-modal__field-val">
                  <span className="wja-modal__field-icon">📅</span>
                  {formatDate(job.startDate)}
                </span>
                <div className="wja-modal__field-line" />
              </div>
              <div className="wja-modal__field">
                <span className="wja-modal__field-label">END DATE</span>
                <span className="wja-modal__field-val">
                  <span className="wja-modal__field-icon">📅</span>
                  {formatDate(job.endDate)}
                </span>
                <div className="wja-modal__field-line" />
              </div>
              <div className="wja-modal__field">
                <span className="wja-modal__field-label">APPLICATION DEADLINE</span>
                <span className="wja-modal__field-val">
                  <span className="wja-modal__field-icon">⏰</span>
                  {job.deadline
                    ? formatDate(job.deadline)
                    : <em className="wja-modal__not-provided">Not specified</em>}
                </span>
                <div className="wja-modal__field-line" />
              </div>
              <div className="wja-modal__field">
                <span className="wja-modal__field-label">STATUS</span>
                <span className="wja-modal__field-val">{job.status || "—"}</span>
                <div className="wja-modal__field-line" />
              </div>
            </div>

            <div className="wja-modal__field wja-modal__field--fullw" style={{ marginTop: 4 }}>
              <span className="wja-modal__field-label">FARM ADDRESS</span>
              <span className="wja-modal__field-val">{job.farmAddress || "—"}</span>
              <div className="wja-modal__field-line" />
            </div>

            {/* Tag chips */}
            <div className="wja-modal__field wja-modal__field--fullw" style={{ marginTop: 8 }}>
              <span className="wja-modal__field-label">JOB TYPE</span>
              <div className="wja-modal__chips-row">
                {[getTag(job.jobCategory, job.title).label, job.employmentType, job.payType]
                  .filter(Boolean)
                  .map((chip, i) => (
                    <span key={i} className="wja-modal__chip-pill">{chip}</span>
                  ))}
              </div>
              <div className="wja-modal__field-line" />
            </div>
          </div>

          {/* About the Role */}
          {job.description && (
            <div className="wja-modal__section wja-modal__section--full">
              <div className="wja-modal__section-heading"><span>📝</span> About the Role</div>
              <div className="wja-modal__section-divider" />
              <p className="wja-modal__bio">{job.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wja-modal__footer">
          <button className="wja-modal__btn-light" onClick={onClose}>Close</button>
          <button className="wja-modal__btn-primary">Apply Now</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export default function Browsejob() {
  // ── Backend data
  const [jobPostings, setJobPostings] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // ── UI state
  const [searchQuery,          setSearchQuery]          = useState("");
  const [expandedJob,          setExpandedJob]          = useState(null);
  const [minWage,              setMinWage]              = useState(0);
  const [maxWage,              setMaxWage]              = useState(2000);
  const [selectedSkills,       setSelectedSkills]       = useState([]);
  const [experienceLevel,      setExperienceLevel]      = useState("All");
  const [location,             setLocation]             = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState([]);

  // ── Apply state — keyed by job._id
  // applyStatus[id]: 'idle' | 'loading' | 'applied' | 'error'
  const [applyStatus, setApplyStatus] = useState({});
  
  // ── Applied jobs state (stores job IDs that user has applied to)
  const [appliedJobs, setAppliedJobs] = useState([]);

  // ── Job detail modal
  const [selectedJob, setSelectedJob] = useState(null);

  // ── Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  // ── Fetch jobs
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/active/ActiveJobPosting", { withCredentials: true })
      .then((res) => setJobPostings(res.data))
      .catch((err) => console.error("Failed to load jobs:", err))
      .finally(() => setLoadingJobs(false));
  }, []);

  // ── Fetch applied jobs from backend
  const fetchAppliedJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/applications/my-applied", { 
        withCredentials: true 
      });
      const raw = res.data?.data ?? res.data;
      setAppliedJobs(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to load applied jobs:", err);
      toast.error("Failed to load applied jobs.");
    }
  };

  // ── Cancel application handler
  const handleCancel = async (jobId) => {
    try {
      await axios.delete(`http://localhost:5000/api/applications/cancel/${jobId}`, { 
        withCredentials: true 
      });
      
      // Update appliedJobs state after successful cancellation
      setAppliedJobs(prev => prev.filter(id => id !== jobId));
      
      // Update applyStatus for this job
      setApplyStatus(prev => ({ ...prev, [jobId]: "idle" }));
      
      toast.success("Application cancelled successfully.");
    } catch (err) {
      console.error("Failed to cancel application:", err);
      toast.error("Failed to cancel application.");
    }
  };

  // ── Load applied jobs on component mount
  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  // ── Apply handler (updated to refresh applied jobs)
  const handleApply = async (jobId) => {
    if (applyStatus[jobId] === "loading" || applyStatus[jobId] === "applied") return;

    setApplyStatus((prev) => ({ ...prev, [jobId]: "loading" }));

    try {
      await axios.post(
        `http://localhost:5000/api/applications/apply/${jobId}`,
        {},
        { withCredentials: true }
      );

      setApplyStatus((prev) => ({ ...prev, [jobId]: "applied" }));
      toast.success("Applied successfully!");
      
      // Refresh applied jobs list
      await fetchAppliedJobs();

    } catch (err) {
      const status = err.response?.status;
      const msg =
        status === 409
          ? "You have already applied."
          : status === 401
          ? "Please log in to apply."
          : err.response?.data?.message || "Something went wrong.";

      setApplyStatus((prev) => ({ ...prev, [jobId]: "error" }));
      toast.error(msg);
    }
  };

  // ── Filter helpers
  const toggleSkill = (skill) =>
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );

  const toggleAvailability = (val) =>
    setSelectedAvailability((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );

  const clearAll = () => {
    setMinWage(0);
    setMaxWage(2000);
    setSelectedSkills([]);
    setExperienceLevel("All");
    setLocation("");
    setSelectedAvailability([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // ── Normalise jobs for display/filtering — original fields preserved via spread
  const normalisedJobs = jobPostings.map((job) => {
    const wageNum = parseInt((job.salary || "0").replace(/[^\d]/g, ""), 10) || 0;
    const tags    = getTags(job.jobCategory, job.title);
    const badge   = getBadge(job);
    const exp     = normaliseExp(job.experienceRequired);
    return {
      ...job,
      _initials : getInitials(job.farmName || ""),
      _color    : getColor(job.farmName || ""),
      _wageNum  : wageNum,
      _tags     : tags,
      _badge    : badge,
      _exp      : exp,
      _location :
        [job.city, job.state].filter(Boolean).join(", ") ||
        job.farmAddress ||
        "—",
    };
  });

  // ── Filter
  const filteredJobs = normalisedJobs.filter((job) => {
    if (job._wageNum < minWage || job._wageNum > maxWage) return false;
    if (selectedSkills.length && !selectedSkills.some((s) => job._tags.includes(s)))
      return false;
    if (experienceLevel !== "All" && job._exp !== experienceLevel) return false;
    if (location && !job._location.toLowerCase().includes(location.toLowerCase()))
      return false;
    if (
      selectedAvailability.length &&
      job.availability &&
      !selectedAvailability.includes(job.availability)
    )
      return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (job.title    || "").toLowerCase().includes(q) ||
        (job.farmName || "").toLowerCase().includes(q) ||
        job._tags.some((t) => t.toLowerCase().includes(q)) ||
        job._location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // ── Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, minWage, maxWage, selectedSkills, experienceLevel, location, selectedAvailability]);

  const totalPages      = Math.ceil(filteredJobs.length / jobsPerPage);
  const indexOfLastJob  = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs     = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="agri-jm__root">
      <Sidebar1 />

      {/* Hero */}
      <section className="agri-jm__hero-worker">
        <div className="agri-jm__hero-worker-overlay" />
        <div className="agri-jm__hero-worker-content">
          <div className="agri-jm__hero-worker-pill">🇮🇳 Trusted by 12,000+ farm workers</div>
          <h1 className="agri-jm__hero-worker-title">
            Find Farm Jobs <span className="agri-jm__hero-worker-accent">Near You</span>
          </h1>
          <p className="agri-jm__hero-worker-sub">
            Browse verified agricultural jobs across India — daily wages, flexible durations
          </p>
          <div className="agri-jm__search-worker-bar">
            <span className="agri-jm__search-worker-icon">🔍</span>
            <input
              className="agri-jm__search-worker-input"
              placeholder="Search jobs (e.g., tractor driver, harvesting, irrigation...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="agri-jm__search-worker-btn">Search</button>
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <div className="agri-jm__main-layout">

        {/* ── SIDEBAR ── */}
        <aside className="agri-jm__sidebar">
          <div className="agri-jm__sb-header">
            <span className="agri-jm__sb-title">
              <span className="agri-jm__sb-icon">⚙</span> Filters
            </span>
            <button className="agri-jm__sb-clear" onClick={clearAll}>Clear All</button>
          </div>

          <div className="agri-jm__sb-divider" />

          <div className="agri-jm__sb-block">
            <div className="agri-jm__sb-label">Daily Wage (₹)</div>
            <div className="agri-jm__sb-wage-row">
              <div className="agri-jm__sb-wage-col">
                <span className="agri-jm__sb-wage-sub">MIN</span>
                <input
                  className="agri-jm__sb-wage-input"
                  type="number"
                  value={minWage}
                  onChange={(e) => setMinWage(Number(e.target.value))}
                />
              </div>
              <span className="agri-jm__sb-wage-dash">—</span>
              <div className="agri-jm__sb-wage-col">
                <span className="agri-jm__sb-wage-sub">MAX</span>
                <input
                  className="agri-jm__sb-wage-input"
                  type="number"
                  value={maxWage}
                  onChange={(e) => setMaxWage(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="agri-jm__sb-divider" />

          <div className="agri-jm__sb-block">
            <div className="agri-jm__sb-label">Skills</div>
            {SKILLS_LIST.map((skill) => (
              <label key={skill} className="agri-jm__sb-check-row">
                <input
                  type="checkbox"
                  className="agri-jm__sb-checkbox"
                  checked={selectedSkills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                />
                <span className="agri-jm__sb-check-label">{skill}</span>
              </label>
            ))}
          </div>

          <div className="agri-jm__sb-divider" />

          <div className="agri-jm__sb-block">
            <div className="agri-jm__sb-label">Experience Level</div>
            <div className="agri-jm__sb-select-wrap">
              <select
                className="agri-jm__sb-select"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="All">All</option>
                <option value="No Experience">No Experience</option>
                <option value="1+ Year">1+ Year</option>
                <option value="2+ Years">2+ Years</option>
              </select>
              <span className="agri-jm__sb-select-arrow">▾</span>
            </div>
          </div>

          <div className="agri-jm__sb-divider" />

          <div className="agri-jm__sb-block">
            <div className="agri-jm__sb-label">Location</div>
            <input
              className="agri-jm__sb-location"
              placeholder="e.g. Gujarat, Punjab..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="agri-jm__sb-divider" />

          <div className="agri-jm__sb-block">
            <div className="agri-jm__sb-label">Availability</div>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <label key={opt} className="agri-jm__sb-check-row">
                <input
                  type="checkbox"
                  className="agri-jm__sb-checkbox"
                  checked={selectedAvailability.includes(opt)}
                  onChange={() => toggleAvailability(opt)}
                />
                <span className="agri-jm__sb-check-label">{opt}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* ── JOB LIST ── */}
        <main className="agri-jm__job-list">
          <div className="agri-jm__results-header">
            <span className="agri-jm__results-count">
              <strong>{filteredJobs.length}</strong> jobs found
            </span>
          </div>

          {/* Loading */}
          {loadingJobs && (
            <div className="agri-jm__no-results">
              <div style={{ fontSize: 40 }}>🌱</div>
              <p>Loading jobs…</p>
            </div>
          )}

          {/* Empty */}
          {!loadingJobs && filteredJobs.length === 0 && (
            <div className="agri-jm__no-results">
              <div style={{ fontSize: 40 }}>🌱</div>
              <p>No jobs match your filters. Try adjusting your search.</p>
            </div>
          )}

          {/* Cards */}
          {!loadingJobs && currentJobs.map((job) => (
            <div key={job._id}>
              <div className={`agri-jm__job-card${expandedJob === job._id ? " agri-jm__job-card--active" : ""}`}>

                {/* TOP ROW */}
                <div className="agri-jm__card-top">
                  <div className="agri-jm__avatar" style={{ background: job._color }}>
                    {job._initials}
                  </div>

                  <div className="agri-jm__card-info">
                    <div className="agri-jm__card-title-row">
                      <span className="agri-jm__job-title">{job.title}</span>
                    </div>
                    <div className="agri-jm__company">{job.farmName}</div>
                    <div className="agri-jm__location">📍 {job._location}</div>
                    <p className="agri-jm__job-desc">{job.description || "—"}</p>
                    <div className="agri-jm__tag-row">
                      {job._tags.map((tag) => (
                        <span key={tag} className="agri-jm__tag">{tag}</span>
                      ))}
                      {job.duration && (
                        <span className="agri-jm__duration-tag">⏱ {job.duration}</span>
                      )}
                    </div>
                  </div>

                  <div className="agri-jm__card-right">
                    <div className="agri-jm__wage">{job.salary || "—"}</div>
                    <div className="agri-jm__exp">Exp: {job._exp}</div>
                  </div>
                </div>

                {/* BOTTOM ROW — Apply/Cancel buttons */}
                <div className="agri-jm__card-actions">
                  {/* Show Cancel button if already applied, otherwise Show Apply button */}
                  {appliedJobs.includes(job._id) ? (
                    <button
                      className="agri-jm__cancel-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(job._id);
                      }}
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      className={`agri-jm__contact-action-btn${
                        applyStatus[job._id] === "applied"
                          ? " agri-jm__contact-action-btn--done"
                          : applyStatus[job._id] === "error"
                          ? " agri-jm__contact-action-btn--error"
                          : ""
                      }`}
                      onClick={() => handleApply(job._id)}
                      disabled={
                        applyStatus[job._id] === "loading" ||
                        applyStatus[job._id] === "applied"
                      }
                    >
                      {applyStatus[job._id] === "loading"
                        ? "Applying…"
                        : applyStatus[job._id] === "applied"
                        ? "✓ Applied"
                        : "Apply"}
                    </button>
                  )}

                  {/* View Profile button — unchanged */}
                  <button
                    className="agri-jm__profile-btn"
                    onClick={() => setSelectedJob(job)}
                  >
                    View Profile
                  </button>
                </div>

                {/* EXPANDED DETAILS — untouched */}
                {expandedJob === job._id && (
                  <div className="agri-jm__expanded">
                    <div className="agri-jm__expanded-divider" />
                    <div className="agri-jm__expanded-grid">
                      <div className="agri-jm__expanded-left">
                        <div className="agri-jm__expanded-section-title">About the Role</div>
                        <p className="agri-jm__expanded-text">
                          {job.description || "No description provided."}
                        </p>
                        {job.skills && job.skills.length > 0 && (
                          <>
                            <div className="agri-jm__expanded-section-title">Skills Required</div>
                            <ul className="agri-jm__skills-list">
                              {(Array.isArray(job.skills) ? job.skills : job.skills.split(","))
                                .map((s, i) => (
                                  <li key={i} className="agri-jm__skill-item">
                                    <span className="agri-jm__skill-dot" />
                                    {s.trim()}
                                  </li>
                                ))}
                            </ul>
                          </>
                        )}
                      </div>

                      <div className="agri-jm__expanded-right">
                        <div className="agri-jm__info-card">
                          {[
                            ["Pay Type",   job.payType        || "—"],
                            ["Duration",   job.duration       || "—"],
                            ["Employment", job.employmentType || "—"],
                            ["Workers",    job.workersNeeded  ?? "—"],
                            ["Start Date", job.startDate      || "—"],
                            ["Deadline",   job.deadline       || "—"],
                          ].map(([label, val]) => (
                            <div key={label} className="agri-jm__info-row">
                              <span>{label}</span>
                              <strong>{val}</strong>
                            </div>
                          ))}
                        </div>
                        {appliedJobs.includes(job._id) ? (
                          <button
                            className="agri-jm__cancel-btn-large"
                            onClick={() => handleCancel(job._id)}
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            className={`agri-jm__apply-btn-large${
                              applyStatus[job._id] === "applied"
                                ? " agri-jm__apply-btn--done"
                                : ""
                            }`}
                            onClick={() => handleApply(job._id)}
                            disabled={
                              applyStatus[job._id] === "loading" ||
                              applyStatus[job._id] === "applied"
                            }
                          >
                            {applyStatus[job._id] === "loading"
                              ? "Applying…"
                              : applyStatus[job._id] === "applied"
                              ? "✓ Applied"
                              : "Apply Now"}
                          </button>
                        )}
                        <button className="agri-jm__contact-btn">Contact Farm</button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}

          {/* PAGINATION */}
          {!loadingJobs && totalPages > 1 && (
            <div className="agri-jm__pagination">
              <button
                className="agri-jm__page-btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`agri-jm__page-btn${
                    currentPage === page ? " agri-jm__page-btn--active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="agri-jm__page-btn"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

    </div>
  );
}