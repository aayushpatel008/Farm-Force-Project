const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkerApplication", required: true }, // wait, the Workspace model uses "WorkerApplication" for worker, let's use what the user asked
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
