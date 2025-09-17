import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc, Timestamp, arrayUnion } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Layouts from "../../component/Layouts";
import "../../src/app/styles/main.scss";
import "../../src/app/styles/user.scss";
const TABS = ["Referral Info", "Orbiter", "CosmoOrbiter", "Service/Product", "Follow Up", "Payment History"];


const ReferralDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeProfileTab, setActiveProfileTab] = useState("Orbiter");
  const [dealLogs, setDealLogs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [open, setOpen] = useState(false);
  const [showFollowupForm, setShowFollowupForm] = useState(false);  // 👈 Add this
  const [newFollowup, setNewFollowup] = useState({
    priority: "Medium",
    date: "",
    description: "",
    status: "Pending",
  });
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
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



  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Referral Info");

  const [showModal, setShowModal] = useState(false);

  const calculateDistribution = () => {
    const dealValue = parseFloat(formState.dealValue);
    const percentage = parseFloat(service?.percentage || product?.percentage);
    const agreedAmount = (dealValue * percentage) / 100;

    return {
      dealValue,
      percentage,
      agreedAmount,
      orbiterShare: (agreedAmount * 50) / 100,
      orbiterMentorShare: (agreedAmount * 15) / 100,
      cosmoMentorShare: (agreedAmount * 15) / 100,
      ujustbeShare: (agreedAmount * 20) / 100,
      timestamp: new Date().toISOString(),
    };
  };

  const handleSaveDealLog = async () => {
    const distribution = calculateDistribution();
    try {
      const updatedLogs = [...dealLogs, distribution];
      const docRef = doc(db, "Referral", id);
      await updateDoc(docRef, { dealLogs: updatedLogs });
      setDealLogs(updatedLogs);
      setShowModal(false); // close modal
    } catch (error) {
      console.error("Error saving deal log:", error);
      alert("Failed to save deal distribution.");
    }
  };


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

      const newLog = {
        status: formState.dealStatus,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(docRef, {
        dealStatus: formState.dealStatus,
        statusLogs: arrayUnion(newLog), // 👈 push instead of replace
        lastUpdated: Timestamp.now(),
      });

      alert("Referral status updated successfully.");
    } catch (error) {
      console.error("Error updating referral:", error);
      alert("Failed to update referral.");
    }
  };


  if (loading || !referralData) return <p>Loading...</p>;

  const { orbiter, cosmoOrbiter, service, product, referralId } = referralData;

  return (
    <Layouts>

<div className="profileHeaderOneLine">
  <img
    src="https://firebasestorage.googleapis.com/v0/b/monthlymeetingapp.appspot.com/o/profilePhotos%2F9372321663%2FWIN_20250610_09_46_27_Pro.jpg?alt=media&token=de32c42b-0539-4ef8-bbb5-79c53569754b"
    alt="Profile"
    className="profilePhoto"
  />
  <span className="name">Michael Stone</span>
  <span className="company">Genlab Ltd.</span>
  <span className="date">01/20/2025</span>
  <span className="role">COO</span>
  <span className="email">michaelstone@gmail.com</span>
  <span className="phone">202-56-32-945</span>

  <div className="actions">
    <button>📞</button>
    <button>✈️</button>
    <button>✉️</button>
    <button className="statusBtn">In Progress</button>
    <button>⬇️</button>
  </div>
</div>

      <section className="ReferralDetailMain">
        <div className="ReferralInfo">
          <div className="card ReferralStatusCard">
            <div className="cardHeader">
              <h2>Referral Status</h2>
              <span className={`statusBadge ${formState.dealStatus?.toLowerCase().replace(/\s/g, "-")}`}>
                {formState.dealStatus || "Pending"}
              </span>
            </div>

            {/* Referral Info */}
            <div className="cardSection">
              <p><strong>Referral Type:</strong> {formState.referralType || "—"}</p>
              <p><strong>Referral ID:</strong> {referralId || "—"}</p>
            </div>

            {/* Status Update */}
            <div className="cardSection">
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
                  <option value="Agreed Percentage Transferred to UJustBe">
                    Agreed Percentage Transferred to UJustBe
                  </option>
                  <option value="On Hold">On Hold</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Not Connected">Not Connected</option>
                  <option value="Called but No Response">Called but No Response</option>
                  <option value="Discussion in Progress">Discussion in Progress</option>
                  <option value="Received Full Payment">Received Full Payment</option>
                </select>
              </label>
              <button onClick={handleUpdate}>Update Status</button>
            </div>

            {/* Timeline */}
            {referralData?.statusLogs && referralData.statusLogs.length > 0 && (
              <div className="statusHistory">
                <h4>Status History</h4>
                <ul>
                  {referralData.statusLogs.map((log, i) => (
                    <li key={i}>
                      <div className="timelineDot"></div>
                      <div className="timelineContent">
                        <span className="statusLabel">{log.status}</span>
                        <span className="statusDate">
                          {new Date(log.updatedAt.seconds * 1000).toLocaleString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>



          {/* Orbiter profile card */}
          <div className="card OrbiterProfileCard">
            {/* Tabs */}
            <div className="profileTabs">
              <button
                className={activeProfileTab === "Orbiter" ? "active" : ""}
                onClick={() => setActiveProfileTab("Orbiter")}
              >
                Orbiter
              </button>
              <button
                className={activeProfileTab === "Cosmo" ? "active" : ""}
                onClick={() => setActiveProfileTab("Cosmo")}
              >
                Cosmo
              </button>
            </div>

            {/* Orbiter Profile */}
            {activeProfileTab === "Orbiter" && orbiter && (
              <div className="profileCard">
                <div className="profileHeader">
                  <img
                    src={
                      orbiter?.profilePic ||
                      "https://media.licdn.com/dms/image/v2/D4D03AQF8coGp1QhV6w/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1718946015552?e=2147483647&v=beta&t=PE5Hfp0QSxGsRhYgK0SyN7JZe9xetOlGhj58PS9Z1so"
                    }
                    alt={orbiter?.name || "Profile"}
                    className="profileImage"
                  />
                  <h2>{orbiter?.name || "No Name"}</h2>
                  <p className="profileSubtitle">Orbiter</p>
                </div>

                <div className="profileDetails">
                  <h3>Contact Details</h3>
                  <div className="detailsGrid">
                    <p><strong>Email:</strong> {orbiter?.email || "No Email"}</p>
                    <p><strong>Phone:</strong> {orbiter?.phone || "No Phone"}</p>
                    <p><strong>Mentor:</strong> {orbiter?.mentorName || "No Mentor"}</p>
                    <p><strong>Mentor Phone:</strong> {orbiter?.mentorPhone || "No Mentor Phone"}</p>
                    <p><strong>UJB Code:</strong> {orbiter?.ujbCode || "No UJB Code"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cosmo Profile */}
            {activeProfileTab === "Cosmo" && cosmoOrbiter && (
              <div className="profileCard">
                <div className="profileHeader">
                  <img
                    src={
                      cosmoOrbiter?.profilePic ||
                      "https://media.licdn.com/dms/image/v2/D4D03AQF8coGp1QhV6w/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1718946015552?e=2147483647&v=beta&t=PE5Hfp0QSxGsRhYgK0SyN7JZe9xetOlGhj58PS9Z1so"
                    }
                    alt={cosmoOrbiter?.name || "Profile"}
                    className="profileImage"
                  />
                  <h2>{cosmoOrbiter?.name || "No Name"}</h2>
                  <p className="profileSubtitle">Cosmo Orbiter</p>
                </div>

                <div className="profileDetails">
                  <h3>Contact Details</h3>
                  <div className="detailsGrid">
                    <p><strong>Email:</strong> {cosmoOrbiter?.email || "No Email"}</p>
                    <p><strong>Phone:</strong> {cosmoOrbiter?.phone || "No Phone"}</p>
                    <p><strong>Mentor:</strong> {cosmoOrbiter?.mentorName || "No Mentor"}</p>
                    <p><strong>Mentor Phone:</strong> {cosmoOrbiter?.mentorPhone || "No Mentor Phone"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>



          {/* Service/Product Card */}
          <div className="card serviceCard">
            <h2>{service ? "Service" : "Product"} Card</h2>
            <div className="serviceImg">
              <img
                src={service?.imageURL || product?.imageURL || "https://via.placeholder.com/150"}
                alt={service?.name || product?.name || "Service/Product"}
              />
            </div>
            <div>
              {service?.percentage && <p><strong>Percentage:</strong> {service.percentage}%</p>}
              {product?.percentage && <p><strong>Percentage:</strong> {product.percentage}%</p>}
            </div>

            {/* Trigger Modal */}
            <button className="calcDealBtn" onClick={() => setShowModal(true)}>
              Calculate Deal Value
            </button>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="modalOverlay">
              <div className="modalContent">
                <h3>Enter Deal Value</h3>
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

                {formState.dealValue && (() => {
                  const d = calculateDistribution();
                  return (
                    <div className="distribution-box">
                      <h4>Distribution Breakdown</h4>
                      <p><strong>Total Agreed Amount:</strong> ₹{d.agreedAmount.toFixed(2)}</p>
                      <p><strong>Orbiter:</strong> ₹{d.orbiterShare.toFixed(2)}</p>
                      <p><strong>Orbiter's Mentor:</strong> ₹{d.orbiterMentorShare.toFixed(2)}</p>
                      <p><strong>Cosmo Mentor:</strong> ₹{d.cosmoMentorShare.toFixed(2)}</p>
                      <p><strong>UJustBe:</strong> ₹{d.ujustbeShare.toFixed(2)}</p>
                    </div>
                  );
                })()}

                <div className="modalActions">
                  <button onClick={handleSaveDealLog}>Save</button>
                  <button className="cancelBtn" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Deal Value Container */}
          <div className="card DealValueContainer">
            <h2>Deal Value & Distribution</h2>
            {dealLogs.length > 0 ? (
              <div className="dealLogsCards">
                <h4>Projected Deal Break Up Details</h4>
                <div className="dealCardsGrid">
                  {dealLogs.map((log, i) => (
                    <div className="dealCard" key={i}>
                      <p><strong>Date:</strong> {new Date(log.timestamp).toLocaleString()}</p>
                      <p><strong>Deal Value:</strong> ₹{log.dealValue}</p>
                      <p><strong>Percentage:</strong> {log.percentage}%</p>
                      <p><strong>Agreed Amount:</strong> ₹{log.agreedAmount.toFixed(2)}</p>
                      <p><strong>Orbiter:</strong> ₹{log.orbiterShare.toFixed(2)}</p>
                      <p><strong>Mentor:</strong> ₹{log.orbiterMentorShare.toFixed(2)}</p>
                      <p><strong>Cosmo Mentor:</strong> ₹{log.cosmoMentorShare.toFixed(2)}</p>
                      <p><strong>UJustBe:</strong> ₹{log.ujustbeShare.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No deal logs yet. Click "Calculate Deal Value" to start.</p>
            )}
          </div>


          <div className="card followupContainer">
            <h2>Follow Ups</h2>

            {/* Button to toggle form */}
            <button
              className="addFollowupBtn"
              onClick={() => setShowFollowupForm(!showFollowupForm)}
            >
              {showFollowupForm ? "Cancel" : "+ Add Follow Up"}
            </button>

            {/* Form (only when button clicked) */}
            {showFollowupForm && (
              <div className="form-section">
                <h4>Add Follow Up</h4>
                <label>
                  Priority:
                  <select
                    name="priority"
                    value={newFollowup.priority}
                    onChange={handleFollowupChange}
                  >
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
                  <select
                    name="status"
                    value={newFollowup.status}
                    onChange={handleFollowupChange}
                  >
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                </label>

                <div className="formButtons">
                  <button type="button" onClick={handleAddFollowup}>
                    Save Follow Up
                  </button>
                  <button
                    type="button"
                    className="cancelBtn"
                    onClick={() => setShowFollowupForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Existing followups */}
            {followups.length > 0 ? (
              followups.map((fup, idx) => (
                <div className="followupCard" key={idx}>
                  <h3>{fup.priority} Priority</h3>
                  <p><strong>Date:</strong> {fup.date}</p>
                  <p><strong>Description:</strong> {fup.description}</p>
                  <p><strong>Status:</strong> {fup.status}</p>
                </div>
              ))
            ) : (
              <p>No follow-ups yet.</p>
            )}
          </div>

        </div>



        {/* Collapsed Payment Container */}
        {/* Collapsed Payment Container */}
        <div className="PaymentContainer">
          <h4>Last Payment</h4>
          {payments.length > 0 ? (
            <p>
              {mapPaymentLabel(payments[payments.length - 1].paymentFrom)} →{" "}
              {mapPaymentLabel(payments[payments.length - 1].paymentTo)} : ₹
              {payments[payments.length - 1].amountReceived}
            </p>
          ) : (
            <p>No payments yet</p>
          )}
          <button
            className="viewMoreBtn"
            onClick={() => setShowPaymentSheet(true)}  // <-- Use correct state here
          >
            View More
          </button>
        </div>


        {/* Sliding Sheet */}
        <div className={`PaymentSheet ${showPaymentSheet ? "open" : ""}`}>
          <div className="sheetHeader">
            <h3>{showAddPaymentForm ? "Add Payment" : "Payment History"}</h3>
            <button onClick={() => setShowPaymentSheet(false)}>✕</button>
          </div>

          {/* HISTORY VIEW */}
          {!showAddPaymentForm && (
            <>
              {payments.length > 0 ? (
                payments.map((payment, idx) => (
                  <div className="paymentCard" key={idx}>
                    <h4>₹{payment.amountReceived}</h4>
                    <p><strong>From:</strong> {mapPaymentLabel(payment.paymentFrom)}</p>
                    <p><strong>To:</strong> {mapPaymentLabel(payment.paymentTo)}</p>
                    <p><strong>Mode:</strong> {payment.modeOfPayment}</p>
                    <p><strong>Date:</strong> {payment.paymentDate}</p>
                    <p><strong>Description:</strong> {payment.description}</p>
                  </div>
                ))
              ) : (
                <p>No payments yet.</p>
              )}

              {/* Add Payment Button */}
              <button
                className="addPaymentBtn"
                onClick={() => setShowAddPaymentForm(true)}
              >
                + Add Payment
              </button>
            </>
          )}

          {/* ADD PAYMENT FORM */}
          {showAddPaymentForm && (
            <div className="addPaymentForm">
              <label>
                Payment From:
                <select
                  name="paymentFrom"
                  value={newPayment.paymentFrom}
                  onChange={handlePaymentChange}
                >
                  <option value="CosmoOrbiter">{cosmoOrbiter?.name || "CosmoOrbiter"}</option>
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

              <div className="formButtons">
                <button onClick={handleAddPayment}>Save Payment</button>
                <button
                  className="cancelBtn"
                  onClick={() => setShowAddPaymentForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>


      </section>

     



    </Layouts>
  );
};

export default ReferralDetails;
