// Routes/workspaceRoutes.js

const express = require("express");

const router = express.Router();

const { protect } = require("../Middleware/Jobpostmiddleware");

const {

   createWorkspace,

   getWorkerWorkspaces,

   getProviderWorkspaces,

   getSingleWorkspace,

   updateWorkspaceStatus

} = require("../Controller/workspaceController");



// CREATE WORKSPACE
router.post(
   "/create/:applicationId",
   protect,
   createWorkspace
);



// WORKER WORKSPACES
router.get(
   "/worker",
   protect,
   getWorkerWorkspaces
);



// PROVIDER WORKSPACES
router.get(
   "/provider",
   protect,
   getProviderWorkspaces
);



// SINGLE WORKSPACE
router.get(
   "/:id",
   protect,
   getSingleWorkspace
);



// UPDATE WORKSPACE STATUS
router.put(
   "/status/:id",
   protect,
   updateWorkspaceStatus
);

module.exports = router;