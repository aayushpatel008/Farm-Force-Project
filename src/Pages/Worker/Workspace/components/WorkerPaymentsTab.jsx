import React, { useState, useEffect } from "react";
import axios from "axios";
import "./WorkerPaymentsTab.css";

export default function WorkerPaymentsTab({ workspaceId }) {
  const [payments, setPayments] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  // Find the last payment amount
  const sortedPayments = [...payments].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  const lastPaymentAmount = sortedPayments.length > 0 ? sortedPayments[0].amount : 0;

  return (
    <div className="ff-payments-tab">
      {/* Top Stats Cards */}
      <div className="ff-pay-stats-grid">
        <div className="ff-pay-stat-card">
          <div className="ff-pay-stat-title">Total Earned</div>
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

      {/* History */}
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
                      <td colSpan="4" style={{ textAlign: "center", padding: "1.5rem", color: "#666" }}>No payments received yet.</td>
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
      </div>
    </div>
  );
}
