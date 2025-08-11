import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Layout from "../../component/Layout";
import "../../src/app/styles/main.scss";
const TABS = ["Referral Info", "Orbiter", "CosmoOrbiter", "Service/Product", "Follow Up", "Payment History"];


const ReferralDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [dealLogs, setDealLogs] = useState([]);
const [payments, setPayments] = useState([]);
const [newPayment, setNewPayment] = useState({
  paymentFrom: "CosmoOrbiter",
  paymentTo: "Orbiter",
  paymentDate: "",
  description: "",
  amountReceived: "",
  modeOfPayment: "GPay",
});


const [formState, setFormState] = useState({
  referralType: "",
  referralSource: "",
  dealStatus: "",
  dealValue: "",
});
const [followups, setFollowups] = useState([]);
const [newFollowup, setNewFollowup] = useState({
  priority: "Medium",
  date: "",
  description: "",
  status: "Pending",
});


  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Referral Info");



  useEffect(() => {
    if (!id) return;

    const fetchReferral = async () => {
      try {
        const docRef = doc(db, "Referral", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setReferralData(data);
setDealLogs(data.dealLogs || []);

setFollowups(data.followups || []);
setPayments(data.payments || []);

     setFormState({
  referralType: data.referralType || "",
  referralSource: data.referralSource || "",
  dealStatus: data.dealStatus || "Pending",
  dealValue: data.dealValue || "",
  
});


        } else {
          alert("Referral not found.");
        }
      } catch (error) {
        console.error("Error fetching referral:", error);
        alert("Error loading referral.");
      } finally {
        setLoading(false);
      }
    };

    fetchReferral();
  }, [id]);
const handlePaymentChange = (e) => {
  setNewPayment({ ...newPayment, [e.target.name]: e.target.value });
};

