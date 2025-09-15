import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Layout from "../../component/Layout";
import "../../src/app/styles/main.scss";

const Profiling = () => {
  const [users, setUsers] = useState([]);
  const [orbiterSearch, setOrbiterSearch] = useState("");
  const [cosmoSearch, setCosmoSearch] = useState("");
  const [selectedOrbiter, setSelectedOrbiter] = useState(null);
  const [selectedCosmo, setSelectedCosmo] = useState(null);
  const [services, setServices] = useState([]);
  const [dealStatus, setDealStatus] = useState("Pending");
const [lastUpdated, setLastUpdated] = useState(new Date());

  const [products, setProducts] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [referralType, setReferralType] = useState("Service");
  const [referralSource, setReferralSource] = useState("MonthlyMeeting");

  const [refType, setRefType] = useState("Self");
  const [otherName, setOtherName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [otherEmail, setOtherEmail] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "userdetail"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleOrbiterSelect = (user) => {
    setSelectedOrbiter(user);
    setOrbiterSearch(user[" Name"]);
  };

  const handleCosmoSelect = async (user) => {
    setSelectedCosmo(user);
    setCosmoSearch(user[" Name"]);
    setSelectedService(null);
    setSelectedProduct(null);
    setServices([]);
    setProducts([]);

    const docRef = doc(db, "userdetail", user.id);
    const userDoc = await getDoc(docRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setServices(userData.services || []);
      setProducts(userData.products || []);
    }
  };

  const generateReferralId = async () => {
    const now = new Date();
    const year1 = now.getFullYear() % 100;
    const year2 = (now.getFullYear() + 1) % 100;
    const refPrefix = `Ref/${year1}-${year2}/`;

    const q = query(collection(db, "Referral"), orderBy("referralId", "desc"), limit(1));
    const snapshot = await getDocs(q);
    let lastNum = 2999;
    if (!snapshot.empty) {
      const lastRef = snapshot.docs[0].data().referralId;
      const match = lastRef?.match(/\/(\d{8})$/);
      if (match) lastNum = parseInt(match[1]);
    }
    return `${refPrefix}${String(lastNum + 1).padStart(8, "0")}`;
  };

  const sendWhatsAppTemplate = async (phone, name, message) => {
    const formatted = String(phone || "").replace(/\s+/g, "");
    const payload = {
      messaging_product: "whatsapp",
      to: formatted,
      type: "template",
      template: {
        name: "referral_module",
        language: { code: "en" },
        components: [{ type: "body", parameters: [{ type: "text", text: name }, { type: "text", text: message }] }],
      },
    };

    await fetch("https://graph.facebook.com/v19.0/527476310441806/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer EAAHwbR1fvgsBOwUInBvR1SGmVLSZCpDZAkn9aZCDJYaT0h5cwyiLyIq7BnKmXAgNs0ZCC8C33UzhGWTlwhUarfbcVoBdkc1bhuxZBXvroCHiXNwZCZBVxXlZBdinVoVnTB7IC1OYS4lhNEQprXm5l0XZAICVYISvkfwTEju6kV4Aqzt4lPpN8D3FD7eIWXDhnA4SG6QZDZD",
      },
      body: JSON.stringify(payload),
    });
  };

  const handleSubmit = async () => {
    if (
      !selectedOrbiter ||
      !selectedCosmo ||
      (!selectedService && !selectedProduct)
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const referralId = await generateReferralId();

    const data = {
  referralId,
  orbiter: {
    name: selectedOrbiter[" Name"],
    email: selectedOrbiter["Email"],
    phone: selectedOrbiter["Mobile no"],
    ujbCode: selectedOrbiter["UJB Code"],
    mentorName: selectedOrbiter["Mentor Name"],
    mentorPhone: selectedOrbiter["Mentor Phone"],
  },
  cosmoOrbiter: {
    name: selectedCosmo[" Name"],
    email: selectedCosmo["Email"],
    phone: selectedCosmo["Mobile no"],
    mentorName: selectedCosmo["Mentor Name"],
    mentorPhone: selectedCosmo["Mentor Phone"],
  },
  service: selectedService,
  product: selectedProduct,
  referralType: refType,
  referralSource,
  orbitersInfo:
    refType === "Others"
      ? {
          name: otherName,
          phone: otherPhone,
          email: otherEmail,
        }
      : null,
  dealStatus,
  lastUpdated: lastUpdated,
  timestamp: new Date(),
};


    try {
      await addDoc(collection(db, "Referral"), data);
      alert("Referral submitted successfully!");

      const serviceOrProduct = selectedService?.name || selectedProduct?.name || "";

      await Promise.all([
        sendWhatsAppTemplate(selectedOrbiter["Mobile no"], selectedOrbiter[" Name"], `Thanks for passing the referral.`),
        sendWhatsAppTemplate(selectedCosmo["Mobile no"], selectedCosmo[" Name"], `${selectedOrbiter[" Name"]} has referred you for ${serviceOrProduct}.`),
        sendWhatsAppTemplate(selectedOrbiter["Mentor Phone"], selectedOrbiter["Mentor Name"], `Your connect ${selectedOrbiter[" Name"]} passed a referral.`),
        sendWhatsAppTemplate(selectedCosmo["Mentor Phone"], selectedCosmo["Mentor Name"], `Your connect ${selectedCosmo[" Name"]} received a referral.`),
      ]);
    } catch (err) {
      console.error("Error submitting referral:", err);
      alert("Submission failed.");
    }
  };

  return (
  <Layout>
  <section className="admin-profile-container">
    {/* Header */}
    <div className="admin-profile-header">
      <h2>Add Referral</h2>
      <button className="btn-back" onClick={() => window.history.back()}>
        Back
      </button>
    </div>

    {/* Form */}
    <ul className="admin-profile-form">
      {/* Orbiter Search */}
      <li className="form-group">
        <h4>Search Orbiter</h4>
        <input
          type="text"
          value={orbiterSearch}
          onChange={(e) => setOrbiterSearch(e.target.value)}
        />
        {orbiterSearch && (
          <ul className="search-results">
           {users
  .filter((u) => {
    const name = u[" Name"] || ""; // fallback to empty string
    return name.toLowerCase().includes(orbiterSearch.toLowerCase());
  })
  .map((user) => (
    <li key={user.id} onClick={() => handleOrbiterSelect(user)}>
      {user[" Name"]}
    </li>
  ))}

          </ul>
        )}
      </li>

      {/* Cosmo Search */}
     {/* Cosmo Search */}
<li className="form-group">
  <h4>Search CosmoOrbiter</h4>
  <input
    type="text"
    value={cosmoSearch}
    onChange={(e) => setCosmoSearch(e.target.value)}
  />
  {cosmoSearch && (
    <ul className="search-results">
     {users
  .filter((u) => {
    const name = u[" Name"] || "";
    return (
      u.Category === "CosmOrbiter" &&
      ((Array.isArray(u.products) && u.products.length > 0) ||
        (Array.isArray(u.services) && u.services.length > 0)) &&
      name.toLowerCase().includes(cosmoSearch.toLowerCase())
    );
  })
  .map((user) => (
    <li key={user.id} onClick={() => handleCosmoSelect(user)}>
      {user[" Name"]}
    </li>
  ))}

    </ul>
  )}
</li>

      {/* Services */}
      {services.length > 0 && (
        <li className="form-group">
          <label>Select Service</label>
          <select
            onChange={(e) =>
              setSelectedService(
                services.find((s) => s.name === e.target.value)
              )
            }
          >
            <option value="">-- Select Service --</option>
            {services.map((service, idx) => (
              <option key={idx} value={service.name}>
                {service.name} 
              </option>
            ))}
          </select>
        </li>
      )}

      {/* Products */}
      {products.length > 0 && (
        <li className="form-group">
          <label>Select Product</label>
          <select
            onChange={(e) =>
              setSelectedProduct(
                products.find((p) => p.name === e.target.value)
              )
            }
          >
            <option value="">-- Select Product --</option>
            {products.map((product, idx) => (
              <option key={idx} value={product.name}>
                {product.name} - {product.description}
              </option>
            ))}
          </select>
        </li>
      )}

      {/* Deal Status */}
      <li className="form-group">
        <label>Deal Status</label>
        <select
          value={dealStatus}
          onChange={(e) => {
            setDealStatus(e.target.value);
            setLastUpdated(new Date());
          }}
        >
          <option value="Pending">Pending</option>
          <option value="Deal Lost">Deal Lost</option>
            <option value="Deal Won">Deal Won</option>
          <option value="Received Part Payment">Received Part Payment</option>
          <option value="Transferred to UJustBe">
            Transferred to UJustBe
          </option>
          <option value="Work in Progress">Work in Progress</option>
          <option value="Work Completed">Work Completed</option>
          <option value="Agreed Percentage Transferred to UJustBe">
            Agreed Percentage Transferred to UJustBe
          </option>
          <option value="On Hold">On Hold</option>
          <option value="Rejected">Rejected</option>
          <option value="Not Connected">Not Connected</option>
          <option value="Called but No Response">
            Called but No Response
          </option>
          <option value="Discussion in Progress">
            Discussion in Progress
          </option>
          <option value="Received Full Payment">
            Received Full Payment
          </option>
        </select>
      </li>

      {/* Referral Type */}
      <li className="form-group">
        <label>Referral Type</label>
        <select
          value={refType}
          onChange={(e) => setRefType(e.target.value)}
        >
          <option value="Self">Self</option>
          <option value="Others">Others</option>
        </select>
      </li>

      {/* Others Info */}
      {refType === "Others" && (
        <li className="form-group">
          <h4>Orbiter Info (Others)</h4>
          <input
            type="text"
            placeholder="Name"
            value={otherName}
            onChange={(e) => setOtherName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Phone"
            value={otherPhone}
            onChange={(e) => setOtherPhone(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={otherEmail}
            onChange={(e) => setOtherEmail(e.target.value)}
          />
        </li>
      )}

      {/* Referral Source */}
  {/* Referral Source */}
<li className="form-group">
  <label>Referral Source</label>
  <select
    value={referralSource}
    onChange={(e) => setReferralSource(e.target.value)}
  >
    <option value="MonthlyMeeting">Monthly Meeting</option>
    <option value="ConclaveMeeting">Conclave Meeting</option>
       <option value="OTCMeeting">OTC Meeting</option>
    <option value="Phone">Phone</option>
    <option value="Other">Other</option>
  </select>

  {referralSource === "Other" && (
    <input
      type="text"
      placeholder="Enter Referral Source"
      value={referralSource === "Other" ? otherName : ""}
      onChange={(e) => setReferralSource(e.target.value)}
      style={{ marginTop: "8px" }}
    />
  )}
</li>

    </ul>

    {/* Submit Button */}
    <button className="btn-submit" onClick={handleSubmit}>
      Submit Referral
    </button>
  </section>
</Layout>

  );
};

export default Profiling;
