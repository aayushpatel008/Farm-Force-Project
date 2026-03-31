import { useState, useEffect } from "react";
import axios from "axios";
import "./Browse.css";
import Sidebar from "./sidebar";

// ── Static fallback — shown if API fails or returns empty ──────────────────
const STATIC_WORKERS = [
  {
    id: 1,
    name: "Ramesh Patel",
    initials: "RP",
    rating: 4.9,
    reviews: 124,
    experience: "8+ years",
    location: "Gujarat, India",
    skills: ["Tractor Driving", "Harvesting", "Irrigation"],
    bio: "Experienced field worker specializing in large-scale wheat and cotton harvesting. Owns certified equipment.",
    available: true,
    wage: "₹850/day",
    color: "#2d6a4f",
  },
  {
    id: 2,
    name: "Suresh Kumar",
    initials: "SK",
    rating: 4.7,
    reviews: 89,
    experience: "5+ years",
    location: "Punjab, India",
    skills: ["Livestock Handling", "Irrigation", "Harvesting"],
    bio: "Skilled in dairy farm operations and crop irrigation systems. Expert in managing large cattle herds.",
    available: true,
    wage: "₹700/day",
    color: "#1b4332",
  },
  {
    id: 3,
    name: "Priya Devi",
    initials: "PD",
    rating: 4.8,
    reviews: 67,
    experience: "4+ years",
    location: "Maharashtra, India",
    skills: ["Harvesting", "Tractor Driving"],
    bio: "Versatile agricultural worker with expertise in grape and sugarcane harvesting across Western India.",
    available: false,
    wage: "₹750/day",
    color: "#40916c",
  },
  {
    id: 4,
    name: "Mahesh Singh",
    initials: "MS",
    rating: 4.6,
    reviews: 201,
    experience: "12+ years",
    location: "Rajasthan, India",
    skills: ["Tractor Driving", "Irrigation", "Livestock Handling"],
    bio: "Veteran farmer with deep knowledge of arid-zone farming techniques and drip irrigation setup.",
    available: true,
    wage: "₹950/day",
    color: "#52b788",
  },
  {
    id: 5,
    name: "Anita Yadav",
    initials: "AY",
    rating: 4.5,
    reviews: 43,
    experience: "2+ years",
    location: "Uttar Pradesh, India",
    skills: ["Harvesting", "Irrigation"],
    bio: "Quick learner with hands-on experience in paddy field harvesting and manual irrigation in UP river belts.",
    available: true,
    wage: "₹600/day",
    color: "#74c69d",
  },
  {
    id: 6,
    name: "Vijay Tomar",
    initials: "VT",
    rating: 4.9,
    reviews: 158,
    experience: "10+ years",
    location: "Madhya Pradesh, India",
    skills: ["Tractor Driving", "Harvesting", "Livestock Handling", "Irrigation"],
    bio: "All-rounder agricultural expert. Licensed tractor operator with experience across 6 states.",
    available: true,
    wage: "₹1100/day",
    color: "#1b4332",
  },
];

// ── Avatar colours — cycles for real backend data ─────────────────────────
const AVATAR_COLORS = [
  "#2d6a4f", "#1b4332", "#40916c", "#52b788",
  "#74c69d", "#1a3d22", "#277a2e", "#4caf58",
];