const handleAddPayment = async () => {
  try {
    const updatedPayments = [...payments, newPayment];
    const docRef = doc(db, "Referral", id);
    await updateDoc(docRef, {
      payments: updatedPayments,
    });

    setPayments(updatedPayments);
    setNewPayment({
      paymentFrom: "CosmoOrbiter",
      paymentTo: "Orbiter",
      ujbShareType: "UJustBe",
      paymentDate: "",
      description: "",
      amountReceived: "",
    });

    alert("Payment added successfully.");
  } catch (err) {
    console.error("Error adding payment:", err);
    alert("Failed to add payment.");
  }
};

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };
const handleFollowupChange = (e) => {
  setNewFollowup({ ...newFollowup, [e.target.name]: e.target.value });
};
const handleAddFollowup = async () => {
  try {
    const updatedFollowups = [...followups, newFollowup];

    const docRef = doc(db, "Referral", id);
    await updateDoc(docRef, {
      followups: updatedFollowups,
    });

    setFollowups(updatedFollowups);
    setNewFollowup({
      priority: "Medium",
      date: "",
      description: "",
      status: "Pending",
    });
    alert("Follow-up added successfully.");
  } catch (err) {
    console.error("Error adding follow-up:", err);
    alert("Failed to add follow-up.");
  }
};
const mapPaymentLabel = (key) => {
  switch (key) {
    case "Orbiter":
      return orbiter?.name || "Orbiter";
    case "OrbiterMentor":
      return orbiter?.mentorName || "Orbiter Mentor";
    case "CosmoMentor":
      return cosmoOrbiter?.mentorName || "Cosmo Mentor";
    case "CosmoOrbiter":
      return cosmoOrbiter?.name || "CosmoOrbiter";
    case "UJustBe":
      return "UJustBe";
    default:
      return key;
  }
};


  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const docRef = doc(db, "Referral", id);
   await updateDoc(docRef, {
  ...referralData,
  referralType: formState.referralType,
  referralSource: formState.referralSource,
  dealStatus: formState.dealStatus,
  dealValue: formState.dealValue,
  lastUpdated: Timestamp.now(),
});



      alert("Referral updated successfully.");

    } catch (error) {
      console.error("Error updating referral:", error);
      alert("Failed to update referral.");
    }
  };

  if (loading || !referralData) return <p>Loading...</p>;

  const { orbiter, cosmoOrbiter, service, product, referralId } = referralData;

  return (
    <Layout>
      <div className="edit-referral">
        <h2>Edit Referral - {referralId}</h2>

        {/* Tabs */}
        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={tab === activeTab ? "active-tab" : ""}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "Referral Info" && (
            <form onSubmit={handleUpdate}>
              <label>
                Referral Type:
                <input
                  type="text"
                  name="referralType"
                  value={formState.referralType}
                  onChange={handleChange}
                />
              </label>

              <label>
                Referral Source:
                <input
                  type="text"
                  name="referralSource"
                  value={formState.referralSource}
                  onChange={handleChange}
                />
              </label>

              <label>
                Referral ID:
                <input type="text" value={referralId || "—"} disabled />
              </label>
<label>
  Deal Status:
  <select
    name="dealStatus"
    value={formState.dealStatus}
    onChange={handleChange}
  >
    <option value="Pending">Pending</option>
    <option value="Deal Lost">Deal Lost</option>
    <option value="Received Part Payment">Received Part Payment</option>
    <option value="Transferred to UJustBe">Transferred to UJustBe</option>
    <option value="Work in Progress">Work in Progress</option>
    <option value="Work Completed">Work Completed</option>
    <option value="Agreed Percentage Transferred to UJustBe">Agreed Percentage Transferred to UJustBe</option>
    <option value="On Hold">On Hold</option>
    <option value="Rejected">Rejected</option>
    <option value="Not Connected">Not Connected</option>
    <option value="Called but No Response">Called but No Response</option>
    <option value="Discussion in Progress">Discussion in Progress</option>
    <option value="Received Full Payment">Received Full Payment</option>
  </select>
</label>

{referralData?.lastUpdated && (
  <p><strong>Last Updated:</strong> {new Date(referralData.lastUpdated?.seconds * 1000).toLocaleString()}</p>
)}

              <button type="submit">Update Referral</button>
            </form>
          )}

          {activeTab === "Orbiter" && (
       <div className="form-section">
              <h3>Orbiter Info</h3>
              <p><strong>Name:</strong> {orbiter?.name}</p>
              <p><strong>Email:</strong> {orbiter?.email}</p>
              <p><strong>Phone:</strong> {orbiter?.phone}</p>
              <p><strong>Mentor:</strong> {orbiter?.mentorName}</p>
              <p><strong>Mentor Phone:</strong> {orbiter?.mentorPhone}</p>
              <p><strong>UJB Code:</strong> {orbiter?.ujbCode}</p>
            </div>
          )}

          {activeTab === "CosmoOrbiter" && (
            <div>
              <h3>CosmoOrbiter Info</h3>
              <p><strong>Name:</strong> {cosmoOrbiter?.name}</p>
              <p><strong>Email:</strong> {cosmoOrbiter?.email}</p>
              <p><strong>Phone:</strong> {cosmoOrbiter?.phone}</p>
              <p><strong>Mentor:</strong> {cosmoOrbiter?.mentorName}</p>
              <p><strong>Mentor Phone:</strong> {cosmoOrbiter?.mentorPhone}</p>
            </div>
          )}

       {activeTab === "Service/Product" && (
 <div className="form-section">
    {(service || product) ? (
      <>
        <h3>{service ? "Service" : "Product"} Info</h3>
        <p><strong>Name:</strong> {service?.name || product?.name}</p>
        <p><strong>Description:</strong> {service?.description || product?.description}</p>
        {service?.percentage && <p><strong>Percentage:</strong> {service.percentage}%</p>}
        {service?.imageURL && (
          <img src={service.imageURL} alt="Service" style={{ maxWidth: "200px" }} />
        )}

        <label>
          Deal Value:
          <input
            type="number"
            name="dealValue"
            value={formState.dealValue}
            onChange={handleChange}
            placeholder="Enter deal value"
          />
        </label>
{formState.dealValue && (service?.percentage || product?.percentage) && (() => {
  const dealValue = parseFloat(formState.dealValue);
  const percentage = parseFloat(service?.percentage || product?.percentage);
  const agreedAmount = (dealValue * percentage) / 100;

  const orbiterShare = (agreedAmount * 50) / 100;
  const orbiterMentorShare = (agreedAmount * 15) / 100;
  const cosmoMentorShare = (agreedAmount * 15) / 100;
  const ujustbeShare = (agreedAmount * 20) / 100;

  const distribution = {
    dealValue,
    percentage,
    agreedAmount,
    orbiterShare,
    orbiterMentorShare,
    cosmoMentorShare,
    ujustbeShare,
    timestamp: new Date().toISOString(),
  };

  const handleSaveDealLog = async () => {
    try {
      const updatedLogs = [...dealLogs, distribution];
      const docRef = doc(db, "Referral", id);
      await updateDoc(docRef, {
        dealLogs: updatedLogs,
      });
      setDealLogs(updatedLogs);
      alert("Deal distribution saved.");
    } catch (error) {
      console.error("Error saving deal log:", error);
      alert("Failed to save deal distribution.");
    }
  };

  return (
    <>
      <div className="distribution-box">
        <h4>Distribution Breakdown</h4>
        <p><strong>Total Agreed Amount:</strong> ₹{agreedAmount.toFixed(2)}</p>
        <p><strong>Orbiter:</strong> ₹{orbiterShare.toFixed(2)}</p>
        <p><strong>Orbiter's Mentor:</strong> ₹{orbiterMentorShare.toFixed(2)}</p>
        <p><strong>CosmoOrbiter's Mentor:</strong> ₹{cosmoMentorShare.toFixed(2)}</p>
        <p><strong>UJustBe:</strong> ₹{ujustbeShare.toFixed(2)}</p>
      </div>

      <button onClick={handleSaveDealLog}>Save Deal Distribution</button>
    </>
  );
})()}

      </>
    ) : (
      <p>No service or product information available.</p>
    )}
    {dealLogs.length > 0 && (
  <div style={{ marginTop: "2rem" }}>
    <h4>Projected Deal Break Up Details</h4>
     <table className='table-class'>
      <thead>
        <tr>
          <th>Date</th>
          <th>Deal Value</th>
          <th>%</th>
          <th>Agreed Amt</th>
          <th>Orbiter</th>
          <th>Mentor</th>
          <th>Cosmo Mentor</th>
          <th>UJustBe</th>
        </tr>
      </thead>
      <tbody>
        {dealLogs.map((log, i) => (
          <tr key={i}>
            <td>{new Date(log.timestamp).toLocaleString()}</td>
            <td>₹{log.dealValue}</td>
            <td>{log.percentage}%</td>
            <td>₹{log.agreedAmount.toFixed(2)}</td>
            <td>₹{log.orbiterShare.toFixed(2)}</td>
            <td>₹{log.orbiterMentorShare.toFixed(2)}</td>
            <td>₹{log.cosmoMentorShare.toFixed(2)}</td>
            <td>₹{log.ujustbeShare.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

  </div>
  
)}
{activeTab === "Payment History" && (
<div className="form-section">
    <h3>Payment History</h3>

    {payments.length > 0 ? (
      <table className="table-class">
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Mode of Payment</th>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, idx) => (
            <tr key={idx}>
              <td>{mapPaymentLabel(payment.paymentFrom)}</td>
              <td>{mapPaymentLabel(payment.paymentTo)}</td>
              <td>{payment.modeOfPayment || "-"}</td>
              <td>{payment.paymentDate}</td>
              <td>{payment.description}</td>
              <td>₹{payment.amountReceived}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No payments logged yet.</p>
    )}

    <h4>Add Payment</h4>

    <label>
      Payment From:
      <select
        name="paymentFrom"
        value={newPayment.paymentFrom}
        onChange={handlePaymentChange}
      >
        <option value="CosmoOrbiter">{
          cosmoOrbiter?.name || "CosmoOrbiter"
        }</option>
        <option value="Orbiter">{orbiter?.name || "Orbiter"}</option>
      </select>
    </label>

    <label>
      Payment To:
      <select
        name="paymentTo"
        value={newPayment.paymentTo}
        onChange={handlePaymentChange}
      >
        <option value="Orbiter">{orbiter?.name || "Orbiter"}</option>
        <option value="OrbiterMentor">{orbiter?.mentorName || "Orbiter Mentor"}</option>
        <option value="CosmoMentor">{cosmoOrbiter?.mentorName || "Cosmo Mentor"}</option>
        <option value="UJustBe">UJustBe</option>
      </select>
    </label>

    <label>
      Mode of Payment:
      <select
        name="modeOfPayment"
        value={newPayment.modeOfPayment}
        onChange={handlePaymentChange}
      >
        <option value="GPay">GPay</option>
        <option value="Razorpay">Razorpay</option>
        <option value="Bank Transfer">Bank Transfer</option>
        <option value="Cash">Cash</option>
        <option value="Other">Other</option>
      </select>
    </label>

    <label>
      Payment Date:
      <input
        type="date"
        name="paymentDate"
        value={newPayment.paymentDate}
        onChange={handlePaymentChange}
      />
    </label>

    <label>
      Description:
      <textarea
        name="description"
        value={newPayment.description}
        onChange={handlePaymentChange}
      />
    </label>

    <label>
      Amount Received:
      <input
        type="number"
        name="amountReceived"
        value={newPayment.amountReceived}
        onChange={handlePaymentChange}
      />
    </label>

    <button onClick={handleAddPayment}>Add Payment</button>
  </div>

)}


{activeTab === "Follow Up" && (
 <div className="form-section">
    <h3>Follow Up Logs</h3>

    {followups.length > 0 ? (
        <table className='table-class'>
        <thead>
          <tr>
            <th>Priority</th>
            <th>Date</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {followups.map((fup, idx) => (
            <tr key={idx}>
              <td>{fup.priority}</td>
              <td>{fup.date}</td>
              <td>{fup.description}</td>
              <td>{fup.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No follow-ups yet.</p>
    )}
<div className="form-section">
    <h4>Add Follow Up</h4>
    <label>
      Priority:
      <select name="priority" value={newFollowup.priority} onChange={handleFollowupChange}>
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>
    </label>
    <label>
      Date:
      <input
        type="date"
        name="date"
        value={newFollowup.date}
        onChange={handleFollowupChange}
      />
    </label>
    <label>
      Description:
      <textarea
        name="description"
        value={newFollowup.description}
        onChange={handleFollowupChange}
      />
    </label>
    <label>
      Status:
      <select name="status" value={newFollowup.status} onChange={handleFollowupChange}>
        <option>Pending</option>
        <option>Completed</option>
      </select>
    </label>

    <button onClick={handleAddFollowup}>Add Follow Up</button>
  </div>
  </div>
)}

        </div>
      </div>

    <style jsx>{`
  .tabs {
    margin-bottom: 10px;
  }

  .tabs button {
    margin-right: 10px;
    padding: 8px 16px;
    border: none;
    background-color: #16274f;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .tabs button:hover {
    background-color: #ccc;
  }

  .active-tab {
    background-color: #333;
    color: white;
  }

  .tab-content {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background-color: #f9f9f9;
  }

  .tab-content h3,
  .tab-content h4 {
    margin-top: 0;
  }

  form label {
    display: block;
    margin: 12px 0 6px;
    font-weight: 500;
  }

  form input,
  form select,
  form textarea {
    padding: 8px;
    width: 100%;
    box-sizing: border-box;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  textarea {
    min-height: 80px;
  }

  button {
    margin-top: 12px;
    padding: 10px 18px;
    background-color: #fe6f06;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  button:hover {
    background-color: #c85b0dff;
  }

  .distribution-box {
    margin-top: 16px;
    padding: 12px;
    background-color: #f0f8ff;
    border: 1px solid #cce;
    border-radius: 4px;
  }

  .distribution-box p {
    margin: 6px 0;
  }

  .table-class {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  .table-class th,
  .table-class td {
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
  }

  .table-class th {
    background-color: #f2f2f2;
  }

  img {
    margin-top: 10px;
    border-radius: 6px;
    max-width: 100%;
    height: auto;
    display: block;
  }

  @media (max-width: 768px) {
    .tabs button {
      padding: 6px 10px;
      font-size: 14px;
    }

    .table-class th,
    .table-class td {
      padding: 6px;
      font-size: 14px;
    }
  }
`}</style>

    </Layout>
  );
};

export default ReferralDetails;
