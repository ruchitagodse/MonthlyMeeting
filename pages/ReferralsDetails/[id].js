'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import Headertop from '../../component/Header';
import HeaderNav from '../../component/HeaderNav';
import '../../src/app/styles/user.scss';

const db = getFirestore(app);

const ReferralDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState("referral");
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchReferral = async () => {
      try {
        const docRef = doc(db, 'Referral', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setReferral(docSnap.data());
        } else {
          console.warn('No referral found');
        }
      } catch (error) {
        console.error('Error fetching referral details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferral();
  }, [id]);

  if (loading) {
    return (
      <div className="loader">
        <span className="loader2"></span>
      </div>
    );
  }

  if (!referral) {
    return <p className="noDataText">No referral found.</p>;
  }

  return (
<main className="pageContainer businessDetailsPage">
      <Headertop />

      <section className="p-meetingDetails">
        <div className="container pageHeading">
          <h2>Referral Details</h2>

          {/* Tabs Navigation */}
      {/* Tabs */}
<div className="custom-tabs">
  <button
    className={`custom-tab ${activeTab === "referral" ? "active" : ""}`}
    onClick={() => setActiveTab("referral")}
  >
    Referral Info
  </button>

  <button
    className={`custom-tab ${activeTab === "orbiter" ? "active" : ""}`}
    onClick={() => setActiveTab("orbiter")}
  >
    Orbiter Details
  </button>

  <button
    className={`custom-tab ${activeTab === "cosmo" ? "active" : ""}`}
    onClick={() => setActiveTab("cosmo")}
  >
    CosmoOrbiter Details
  </button>

  <button
    className={`custom-tab ${activeTab === "product" ? "active" : ""}`}
    onClick={() => setActiveTab("product")}
  >
    Product / Service
  </button>
</div>

{/* Tab Content */}
<div className="eventinnerContent">
  {activeTab === "referral" && (
    <div className="tabs about-section">
      <h3>Referral Info</h3>
      <p><strong>Referral ID:</strong> {referral.referralId || "N/A"}</p>
      <p><strong>Deal Status:</strong> {referral.dealStatus || "N/A"}</p>
      <p><strong>Type:</strong> {referral.referralType || "N/A"}</p>
      <p><strong>Source:</strong> {referral.referralSource || "N/A"}</p>
      <p><strong>Last Updated:</strong> {referral.lastUpdated?.toDate
        ? referral.lastUpdated.toDate().toLocaleString()
        : "N/A"}
      </p>
    </div>
  )}

  {activeTab === "orbiter" && (
    <div className="tabs about-section">
      <h3>Orbiter Details</h3>
      <p><strong>Name:</strong> {referral.orbiter?.name}</p>
      <p><strong>Email:</strong> {referral.orbiter?.email}</p>
      <p><strong>Phone:</strong> {referral.orbiter?.phone}</p>
      <p><strong>Mentor:</strong> {referral.orbiter?.mentorName}</p>
      <p><strong>Mentor Phone:</strong> {referral.orbiter?.mentorPhone}</p>
      <p><strong>UJB Code:</strong> {referral.orbiter?.ujbCode}</p>
    </div>
  )}

  {activeTab === "cosmo" && (
    <div className="tabs about-section">
      <h3>CosmoOrbiter Details</h3>
      <p><strong>Name:</strong> {referral.cosmoOrbiter?.name}</p>
      <p><strong>Email:</strong> {referral.cosmoOrbiter?.email}</p>
      <p><strong>Phone:</strong> {referral.cosmoOrbiter?.phone}</p>
      <p><strong>Mentor:</strong> {referral.cosmoOrbiter?.mentorName}</p>
      <p><strong>Mentor Phone:</strong> {referral.cosmoOrbiter?.mentorPhone}</p>
    </div>
  )}

  {activeTab === "product" && (
    <div className="tabs about-section">
      <h3>Product / Service Details</h3>
      <p><strong>Name:</strong> {referral.product?.name || referral.service?.name}</p>
      <p><strong>Description:</strong> {referral.product?.description || referral.service?.description}</p>
      <p><strong>Percentage:</strong> {referral.product?.percentage || "N/A"}%</p>

      {referral.product?.imageURL && (
        <img
          src={referral.product.imageURL}
          alt="Product"
          className="productImage"
        />
      )}
    </div>
  )}
</div>
</div>

        <HeaderNav />
      </section>
    </main>
  );
};

export default ReferralDetails;
