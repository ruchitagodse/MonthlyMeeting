import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/router";
import "../../src/app/styles/main.scss";
import Layout from "../../component/Layout";


const ManageReferrals = () => {
  const [referrals, setReferrals] = useState([]);
const router = useRouter();

const handleEdit = (referralId) => {
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

  const handleDelete = async (docId) => {
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



  return (
    <Layout>
   <section className="c-userslist box">
  <h2>Manage Referrals</h2>

  {referrals.length === 0 ? (
    <p>No referrals found.</p>
  ) : (
    <table className="table-class">
     <thead>
  <tr>
    <th>#</th>
    <th>Orbiter Name</th>
    <th>CosmoOrbiter Name</th>
    <th>Orbiter Email</th>
    <th>Cosmo Email</th>
    <th>Referral Type</th>
    <th>Referral Source</th>
    <th>Referral ID</th>
    <th>Service/Product Name</th>
    <th>Service/Product Description</th>
    <th>Updated Date</th>
    <th>Actions</th>
  </tr>
</thead>

     <tbody>
  {referrals.map((referral, index) => (
    <tr key={referral.id}>
      <td>{index + 1}</td>
      <td>{referral.orbiter?.name}</td>
      <td>{referral.orbiter?.email}</td>
      <td>{referral.cosmoOrbiter?.name}</td>
      <td>{referral.cosmoOrbiter?.email}</td>
      <td>{referral.referralType}</td>
      <td>{referral.referralSource}</td>

      {/* ✅ Referral ID */}
      <td>{referral.referralId || '—'}</td>

      {/* ✅ Service/Product Name */}
      <td>
        {referral.referralType === 'service' && referral.service
          ? referral.service.name
          : referral.product
          ? referral.product.name
          : '—'}
      </td>

      {/* ✅ Service/Product Description */}
      <td>
        {referral.referralType === 'service' && referral.service
          ? referral.service.description
          : referral.product
          ? referral.product.description
          : '—'}
      </td>

      {/* ✅ Timestamp */}
      <td>{referral.timestamp?.seconds ? new Date(referral.timestamp.seconds * 1000).toLocaleString() : '—'}</td>

      {/* ✅ Actions */}
      <td>
        <button onClick={() => handleEdit(referral.id)}>Edit</button>
        <button onClick={() => handleDelete(referral.id)}>Delete</button>
      </td>
    </tr>
  ))}
</tbody>

    </table>
  )}
</section>

    </Layout>
  );
};

export default ManageReferrals;
