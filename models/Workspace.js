// models/Workspace.js

const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({

   // application reference
   application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
      unique: true
   },

   // connected job
   job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
   },

   // connected worker profile
   worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkerApplication",
      required: true
   },

   // connected provider user
   provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
   },

   // workspace status
   status: {
      type: String,
      enum: ["active", "completed"],
      default: "active"
   }

}, { timestamps: true });

module.exports = mongoose.model(
   "Workspace",
   workspaceSchema
);