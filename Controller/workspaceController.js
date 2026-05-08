// Controller/workspaceController.js

const Workspace = require("../models/Workspace");
const Application = require("../models/ApplicationModel");
const WorkerApplication = require("../models/Workerposting");


// CREATE WORKSPACE
exports.createWorkspace = async (req, res) => {

   try {

      // find application
      const application =
         await Application.findById(
            req.params.applicationId
         );

      // check application exists
      if (!application) {

         return res.status(404).json({
            success: false,
            message: "Application not found"
         });

      }

      // only accepted applications
      if (application.status !== "accepted") {

         return res.status(400).json({
            success: false,
            message: "Application not accepted yet"
         });

      }

      // prevent duplicate workspace
      const existingWorkspace =
         await Workspace.findOne({
            application: application._id
         });

      if (existingWorkspace) {

         return res.status(409).json({
            success: false,
            message: "Workspace already exists"
         });

      }

      // create workspace
      const workspace =
         await Workspace.create({

            application: application._id,

            job: application.job,

            worker: application.worker,

            provider: application.provider

         });

      res.status(201).json({
         success: true,
         message: "Workspace created",
         workspace
      });

   } catch (err) {

      console.log(err);

      res.status(500).json({
         success: false,
         message: err.message
      });

   }

};




// GET WORKER WORKSPACES
exports.getWorkerWorkspaces = async (req, res) => {

   try {

      // find worker profile
      const workerProfile =
         await WorkerApplication.findOne({
            worker: req.user._id
         });

      // worker profile not found
      if (!workerProfile) {

         return res.status(404).json({
            success: false,
            message: "Worker profile not found"
         });

      }

      // get all worker workspaces
      const workspaces =
         await Workspace.find({
            worker: workerProfile._id
         })
         .populate("provider", "name email")
         .populate("job")
         .populate("worker");

      res.status(200).json({
         success: true,
         workspaces
      });

   } catch (err) {

      console.log(err);

      res.status(500).json({
         success: false,
         message: err.message
      });

   }

};




// GET PROVIDER WORKSPACES
exports.getProviderWorkspaces = async (req, res) => {

   try {

      // get provider workspaces
      const workspaces =
         await Workspace.find({
            provider: req.user._id
         })
         .populate("worker")
         .populate("job")
         .populate("provider");

      res.status(200).json({
         success: true,
         workspaces
      });

   } catch (err) {

      console.log(err);

      res.status(500).json({
         success: false,
         message: err.message
      });

   }

};




// GET SINGLE WORKSPACE
exports.getSingleWorkspace = async (req, res) => {

   try {

      const workspace =
         await Workspace.findById(req.params.id)
         .populate("worker")
         .populate("provider")
         .populate("job");

      // workspace not found
      if (!workspace) {

         return res.status(404).json({
            success: false,
            message: "Workspace not found"
         });

      }

      res.status(200).json({
         success: true,
         workspace
      });

   } catch (err) {

      console.log(err);

      res.status(500).json({
         success: false,
         message: err.message
      });

   }

};




// UPDATE WORKSPACE STATUS
exports.updateWorkspaceStatus = async (req, res) => {

   try {

      const { status } = req.body;

      // validate status
      if (
         status !== "active" &&
         status !== "completed"
      ) {

         return res.status(400).json({
            success: false,
            message: "Invalid status"
         });

      }

      const workspace =
         await Workspace.findByIdAndUpdate(

            req.params.id,

            { status },

            { new: true }

         );

      // workspace not found
      if (!workspace) {

         return res.status(404).json({
            success: false,
            message: "Workspace not found"
         });

      }

      res.status(200).json({
         success: true,
         message: "Workspace updated",
         workspace
      });

   } catch (err) {

      console.log(err);

      res.status(500).json({
         success: false,
         message: err.message
      });

   }

};