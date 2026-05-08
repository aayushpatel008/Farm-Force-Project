const Message = require("../models/Message");

// @desc    Get all messages for a workspace
// @route   GET /api/messages/:workspaceId
// @access  Private
exports.getWorkspaceMessages = async (req, res) => {
    try {
        const { workspaceId } = req.params;

        const messages = await Message.find({ workspace: workspaceId })
            .populate("sender", "name role")
            .sort({ createdAt: 1 }); // oldest to newest

        res.json({
            success: true,
            messages
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private (Sender only)
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found"
            });
        }

        // Verify ownership
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only delete your own messages"
            });
        }

        await Message.findByIdAndDelete(req.params.messageId);

        res.json({
            success: true,
            message: "Message deleted"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
