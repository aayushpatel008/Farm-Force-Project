import { useState } from "react";
import "./BrowseWorker.css";
import Sidebar1 from "../Sidebar";


const jobsData = [
  {
    id: 1,
    initials: "SR",
    color: "#2d6a4f",
    title: "Tractor Driver",
    company: "Sharma Farms",
    location: "Kalol, Gandhinagar",
    wage: "₹500/day",
    wageNum: 500,
    badge: "Hiring Now",
    badgeColor: "#d1fae5",
    badgeText: "#065f46",
    description: "Experienced tractor driver needed for wheat plowing across 40 acres of agricultural land.",
    tags: ["Tractor Driving", "Plowing"],
    duration: "3 Weeks",
    availability: "Now",
    skills: ["Valid tractor license", "2+ years experience", "Knowledge of soil preparation"],
    fullDescription:
      "We are looking for a skilled tractor driver to operate and maintain our tractor fleet for seasonal plowing and field preparation. The job involves operating heavy farm equipment, ensuring safe and efficient operation, and minor equipment maintenance. Accommodation may be provided on-site.",
    experience: "2+ Years",
    type: "Tractor Driving",
  },
  {
    id: 2,
    initials: "PK",
    color: "#1b4332",
    title: "Harvesting Supervisor",
    company: "Patel Krishi Kendra",
    location: "Deesa, Banaskantha",
    wage: "₹650/day",
    wageNum: 650,
    badge: "Urgent",
    badgeColor: "#fef3c7",
    badgeText: "#92400e",
    description: "Lead a harvesting team for cotton picking season. Must have prior supervisory experience.",
    tags: ["Harvesting", "Team Lead"],
    duration: "1 Month",
    availability: "This Week",
    skills: ["Cotton harvesting expertise", "Team management", "Physical fitness"],
    fullDescription:
      "Patel Krishi Kendra is hiring a harvest supervisor for the upcoming cotton season. You will manage a team of 10–15 workers, coordinate daily task assignments, track progress, and ensure quality control during picking. Knowledge of cotton grading is a plus.",
    experience: "2+ Years",
    type: "Harvesting",
  },
  {
    id: 3,
    initials: "AG",
    color: "#40916c",
    title: "Irrigation Technician",
    company: "Agrofield Gujarat",
    location: "Anand, Gujarat",
    wage: "₹420/day",
    wageNum: 420,
    badge: "Hiring Now",
    badgeColor: "#d1fae5",
    badgeText: "#065f46",
    description: "Install and manage drip irrigation systems across vegetable farms in Anand district.",
    tags: ["Irrigation", "Drip System"],
    duration: "Weekly",
    availability: "Now",
    skills: ["Drip irrigation setup", "Pipe fitting basics", "Field mapping"],
    fullDescription:
      "We are expanding our drip irrigation network across 25 hectares of vegetable cultivation. Duties include laying pipe lines, setting up emitters, testing pressure, and maintaining the system weekly. Training will be provided for the right candidate.",
    experience: "1+ Year",
    type: "Irrigation",
  },
  {
    id: 4,
    initials: "VF",
    color: "#74c69d",
    title: "Livestock Caretaker",
    company: "Varma Farms",
    location: "Mehsana, Gujarat",
    wage: "₹380/day",
    wageNum: 380,
    badge: "Open",
    badgeColor: "#ede9fe",
    badgeText: "#5b21b6",
    description: "Care for dairy cattle herd including feeding, milking, and basic health monitoring.",
    tags: ["Livestock Handling", "Dairy"],
    duration: "Monthly",
    availability: "This Week",
    skills: ["Cattle handling", "Basic veterinary knowledge", "Milking machines"],
    fullDescription:
      "Varma Farms is a growing dairy operation seeking a dedicated livestock caretaker. Responsibilities include feeding schedules, operating milking equipment, monitoring animal health, and maintaining clean pen environments. Accommodation and meals provided.",
    experience: "1+ Year",
    type: "Livestock Handling",
  },
  {
    id: 5,
    initials: "NK",
    color: "#52b788",
    title: "Farm Helper (General)",
    company: "Narmada Krishi",
    location: "Vadodara, Gujarat",
    wage: "₹300/day",
    wageNum: 300,
    badge: "New",
    badgeColor: "#dbeafe",
    badgeText: "#1e40af",
    description: "General farm helper needed for daily tasks including weeding, watering, and crop care.",
    tags: ["Harvesting", "No Experience"],
    duration: "1 Day",
    availability: "Now",
    skills: ["Willingness to work outdoors", "Physical stamina"],
    fullDescription:
      "No experience needed! Narmada Krishi is hiring daily farm helpers for routine agricultural tasks including manual weeding, hand watering, sorting produce, and general field maintenance. Daily wages paid same evening. Great opportunity for first-time workers.",
    experience: "No Experience",
    type: "Harvesting",
  },
];

