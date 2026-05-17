import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PaymentsTab.css";

export default function PaymentsTab({ ws }) {
  const [payments, setPayments] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const workspaceId = ws._id;
  const workerId = ws.worker?._id || ws.worker;

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/payment/workspace/${workspaceId}`, {
        withCredentials: true
      });
      if (res.data) {
        setPayments(res.data.payments || []);
        setTotalPaid(res.data.totalPaid || 0);
        setPendingAmount(res.data.pendingAmount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchPayments();
    }
  }, [workspaceId]);

  const handlePayment = async () => {
    if (!payAmount || isNaN(payAmount) || Number(payAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const amount = Number(payAmount);

    console.log("PAYMENT START");
    console.log(workspaceId);
    console.log(workerId);
    console.log(amount);
    console.log(typeof amount, amount);

    try {
      // 1. Create Order
      const response = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        {
          workspaceId,
          workerId,
          amount
        },
        { withCredentials: true }
      );

      console.log(response.data);

      // Backend returns either { order: {...} } or just {...}
      const order = response.data.order || response.data;

      console.log("ORDER RESPONSE:", order);

      // 2. Open Razorpay
      const options = {
        key: "rzp_test_SqLNXE5VZabPE6",
        amount: order.amount,
        currency: order.currency || "INR",
        name: "FarmForce",
        description: "Worker Payment",
        order_id: order.id,
        handler: async function (verifyResponse) {
          console.log("PAYMENT SUCCESS RESPONSE:", verifyResponse);
          try {
            await axios.post(
              "http://localhost:5000/api/payment/verify",
              {
                razorpay_payment_id: verifyResponse.razorpay_payment_id,
                razorpay_order_id: verifyResponse.razorpay_order_id,
                workspaceId
              },
              { withCredentials: true }
            );

            setSuccessMessage("Payment successful!");
            setTimeout(() => setSuccessMessage(""), 4000);
            fetchPayments();
            setPayAmount("");
          } catch (err) {
            console.error("Verification failed", err);
            alert("Payment verification failed");
          }
        },
        theme: {
          color: "#277a2e"
        }
      };

      console.log("RAZORPAY OPTIONS:", options);
      console.log("window.Razorpay:", window.Razorpay);

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (failedResponse) {
        console.error("PAYMENT FAILED:", failedResponse);
        alert(
          failedResponse.error.description ||
          "Payment Failed"
        );
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.error ||
        error.message ||
        "Payment failed"
      );
    }
  };

  // Find the last payment amount
  const sortedPayments = [...payments].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  const lastPaymentAmount = sortedPayments.length > 0 ? sortedPayments[0].amount : 0;

  return (
    <div className="ff-payments-tab">
      {/* Top Stats Cards */}
      <div className="ff-pay-stats-grid">
        <div className="ff-pay-stat-card">
          <div className="ff-pay-stat-title">Total Paid</div>
          <div className="ff-pay-stat-value">₹{totalPaid}</div>
        </div>
        <div className="ff-pay-stat-card">
          <div className="ff-pay-stat-title">Pending Amount</div>
          <div className="ff-pay-stat-value" style={{ color: '#eab308' }}>₹{pendingAmount}</div>
        </div>
        <div className="ff-pay-stat-card">
          <div className="ff-pay-stat-title">Last Payment</div>
          <div className="ff-pay-stat-value">₹{lastPaymentAmount}</div>
        </div>
        <div className="ff-pay-stat-card">
          <div className="ff-pay-stat-title">Transactions</div>
          <div className="ff-pay-stat-value">{payments.length}</div>
        </div>
      </div>

      {successMessage && (
        <div className="ff-pay-success-badge">
          ✅ {successMessage}
        </div>
      )}

      {/* History and Action */}
      <div className="ff-pay-main">
        <div className="ff-pay-history">
          <h3 className="ff-pay-history-title">Payment History</h3>
          {loading ? (
            <p>Loading payments...</p>
          ) : (
            <div className="ff-pay-table-wrap">
              <table className="ff-pay-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment ID</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPayments.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "1.5rem", color: "#666" }}>No payments yet.</td>
                    </tr>
                  ) : (
                    sortedPayments.map(p => (
                      <tr key={p._id || Math.random()}>
                        <td>{new Date(p.date || p.createdAt).toLocaleDateString("en-IN")}</td>
                        <td style={{ fontWeight: 600 }}>₹{p.amount}</td>
                        <td>
                          <span className={`ff-pay-status ff-pay-status--${(p.status || 'completed').toLowerCase()}`}>
                            {p.status || 'Completed'}
                          </span>
                        </td>
                        <td style={{ fontFamily: "monospace", fontSize: "0.85em", color: "#666" }}>
                          {p.razorpay_payment_id || p.paymentId || p._id}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="ff-pay-action">
          <h3>Make a Payment</h3>
          <p>Pay your worker securely via Razorpay.</p>
          <div className="ff-pay-input-group">
            <span className="ff-pay-currency">₹</span>
            <input
              type="number"
              className="ff-pay-input"
              placeholder="Amount"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
          </div>
          <button className="ff-pay-btn" onClick={handlePayment}>
            Pay Worker
          </button>
        </div>
      </div>
    </div>
  );
}
