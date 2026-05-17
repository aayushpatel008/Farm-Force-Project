const Payment = require("../models/Payment");
const Workspace = require("../models/Workspace");
const razorpay = require("../Config/razorpay");

// 1. createOrder
exports.createOrder = async (req, res) => {
  try {
    const { workspaceId, workerId, amount } = req.body;
    const providerId = req.user ? req.user._id : null;

    console.log("=== CREATE ORDER START ===");
    console.log("BODY:", req.body);
    console.log("USER:", req.user);
    console.log("RAZORPAY KEY:", process.env.RAZORPAY_KEY_ID);
    // Validate workspace ownership
    const workspace = await Workspace.findOne({ _id: workspaceId, provider: providerId });
    if (!workspace) {
      return res.status(403).json({ success: false, message: "Unauthorized or workspace not found" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    console.log("AMOUNT:", amount);

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    console.log("Creating Razorpay order...");
    const order = await razorpay.orders.create(options);
    console.log("ORDER CREATED:", order);

    const payment = new Payment({
      workspaceId,
      workerId,
      providerId,
      amount,
      razorpay_order_id: order.id,
      status: "pending"
    });

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment order created",
      order
    });
  } catch (error) {
    console.error("RAZORPAY ERROR FULL:");
    console.error(error);

    console.error("MESSAGE:", error.message);

    if (error.error) {
      console.error("RAZORPAY INNER ERROR:", error.error);
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// 2. verifyPayment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, workspaceId } = req.body;

    const payment = await Payment.findOne({ razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    // Verify workspace match if passed
    if (workspaceId && payment.workspaceId.toString() !== workspaceId.toString()) {
      return res.status(400).json({ success: false, message: "Workspace mismatch" });
    }

    payment.status = "paid";
    payment.razorpay_payment_id = razorpay_payment_id;
    await payment.save();

    res.status(200).json({ success: true, message: "Payment verified successfully", payment });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// 3. getWorkspacePayments
exports.getWorkspacePayments = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const payments = await Payment.find({ workspaceId }).sort({ createdAt: -1 });

    const totalPaid = payments
      .filter(p => p.status === "paid")
      .reduce((a, p) => a + p.amount, 0);

    const pendingAmount = payments
      .filter(p => p.status === "pending")
      .reduce((a, p) => a + p.amount, 0);

    const transactions = payments.length;

    const lastPayment = payments.find(
      p => p.status === "paid"
    ) || null;

    res.status(200).json({
      success: true,
      payments,
      totalPaid,
      pendingAmount,
      transactions,
      lastPayment
    });
  } catch (error) {
    console.error("Error fetching workspace payments:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
