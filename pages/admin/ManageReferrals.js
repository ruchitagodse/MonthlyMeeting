import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/router";
import "../../src/app/styles/main.scss";
import Layout from "../../component/Layout";
import ReferralExportButton from "./ExportReferral";

const ManageReferrals = () => {
  const [referrals, setReferrals] = useState([]); // ← Removed :any[]
  const router = useRouter();

  const handleEdit = (referralId) => { // ← Removed : string
    router.push(`/referral/${referralId}`);
  };

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const referralSnap = await getDocs(collection(db, "Referral"));
        const data = referralSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReferrals(data);
      } catch (error) {
        console.error("Failed to fetch referrals:", error);
      }
    };

    fetchReferrals();
  }, []);

  const handleDelete = async (docId) => { // ← Removed : string
    const confirmed = window.confirm(
      "Are you sure you want to delete this referral?"
    );
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "Referral", docId));
      alert("Referral deleted successfully.");
      setReferrals((prev) => prev.filter((ref) => ref.id !== docId));
    } catch (error) {
      console.error("Error deleting referral:", error);
      alert("Failed to delete referral.");
    }
  };

  const getStatusBadge = (status) => {
    const baseClass = "status-badge";
    const lowerStatus = status?.toLowerCase() || "";

    if (lowerStatus.includes("discussion") || lowerStatus === "in progress") {
      return <span className={`${baseClass} progress`}>Discussion in Progress</span>;
    }
    if (lowerStatus.includes("won")) {
      return <span className={`${baseClass} won`}>Closed-Won</span>;
    }
    if (lowerStatus.includes("lost")) {
      return <span className={`${baseClass} lost`}>Closed-Lost</span>;
    }
    if (lowerStatus === "pending") {
      return <span className={`${baseClass} pending`}>Pending</span>;
    }
    return <span className={`${baseClass} default`}>{status || "—"}</span>;
  };

  return (
    <Layout>
      <section className="c-userslist box">
        <h2>Manage Referrals</h2>
        <ReferralExportButton />

        {referrals.length === 0 ? (
          <p>No referrals found.</p>
        ) : (
          <table className="table-class">
            <thead>
              <tr>
                <th>#</th>
                <th>Orbiter Name</th>
                <th>CosmoOrbiter Name</th>
                <th>Referral Type</th>
                <th>Referral ID</th>
                <th>Service/Product Name</th>
                <th>Deal Status</th>
                <th>Updated Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrals
                .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
                .map((referral, index) => (
                  <tr key={referral.id}>
                    <td>{index + 1}</td>
                    <td>{referral.orbiter?.name || "—"}</td>
                    <td>{referral.cosmoOrbiter?.name || "—"}</td>
                    <td>{referral.referralType}</td>
                    <td>{referral.referralId || "—"}</td>

                    <td>
                      {referral.service?.name
                        ? referral.product?.name
                          ? `${referral.service.name} / ${referral.product.name}`
                          : referral.service.name
                        : referral.product?.name || "—"}
                    </td>

                    <td>{referral.dealStatus}</td>

                    <td>
                      {referral.timestamp?.seconds
                        ? new Date(referral.timestamp.seconds * 1000).toLocaleString()
                        : "—"}
                    </td>

                    <td>
                      <div className="twobtn">
                        <button
                          className="m-button-7"
                          style={{
                            marginRight: "10px",
                            backgroundColor: "#f16f06",
                            color: "white",
                          }}
                          onClick={() => handleEdit(referral.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="m-button-7"
                          style={{ backgroundColor: "#FF0000", color: "white" }}
                          onClick={() => handleDelete(referral.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>

      <style jsx>{`
        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .status-badge.progress {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-badge.won {
          background-color: #d4edda;
          color: #155724;
        }
        .status-badge.lost {
          background-color: #f8d7da;
          color: #721c24;
        }
        .status-badge.pending {
          background-color: #d1ecf1;
          color: #0c5460;
        }
        .status-badge.default {
          background-color: #e2e3e5;
          color: #41464b;
        }
      `}</style>
    </Layout>
  );
};

export default ManageReferrals;
