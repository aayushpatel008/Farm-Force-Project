const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./Config/db');
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");

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
const messageRoutes = require("./Routes/messageRoutes");

// 🔥 NEW: Application Routes IMPORT


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

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

app.use("/api/messages", messageRoutes);

// ─────────────────────────────────────────────
// SOCKET.IO EVENTS
// ─────────────────────────────────────────────
io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join_workspace", (workspaceId) => {
        socket.join(workspaceId);
        console.log(`User ${socket.id} joined workspace: ${workspaceId}`);
    });

    socket.on("send_message", async (data) => {
        const { workspaceId, senderId, text } = data;

        try {
            const newMessage = await Message.create({
                workspace: workspaceId,
                sender: senderId,
                text: text
            });

            // Populate sender info before emitting
            const populatedMessage = await Message.findById(newMessage._id).populate("sender", "name role");

            io.to(workspaceId).emit("receive_message", populatedMessage);
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });
});



// ─────────────────────────────────────────────
// SERVER START
// ─────────────────────────────────────────────
server.listen(5000, () => {
    console.log("Server running on port 5000 with Socket.IO");
});