const SKILLS = ["Tractor Driving", "Harvesting", "Irrigation", "Livestock Handling"];
const AVAILABILITY_OPTIONS = ["Now", "This Week", "This Month"];

export default function Browsejob() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedJob, setExpandedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);

  const [minWage, setMinWage] = useState(0);
  const [maxWage, setMaxWage] = useState(2000);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState("All");
  const [location, setLocation] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState([]);

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
  };

  const filteredJobs = jobsData.filter((job) => {
    if (job.wageNum < minWage || job.wageNum > maxWage) return false;
    if (selectedSkills.length && !selectedSkills.some((s) => job.tags.includes(s) || job.type === s)) return false;
    if (experienceLevel !== "All" && job.experience !== experienceLevel) return false;
    if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (selectedAvailability.length && !selectedAvailability.includes(job.availability)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.tags.some((t) => t.toLowerCase().includes(q)) ||
        job.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApply = (id) =>
    setAppliedJobs((prev) => (prev.includes(id) ? prev : [...prev, id]));

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

          {/* Daily Wage */}
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

          {/* Skills */}
          <div className="agri-jm__sb-block">
            <div className="agri-jm__sb-label">Skills</div>
            {SKILLS.map((skill) => (
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

          {/* Experience Level */}
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

          {/* Location */}
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

          {/* Availability */}
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

          {filteredJobs.length === 0 && (
            <div className="agri-jm__no-results">
              <div style={{ fontSize: 40 }}>🌱</div>
              <p>No jobs match your filters. Try adjusting your search.</p>
            </div>
          )}

          {filteredJobs.map((job) => (
            <div key={job.id}>
              <div className={`agri-jm__job-card${expandedJob === job.id ? " agri-jm__job-card--active" : ""}`}>

                {/* ── TOP ROW: avatar + info + wage/exp ── */}
                <div className="agri-jm__card-top">
                  <div className="agri-jm__avatar" style={{ background: job.color }}>
                    {job.initials}
                  </div>

                  <div className="agri-jm__card-info">
                    <div className="agri-jm__card-title-row">
                      <span className="agri-jm__job-title">{job.title}</span>
                      
                    </div>
                    <div className="agri-jm__company">{job.company}</div>
                    <div className="agri-jm__location">📍 {job.location}</div>
                    <p className="agri-jm__job-desc">{job.description}</p>
                    <div className="agri-jm__tag-row">
                      {job.tags.map((tag) => (
                        <span key={tag} className="agri-jm__tag">{tag}</span>
                      ))}
                      <span className="agri-jm__duration-tag">⏱ {job.duration}</span>
                    </div>
                  </div>

                  {/* Wage + Exp — top right, no buttons here */}
                  <div className="agri-jm__card-right">
                    <div className="agri-jm__wage">{job.wage}</div>
                    <div className="agri-jm__exp">Exp: {job.experience}</div>
                  </div>
                </div>

                {/* ── BOTTOM ROW: Contact + View Profile buttons ── */}
                <div className="agri-jm__card-actions">
                  <button
                    className={`agri-jm__contact-action-btn${appliedJobs.includes(job.id) ? " agri-jm__contact-action-btn--done" : ""}`}
                    onClick={() => handleApply(job.id)}
                  >
                    {appliedJobs.includes(job.id) ? "✓ Contacted" : "Contact"}
                  </button>
                  <button
                    className="agri-jm__profile-btn"
                    onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                  >
                    {expandedJob === job.id ? "Hide Profile" : "View Profile"}
                  </button>
                </div>

                {/* ── EXPANDED DETAILS ── */}
                
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}