// ── Map one WorkerApplication doc → card + modal shape ───────────────────
const normaliseWorker = (a, index) => {
  const firstName  = a.firstName || "";
  const lastName   = a.lastName  || "";
  const fullName   = `${firstName} ${lastName}`.trim() || "Unknown";
  const initials   = [firstName[0], lastName[0]]
                       .filter(Boolean)
                       .map(c => c.toUpperCase())
                       .join("") || "??";

  const available  = a.availableFrom
    ? new Date(a.availableFrom) <= new Date()
    : true;

  const fmtDate = (d) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return String(d); }
  };

  return {
    // ── card fields ──────────────────────────────────────────
    id:               a._id,
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
    // ── modal — personal ─────────────────────────────────────
    firstName:        a.firstName        || "—",
    lastName:         a.lastName         || "—",
    dateOfBirth:      fmtDate(a.dateOfBirth) || "—",
    gender:           a.gender           || "—",
    nationality:      a.nationality      || "—",
    // ── modal — contact ──────────────────────────────────────
    email:            a.email            || "—",
    phone:            a.phone            || "—",
    emergencyContact: a.emergencyContact || "—",
    // ── modal — work ─────────────────────────────────────────
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

export default function BrowseWorkers() {
  const [search,         setSearch]         = useState("");
  const [minWage,        setMinWage]        = useState(0);
  const [maxWage,        setMaxWage]        = useState(2000);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [experience,     setExperience]     = useState("All");
  const [location,       setLocation]       = useState("");
  const [availability,   setAvailability]   = useState("All");
  const [filtersOpen,    setFiltersOpen]    = useState(false);

  // ── Pagination ───────────────────────────────────────────────────────────
  const ITEMS_PER_PAGE = 5;
  const [currentPage,  setCurrentPage]  = useState(1);

  // ── Data state ───────────────────────────────────────────────────────────
  const [workers,     setWorkers]     = useState([]);
  const [loading,     setLoading]     = useState(true);

  // ── Profile modal ────────────────────────────────────────────────────────
  const [viewWorker,  setViewWorker]  = useState(null);

  // ── Fetch from backend ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "http://localhost:5000/api/Workercard",
          { withCredentials: true }
        );
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length === 0) throw new Error("empty");
        setWorkers(data.map(normaliseWorker));
      } catch (error) {
        console.error("Failed to load workers, using static data:", error);
        setWorkers(STATIC_WORKERS);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    setCurrentPage(1);
  };

  // Reset to page 1 whenever any filter changes
  useEffect(() => { setCurrentPage(1); }, [
    search, minWage, maxWage, selectedSkills, experience, location, availability
  ]);

  // ── Filter — works identically for real + static data ────────────────────
  const filtered = workers.filter((w) => {
    const wage = w.wageNum ?? parseInt((w.wage || "0").replace(/\D/g, "")) ?? 0;

    const matchSearch =
      !search ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      w.location.toLowerCase().includes(search.toLowerCase());

    const matchWage = wage >= minWage && wage <= maxWage;

    const matchSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((s) => w.skills.includes(s));

    const workerExp = parseInt(w.experience);
    const matchExp =
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < Math.round(rating) ? "filled" : ""}`}>★</span>
    ));
  };

  return (
    <div className="bw-page">

      {/* ── SIDEBAR ── */}
      <Sidebar />

      {/* ── ALL CONTENT SHIFTED RIGHT OF SIDEBAR ── */}
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

              {/* ── Loading skeletons ── */}
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

              /* ── Empty state ── */
              ) : filtered.length === 0 ? (
                <div className="bw-empty">
                  <p>🌱 No workers match your filters.</p>
                  <span>Try adjusting your search or filters.</span>
                </div>

              /* ── Cards — same JSX as original ── */
              ) : (
                (() => {
                  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE);
                  const paginated   = filtered.slice(
                    (currentPage - 1) * ITEMS_PER_PAGE,
                    currentPage * ITEMS_PER_PAGE
                  );
                  return paginated.map((w) => (
                  <div className="bw-card" key={w.id}>
                    <div className="bw-card-left">
                      <div className="bw-card-avatar" style={{ background: w.color }}>
                        {w.initials}
                      </div>
                      {w.available && <span className="bw-avail-dot" title="Available Now" />}
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

                      <div className="bw-card-actions">
                        <button className="bw-btn-hire">Contact</button>
                        <button className="bw-btn-view" onClick={() => setViewWorker(w)}>View Profile</button>
                      </div>
                    </div>
                  </div>
                  ));
                })()
              )}
            </div>

            {/* ── PAGINATION ── */}
            {!loading && filtered.length > ITEMS_PER_PAGE && (() => {
              const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

              // Build page number array with ellipsis: [1, '...', 4, 5, 6, '...', 12]
              const getPages = () => {
                const pages = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (currentPage > 3)          pages.push("...");
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
                  {/* Prev */}
                  <button
                    className="bw-page-btn bw-page-arrow"
                    disabled={currentPage === 1}
                    onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    ‹
                  </button>

                  {/* Page numbers */}
                  {getPages().map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="bw-page-ellipsis">…</span>
                    ) : (
                      <button
                        key={p}
                        className={`bw-page-btn ${currentPage === p ? "bw-page-active" : ""}`}
                        onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    className="bw-page-btn bw-page-arrow"
                    disabled={currentPage === totalPages}
                    onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    ›
                  </button>
                </div>
              );
            })()}
          </section>
        </main>
      </div>

      {/* ══════════════════════════════════════════
          WORKER PROFILE MODAL
          Same layout as jobpDashboard applicant modal
          ══════════════════════════════════════════ */}
      {viewWorker && (
        <div className="bw-modal-overlay" onClick={() => setViewWorker(null)}>
          <div className="bw-modal-card" onClick={e => e.stopPropagation()}>

            {/* ── Green banner ── */}
            <div className="bw-modal-banner">
              <div className="bw-modal-banner-left">
                <div className="bw-modal-avatar" style={{ background: viewWorker.color }}>
                  {viewWorker.initials}
                </div>
                <div>
                  <h2 className="bw-modal-title">{viewWorker.firstName} {viewWorker.lastName}</h2>
                  <span className="bw-modal-role">{viewWorker.jobTitle}</span>
                  <div className="bw-modal-meta">
                    {viewWorker.location !== "—" && <span>📍 {viewWorker.location}</span>}
                    {viewWorker.experienceRequired !== "—" && <span>🧑‍🌾 {viewWorker.experienceRequired} exp</span>}
                    {viewWorker.appliedDate && <span>📅 Applied {viewWorker.appliedDate}</span>}
                  </div>
                </div>
              </div>
              <button className="bw-modal-close" onClick={() => setViewWorker(null)}>✕</button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="bw-modal-scroll">

              {/* ROW: Personal Details + Contact Information */}
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
                      <span className="bw-modal-val"><span className="bw-modal-icon">📍</span>{viewWorker.location}</span>
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
                      <span className="bw-modal-val"><span className="bw-modal-icon">📧</span>{viewWorker.email}</span>
                      <div className="bw-modal-field-divider" />
                    </div>
                    <div className="bw-modal-field">
                      <span className="bw-modal-label">PHONE NUMBER</span>
                      <span className="bw-modal-val"><span className="bw-modal-icon">📱</span>{viewWorker.phone}</span>
                      <div className="bw-modal-field-divider" />
                    </div>
                    <div className="bw-modal-field">
                      <span className="bw-modal-label">EMERGENCY CONTACT</span>
                      <span className="bw-modal-val"><span className="bw-modal-icon">🚨</span>{viewWorker.emergencyContact}</span>
                      <div className="bw-modal-field-divider" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Details — full width */}
              <div className="bw-modal-section bw-modal-section-full">
                <div className="bw-modal-section-heading"><span>💼</span> Work Details</div>
                <div className="bw-modal-divider" />

                <div className="bw-modal-field bw-modal-field-full">
                  <span className="bw-modal-label">JOB TITLE</span>
                  <span className="bw-modal-val"><span className="bw-modal-icon">🧑‍🌾</span>{viewWorker.jobTitle}</span>
                  <div className="bw-modal-field-divider" />
                </div>

                <div className="bw-modal-grid">
                  <div className="bw-modal-field">
                    <span className="bw-modal-label">JOB DURATION</span>
                    <span className="bw-modal-val"><span className="bw-modal-icon">⏱️</span>{viewWorker.jobDuration}</span>
                    <div className="bw-modal-field-divider" />
                  </div>
                  <div className="bw-modal-field">
                    <span className="bw-modal-label">EMPLOYMENT TYPE</span>
                    <span className="bw-modal-val"><span className="bw-modal-icon">👥</span>{viewWorker.employmentType}</span>
                    <div className="bw-modal-field-divider" />
                  </div>
                  <div className="bw-modal-field">
                    <span className="bw-modal-label">WORKERS AVAILABLE</span>
                    <span className="bw-modal-val"><span className="bw-modal-icon">🔢</span>{viewWorker.numberOfWorkers ?? "—"}</span>
                    <div className="bw-modal-field-divider" />
                  </div>
                  <div className="bw-modal-field">
                    <span className="bw-modal-label">EXPECTED SALARY</span>
                    <span className="bw-modal-val">
                      <span className="bw-modal-icon">💰</span>
                      {viewWorker.salaryRange || <em className="bw-modal-not-provided">Not provided</em>}
                    </span>
                    <div className="bw-modal-field-divider" />
                  </div>
                  <div className="bw-modal-field">
                    <span className="bw-modal-label">YEARS OF EXPERIENCE</span>
                    <span className="bw-modal-val"><span className="bw-modal-icon">📅</span>{viewWorker.experienceRequired}</span>
                    <div className="bw-modal-field-divider" />
                  </div>
                  <div className="bw-modal-field">
                    <span className="bw-modal-label">AVAILABLE FROM</span>
                    <span className="bw-modal-val">
                      <span className="bw-modal-icon">📅</span>
                      {viewWorker.availableFrom || <em className="bw-modal-not-provided">Not provided</em>}
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

              {/* About Me */}
              {viewWorker.description && (
                <div className="bw-modal-section bw-modal-section-full">
                  <div className="bw-modal-section-heading"><span>📝</span> About Me</div>
                  <div className="bw-modal-divider" />
                  <p className="bw-modal-bio">{viewWorker.description}</p>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="bw-modal-footer">
              <button className="bw-modal-btn-light" onClick={() => setViewWorker(null)}>Close</button>
            
            </div>
          </div>
        </div>
      )}
    </div>
  );
}