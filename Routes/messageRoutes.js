const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/Jobpostmiddleware");
const { getWorkspaceMessages, deleteMessage } = require("../Controller/messageController");

// GET /api/messages/:workspaceId
router.get("/:workspaceId", protect, getWorkspaceMessages);

// DELETE /api/messages/:messageId
router.delete("/:messageId", protect, deleteMessage);

module.exports = router;
