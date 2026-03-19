const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./Config/db');

const authRoutes = require('./Routes/authroutes');

const jobpost=require('./Routes/jobpostroutes');

const Activejob=require('./Routes/ActiveJobPosting');

const WorkerApplication=require('./Routes/Workerpostroutes')

const jobCrudRoutes = require("./Routes/jobcrudroutes");

const app = express();

connectDB();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api',jobpost);
app.use('/api',WorkerApplication);
app.use('/api/active',Activejob);
app.use("/api", jobCrudRoutes); 






app.listen(5000, () => {
    console.log("Server running on port 5000");
});