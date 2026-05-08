const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./Config/db');

const authRoutes = require('./Routes/authroutes');
const jobpost = require('./Routes/jobpostroutes');
const Activejob = require('./Routes/ActiveJobPosting');

const WorkerApplication = require('./Routes/Workerpostroutes'); // ⚠️ This is actually Worker Profile
const Workercard1 = require('./Routes/WorkercardRoutes');

const jobCrudRoutes = require("./Routes/jobcrudroutes");
const myjobRoutes = require("./Routes/MyApiJobsroutes"); // ✅ ADDED

const applicationRoutes = require('./Routes/applicationRoutes');

const applicationCancelRoutes = require('./Routes/applicationCancelRoutes'); // ✅ NEW (cancel + get applied)

// ✅ IMPORT WORKSPACE ROUTES
const workspaceRoutes =
require("./Routes/workspaceRoutes");

// 🔥 NEW: Application Routes IMPORT


const app = express();

connectDB();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

app.use('/api/auth', authRoutes);

app.use('/api', jobpost);

app.use('/api', WorkerApplication); // ⚠️ Worker Profile routes (rename later)

app.use('/api/active', Activejob);

app.use("/api", jobCrudRoutes);

app.use('/api', Workercard1);

app.use("/api", myjobRoutes); // ✅ ADDED (My Jobs route)

// 🔥 NEW: Application System Routes

app.use("/api/applications", applicationRoutes);

app.use("/api/applications", applicationCancelRoutes);

// ✅ WORKSPACE ROUTES
app.use(
   "/api/workspace",
   workspaceRoutes
);



// ─────────────────────────────────────────────
// SERVER START
// ─────────────────────────────────────────────
app.listen(5000, () => {
    console.log("Server running on port 5000");
});