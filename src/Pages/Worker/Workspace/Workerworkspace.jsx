import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { socket } from "../../../socket";
import Sidebar1 from "../Sidebar";
import "./Workerworkspace.css";

const TABS = ["Chat", "Job Details", "Tasks", "Attendance", "Payments", "Work Updates"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const getStatusClass = (status = "") => {
  const s = status.toLowerCase();
  if (s === "active")    return "wsc-status-badge--active";
  if (s === "completed") return "wsc-status-badge--completed";
  if (s === "paused")    return "wsc-status-badge--paused";
  return "wsc-status-badge--active";
};

function Avatar({ initials, size = 36 }) {
  return (
    <div className="ff-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="wsc-card wsc-card--skeleton">
      <div className="wsc-card__identity">
        <div className="skel skel--line skel--md" style={{ marginBottom: 6 }} />
        <div className="skel skel--line skel--lg" />
      </div>
      <div className="wsc-card__details">
        <div className="skel skel--line skel--sm" />
        <div className="skel skel--line skel--sm" />
      </div>
      <div className="wsc-card__divider" />
      <div className="wsc-card__chips">
        <div className="skel skel--pill" />
        <div className="skel skel--pill" />
      </div>
      <div className="wsc-card__footer">
        <div className="skel skel--pill" />
        <div className="skel skel--pill" style={{ width: 120 }} />
      </div>
    </div>
  );
}

// ─── Workspace Card ───────────────────────────────────────────────────────────
function WorkspaceCard({ ws, onClick }) {
  const chips = [
    ws.job?.jobCategory,
    ws.job?.employmentType,
    ws.job?.payType ? `Per ${ws.job.payType}` : null,
  ].filter(Boolean);

  const statusClass = getStatusClass(ws.status);

  return (
    <div className="wsc-card" onClick={() => onClick(ws)}>

      {/* IDENTITY */}
      <div className="wsc-card__identity">
        <p className="wsc-card__farm">{ws.provider?.name || "—"}</p>
        <h3 className="wsc-card__title">{ws.job?.title || "—"}</h3>
      </div>

      {/* DETAILS */}
      <div className="wsc-card__details">
        <div className="wsc-card__detail-row">
          <span className="wsc-card__detail-item">
            <span className="wsc-card__detail-icon">📍</span>
            {ws.job?.location || "—"}
          </span>
          <span className="wsc-card__detail-item">
            <span className="wsc-card__detail-icon">💰</span>
            {ws.job?.salary ? `₹${ws.job.salary}` : "—"}
            {ws.job?.payType ? ` / ${ws.job.payType}` : ""}
          </span>
        </div>
        <div className="wsc-card__detail-row">
          <span className="wsc-card__detail-item">
            <span className="wsc-card__detail-icon">📅</span>
            {formatDate(ws.job?.startDate)} → {formatDate(ws.job?.endDate)}
          </span>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="wsc-card__divider" />

      {/* CHIPS */}
      <div className="wsc-card__chips">
        {chips.slice(0, 3).map((chip, i) => (
          <span key={i} className="wsc-card__chip-tag">{chip}</span>
        ))}
      </div>

      {/* FOOTER */}
      <div className="wsc-card__footer" onClick={(e) => e.stopPropagation()}>
        <span className={`wsc-status-badge wsc-status-badge--pill ${statusClass}`}>
          {ws.status || "Active"}
        </span>
        <div className="wsc-card__actions">
          <button
            className="wsc-btn wsc-btn--primary"
            onClick={(e) => { e.stopPropagation(); onClick(ws); }}
          >
            Open Workspace
          </button>
          <button className="wsc-btn wsc-btn--ghost">💬</button>
        </div>
      </div>

    </div>
  );
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────
function ChatTab({ ws }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [menuOpenMsgId, setMenuOpenMsgId] = useState(null);
  const bottomRef = useRef(null);
  const loggedInUserId = localStorage.getItem("userId");

  // Step 9: Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // Step 3 & 4: Join room and load old messages
  useEffect(() => {
    if (!ws?._id) return;

    // Join workspace room
    socket.emit("join_workspace", ws._id);

    // Load old messages
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${ws._id}`, {
          withCredentials: true,
        });
        setMsgs(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    fetchMessages();
  }, [ws?._id]);

  // Step 7: Listen for receive_message (Real-time update)
  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      setMsgs((prev) => [...prev, newMessage]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  // Step 6: Send real-time message
  const send = () => {
    const text = input.trim();
    if (!text || !ws?._id || !loggedInUserId) return;

    const messageData = {
      workspaceId: ws._id,
      senderId: loggedInUserId,
      text: text,
    };

    socket.emit("send_message", messageData);
    setInput("");
  };

  const handleDelete = async (msgId) => {
    try {
      await axios.delete(`http://localhost:5000/api/messages/${msgId}`, {
        withCredentials: true,
      });
      setMsgs((prev) => prev.filter((m) => m._id !== msgId));
      setMenuOpenMsgId(null);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handleGlobalClick = () => setMenuOpenMsgId(null);
    if (menuOpenMsgId) {
      window.addEventListener("click", handleGlobalClick);
    }
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [menuOpenMsgId]);

  const providerName = ws.provider?.name || "Provider";
  const providerInitials = getInitials(providerName);

  return (
    <div className="ff-chat">
      <div className="ff-chat-header">
        <Avatar initials={providerInitials} size={38} />
        <div>
          <div className="ff-chat-name">{providerName}</div>
          <div className="ff-chat-role">{ws.provider?.email || "Farm Provider"}</div>
        </div>
        <div className="ff-online-dot" />
      </div>
      <div className="ff-chat-messages">
        {msgs.length === 0 && (
          <div className="ff-chat-empty">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        {Array.isArray(msgs) && msgs.map((m) => {
          // Step 8: Message UI Logic
          const isMe = m.sender?._id === loggedInUserId || m.sender === loggedInUserId;
          const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
          
          return (
            <div key={m._id || Math.random()} className={`ff-bubble-wrap ${isMe ? "ff-me" : "ff-them"}`}>
              <div className={`ff-bubble ${isMe ? "ff-bubble-out" : "ff-bubble-in"}`}>
                {m.text}
                <span className="ff-time">{time}</span>

                {isMe && (
                  <div className="ff-msg-actions">
                    <button 
                      className="ff-msg-arrow" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenMsgId(menuOpenMsgId === m._id ? null : m._id);
                      }}
                    >
                      <svg viewBox="0 0 19 20" width="19" height="20">
                        <path fill="currentColor" d="m3.8 6.7 5.7 5.7 5.7-5.7 1.6 1.6-7.3 7.2-7.3-7.2 1.6-1.6z"></path>
                      </svg>
                    </button>
                    
                    {menuOpenMsgId === m._id && (
                      <div className="ff-msg-menu">
                        <button 
                          className="ff-msg-menu-item ff-delete-opt"
                          onClick={() => handleDelete(m._id)}
                        >
                          Delete Message
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="ff-chat-input-row">
        <button className="ff-attach-btn" title="Attach">📎</button>
        <input
          className="ff-chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="ff-send-btn" onClick={send}>➤</button>
      </div>
    </div>
  );
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────
function TasksTab({ ws }) {
  const [tasks, setTasks] = useState(ws.tasks || []);

  const toggle = (id) =>
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const done = tasks.filter((t) => t.done).length;

  if (tasks.length === 0) {
    return (
      <div className="ff-placeholder-tab">
        <div className="ff-placeholder-icon">✅</div>
        <h3>No Tasks Yet</h3>
        <p>Tasks assigned to this workspace will appear here.</p>
      </div>
    );
  }

  return (
    <div className="ff-tasks">
      <div className="ff-tasks-header">
        <span className="ff-tasks-progress">{done}/{tasks.length} completed</span>
        <div className="ff-progress-bar">
          <div className="ff-progress-fill" style={{ width: `${(done / tasks.length) * 100}%` }} />
        </div>
      </div>
      <ul className="ff-task-list">
        {tasks.map((t) => (
          <li
            key={t.id}
            className={`ff-task-item ${t.done ? "ff-task-done" : ""}`}
            onClick={() => toggle(t.id)}
          >
            <div className={`ff-task-check ${t.done ? "ff-task-check-done" : ""}`}>
              {t.done && "✓"}
            </div>
            <span>{t.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Placeholder Tab ──────────────────────────────────────────────────────────
function PlaceholderTab({ label }) {
  return (
    <div className="ff-placeholder-tab">
      <div className="ff-placeholder-icon">📋</div>
      <h3>{label}</h3>
      <p>This section is available after full integration.</p>
    </div>
  );
}

// ─── Job Details Tab ──────────────────────────────────────────────────────────
function JobDetailsTab({ ws }) {
  const statusClass = getStatusClass(ws.status);

  return (
    <div className="ff-job-details">
      <div className="ff-detail-row">
        <span>Job Title</span>
        <strong>{ws.job?.title || "—"}</strong>
      </div>
      <div className="ff-detail-row">
        <span>Provider / Farm</span>
        <strong>{ws.provider?.name || "—"}</strong>
      </div>
      <div className="ff-detail-row">
        <span>Location</span>
        <strong>{ws.job?.location || "—"}</strong>
      </div>
      <div className="ff-detail-row">
        <span>Wage</span>
        <strong>
          {ws.job?.salary ? `₹${ws.job.salary}` : "—"}
          {ws.job?.payType ? ` / ${ws.job.payType}` : ""}
        </strong>
      </div>
      <div className="ff-detail-row">
        <span>Employment Type</span>
        <strong>{ws.job?.employmentType || "—"}</strong>
      </div>
      <div className="ff-detail-row">
        <span>Category</span>
        <strong>{ws.job?.jobCategory || "—"}</strong>
      </div>
      <div className="ff-detail-row">
        <span>Start Date</span>
        <strong>{formatDate(ws.job?.startDate)}</strong>
      </div>
      <div className="ff-detail-row">
        <span>Expected End</span>
        <strong>{formatDate(ws.job?.endDate)}</strong>
      </div>
      {ws.job?.description && (
        <div className="ff-detail-row ff-detail-row--full">
          <span>Description</span>
          <p className="ff-detail-desc">{ws.job.description}</p>
        </div>
      )}
      <div className="ff-detail-row">
        <span>Status</span>
        <span className={`wsc-status-badge wsc-status-badge--pill ${statusClass}`}>
          {ws.status || "Active"}
        </span>
      </div>
    </div>
  );
}

// ─── Open Workspace View ──────────────────────────────────────────────────────
function OpenWorkspace({ ws, onBack }) {
  const [activeTab, setActiveTab] = useState("Chat");

  const providerName     = ws.provider?.name || "Provider";
  const providerInitials = getInitials(providerName);
  const jobTitle         = ws.job?.title || "—";
  const statusClass      = getStatusClass(ws.status);

  const renderTab = () => {
    switch (activeTab) {
      case "Chat":        return <ChatTab ws={ws} />;
      case "Job Details": return <JobDetailsTab ws={ws} />;
      case "Tasks":       return <TasksTab ws={ws} />;
      default:            return <PlaceholderTab label={activeTab} />;
    }
  };

  return (
    <div className="ff-open-workspace">
      <button className="ff-back-btn" onClick={onBack}>
        ← Back to Workspaces
      </button>

      <div className="ff-workspace-split">

        {/* LEFT: Info sidebar */}
        <aside className="ff-info-sidebar">

          <div className="ff-info-card">
            <div className="ff-info-card-title">Provider Information</div>
            <div className="ff-provider-row">
              <Avatar initials={providerInitials} size={44} />
              <div>
                <div className="ff-provider-name">{providerName}</div>
                <div className="ff-provider-role">{ws.provider?.email || "Farm Provider"}</div>
              </div>
            </div>
          </div>

          <div className="ff-info-card">
            <div className="ff-info-card-title">Job Information</div>
            <div className="ff-info-row"><span>Title</span><strong>{jobTitle}</strong></div>
            <div className="ff-info-row"><span>Farm</span><strong>{providerName}</strong></div>
            <div className="ff-info-row"><span>Category</span><strong>{ws.job?.jobCategory || "—"}</strong></div>
          </div>

          <div className="ff-info-card">
            <div className="ff-info-card-title">Wage</div>
            <div className="ff-wage-big">
              {ws.job?.salary ? `₹${ws.job.salary}` : "—"}
              {ws.job?.payType ? ` / ${ws.job.payType}` : ""}
            </div>
          </div>

          <div className="ff-info-card">
            <div className="ff-info-card-title">Duration</div>
            <div className="ff-info-row"><span>Start</span><strong>{formatDate(ws.job?.startDate)}</strong></div>
            <div className="ff-info-row"><span>End</span><strong>{formatDate(ws.job?.endDate)}</strong></div>
          </div>

          <div className="ff-info-card">
            <div className="ff-info-card-title">Location</div>
            <div className="ff-location-text">📍 {ws.job?.location || "—"}</div>
          </div>

          <div className="ff-info-card">
            <div className="ff-info-card-title">Status</div>
            <span className={`wsc-status-badge wsc-status-badge--pill ${statusClass}`}>
              {ws.status || "Active"}
            </span>
          </div>

        </aside>

        {/* RIGHT: Content area */}
        <div className="ff-content-area">

          {/* Hero banner */}
          <div className="ff-workspace-hero ff-workspace-hero--text">
            <div className="ff-workspace-hero-overlay">
              <h2>{jobTitle}</h2>
              <p>{providerName}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="ff-tabs-bar">
            {TABS.map((t) => (
              <button
                key={t}
                className={`ff-tab-btn ${activeTab === t ? "ff-tab-active" : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="ff-tab-content">{renderTab()}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Workerworkspace() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/api/workspace/worker", {
        withCredentials: true,
      });
      console.log(res.data);

      const raw = res.data?.workspaces || [];
      setWorkspaces(raw);

      // Persistence: Auto-reopen saved workspace
      const savedId = localStorage.getItem("selectedWorkspaceId");
      if (savedId) {
        const found = raw.find((w) => w._id === savedId);
        if (found) setSelected(found);
      }
    } catch (err) {
      console.error("Failed to load workspaces:", err);
      setError("Failed to load workspaces. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const filtered = workspaces.filter((ws) => {
    const q = search.toLowerCase();
    return (
      !q ||
      ws.job?.title?.toLowerCase().includes(q) ||
      ws.provider?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Sidebar1 />
      <div className="ff-workspace-root">
        {selected ? (
          <OpenWorkspace
            ws={selected}
            onBack={() => {
              setSelected(null);
              localStorage.removeItem("selectedWorkspaceId");
            }}
          />
        ) : (
          <div className="ff-grid-view">

            {/* Header */}
            <div className="ff-grid-header">
              <div className="ff-header-text">
                <h1 className="ff-main-title">My Workspaces</h1>
                <p className="ff-main-sub">All your active jobs and collaborations</p>
              </div>
              <div className="ff-header-actions">
                <div className="ff-search-wrap">
                  <span className="ff-search-icon">🔍</span>
                  <input
                    className="ff-search"
                    placeholder="Search workspaces..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="ff-notif-btn" title="Notifications">
                  🔔
                  <span className="ff-notif-dot" />
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="wsc-grid">

              {/* Loading skeletons */}
              {loading && [1, 2, 3].map((i) => <CardSkeleton key={i} />)}

              {/* Error state */}
              {!loading && error && (
                <div className="ff-empty ff-empty--error">
                  <div className="ff-placeholder-icon">⚠️</div>
                  <p className="ff-empty-title">{error}</p>
                  <button className="wsc-btn wsc-btn--primary" onClick={fetchWorkspaces}>
                    Retry
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && filtered.length === 0 && (
                <div className="ff-empty">
                  <div className="ff-placeholder-icon">🌱</div>
                  <p className="ff-empty-title">
                    {search ? "No workspaces match your search." : "No active workspaces"}
                  </p>
                  {search && (
                    <p className="ff-empty-sub">Try a different search term.</p>
                  )}
                </div>
              )}

              {/* Workspace cards */}
              {!loading && !error && filtered.map((ws) => (
                <WorkspaceCard
                  key={ws._id}
                  ws={ws}
                  onClick={(workspace) => {
                    setSelected(workspace);
                    localStorage.setItem("selectedWorkspaceId", workspace._id);
                  }}
                />
              ))}

            </div>
          </div>
        )}
      </div>
    </>
  );
}