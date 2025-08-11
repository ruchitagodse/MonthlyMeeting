import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { TbBlocks } from "react-icons/tb";
import { TbSettingsStar } from "react-icons/tb";
import '../src/app/styles/user.scss';
  import { FiBell, FiGlobe, FiUser, FiHeart, FiBriefcase, FiBox, FiLayers, FiChevronRight } from "react-icons/fi";
import { useRouter } from 'next/router';
import HeaderNav from '../component/HeaderNav';
import { FaCalendarAlt } from 'react-icons/fa';

const db = getFirestore(app);

const Profile = () => {
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cpPoints, setCPPoints] = useState(0);
  const [userDetails, setUserDetails] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const router = useRouter();
const [showContentOnly, setShowContentOnly] = useState(false);

  const getInitials = (name) => name?.split(' ').map(word => word[0]).join('');

  useEffect(() => {
    const storedPhone = localStorage.getItem('mmOrbiter');
    if (storedPhone) {
      const phone = storedPhone.trim();
      setPhoneNumber(phone);
      fetchUserDetails(phone);
      fetchUserName(phone);
      fetchCPPoints(phone);
    }
  }, []);

  const fetchUserDetails = async (phone) => {
    const docSnap = await getDoc(doc(db, 'userdetail', phone));
    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserDetails({
        name: data[' Name'] || '',
        email: data.Email || '',
        dob: data.DOB || '',
        gender: data.Gender || '',
        mobile: data['Mobile no'] || '',
        category: data.Category || '',
        ujbCode: data['UJB Code'] || '',
        ...data,
      });
    }
  };

  const fetchUserName = async (phone) => {
    const docSnap = await getDoc(doc(db, 'userdetail', phone));
    if (docSnap.exists()) setUserName(docSnap.data()[' Name'] || 'User');
  };

  const fetchCPPoints = async (phone) => {
    const snap = await getDocs(collection(db, 'Orbiters', phone, 'activities'));
    let total = 0;
    snap.forEach(doc => total += Number(doc.data()?.points) || 0);
    setCPPoints(total);
  };

  const renderField = (label, value) => (
    <div className="input-group" key={label}>
      <label>{label}</label>
      <input type="text" value={value} readOnly />
    </div>
  );

  const renderArrayField = (label, values) => (
    <div className="input-group" key={label}>
      <label>{label}</label>
      <ul>{values.map((v, i) => <li key={i}>{v}</li>)}</ul>
    </div>
  );

  const orbiterFields = [
    'ID Type', 'ID Number', 'Address (City, State)', 'Marital Status','Languages Known','Hobbies',
    'Interest Area', 'Skills', 'Exclusive Knowledge', 'Aspirations'
  ];

  const healthFields = [
    'Health Parameters', 'Current Health Condition', 'Family History Summary'
  ];

  const professionalFields = [
     'Professional History', 'Current Profession',
    'Educational Background',  'Contribution Area in UJustBe',
    'Immediate Desire', 'Mastery', 'Special Social Contribution'
  ];

  const cosmorbiterExtraFields = [
    'Business Name', 'Business Details (Nature & Type)', 'Business History', 'Noteworthy Achievements',
    'Clientele Base', 'Business Social Media Pages', 'Website', 'Locality', 'Area of Services', 'USP',
    'Business Logo (File Name)', 'Tag Line'
  ];

 const basicFields = [

  renderField('Fullname', userDetails.name),
  renderField('Phone Number', userDetails.mobile),
  renderField('Email Address', userDetails.email),
  renderField('Gender', userDetails.gender),
  renderField('Category', userDetails.category),
  renderField('UJB Code', userDetails.ujbCode),
  <div className="input-group" key="dob">
    <label>Date of Birth</label>
    <div className="date-input">
      <input type="text" value={userDetails.dob} readOnly />
      <span className="calendar-icon"><FaCalendarAlt /></span>
    </div>
  </div>
];


  const additionalFields = orbiterFields.map(field => {
    const value = userDetails[field];
    return Array.isArray(value) ? renderArrayField(field, value) : renderField(field, value || '');
  });

  const healthInfoFields = healthFields.map(field => {
    const value = userDetails[field];
    return renderField(field, value || '');
  });

  const professionalInfoFields = professionalFields.map(field => {
    const value = userDetails[field];
    return renderField(field, value || '');
  });

  const businessFields = userDetails.category?.toLowerCase() === 'cosmorbiter'
    ? cosmorbiterExtraFields.map(field => {
        const value = userDetails[field];
        return renderField(field, value || '');
      })
    : [];

  return (
   <main className="pageContainer">
      <header className="Main m-Header">
        <section className="container">
          <div className="innerLogo" onClick={() => router.push('/')}>
            <img src="/ujustlogo.png" alt="Logo" className="logo" />
          </div>
          <div className="headerRight">
            <button onClick={() => router.push(`/cp-details/${phoneNumber}`)} className="reward-btn">
              <div className="text">CP: {cpPoints}</div>
            </button>
            <div className="userName">
              <span>{getInitials(userName)}</span>
            </div>
          </div>
        </section>
      </header>

      <section className="dashBoardMain">
         {!showContentOnly && (
    <>
      <h2 className="profile-title">My Profile</h2>

      <div className="input-group profile-photo-group" key="profile-photo">
        <div className="profile-photo-wrapper">
          <img
            src={userDetails['Profile Photo URL']}
            alt="Profile"
            className="profile-round-image"
          />
        </div>
        <div className="profile-details">
          <label className="profile-name">{userDetails.name}</label>
          <span className="profile-role">{userDetails.category}</span>
        </div>
      </div>

      <div className="profile-image-section">
        {userDetails['Upload Photo (File Name)'] && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={userDetails['Profile Photo URL']}
              alt="Profile"
              className="profile-photo-img"
            />
            <a
              href={userDetails['Profile Photo URL']}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '12px', marginTop: '5px' }}
            >
              View Image URL
            </a>
          </div>
        )}
      </div>
    </>
  )}

              <div className="tab-contents">
                  <div className="new-profile-container">

 
   
<div className="profile-tab-wrapper">
   

  {/* Show tabs only if showContentOnly is false */}
  {!showContentOnly && (


<div className="vertical-tabs">
  
  <button className="tab-btn" onClick={() => { setActiveTab('basic'); setShowContentOnly(true); }}>
    <FiUser className="tab-icon" />
    <span>Basic Info</span>
    <FiChevronRight className="arrow-icon" />
  </button>

  <button className="tab-btn" onClick={() => { setActiveTab('additional'); setShowContentOnly(true); }}>
    <FiGlobe className="tab-icon" />
    <span>Additional Info</span>
    <FiChevronRight className="arrow-icon" />
  </button>

  <button className="tab-btn" onClick={() => { setActiveTab('health'); setShowContentOnly(true); }}>
    <FiHeart className="tab-icon" />
    <span>Health Info</span>
    <FiChevronRight className="arrow-icon" />
  </button>

  <button className="tab-btn" onClick={() => { setActiveTab('professional'); setShowContentOnly(true); }}>
    <FiBriefcase className="tab-icon" />
    <span>Professional Info</span>
    <FiChevronRight className="arrow-icon" />
  </button>

  {businessFields.length > 0 && (
    <button className="tab-btn" onClick={() => { setActiveTab('business'); setShowContentOnly(true); }}>
      <FiLayers className="tab-icon" />
      <span>Business Info</span>
      <FiChevronRight className="arrow-icon" />
    </button>
  )}

  {userDetails?.services?.length > 0 && (
    <button className="tab-btn" onClick={() => { setActiveTab('services'); setShowContentOnly(true); }}>
      <FiBox className="tab-icon" />
      <span>Services</span>
      <FiChevronRight className="arrow-icon" />
    </button>
  )}

  {userDetails?.products?.length > 0 && (
    <button className="tab-btn" onClick={() => { setActiveTab('products'); setShowContentOnly(true); }}>
      <TbSettingsStar className="tab-icon" />
      <span>Products</span>
      <FiChevronRight className="arrow-icon" />
    </button>
  )}
</div>

  )}
{showContentOnly && (
  <div className="tab-content-area">
    <div className="tab-header">
      <button
        className="back-button"
        onClick={() => setShowContentOnly(false)}
      >
        ←
      </button>
      <span className="tab-title">
        {activeTab === 'basic' && 'Basic Info'}
        {activeTab === 'additional' && 'Additional Info'}
        {activeTab === 'health' && 'Health Info'}
        {activeTab === 'professional' && 'Professional Info'}
        {activeTab === 'business' && 'Business Info'}
        {activeTab === 'services' && 'Services'}
        {activeTab === 'products' && 'Products'}
      </span>
    </div>

    <div className="profile-inputs">
      {activeTab === 'basic' && basicFields}
      {activeTab === 'additional' && additionalFields}
      {activeTab === 'health' && healthInfoFields}
      {activeTab === 'professional' && professionalInfoFields}
{activeTab === 'business' && (
  <div className="business-logo-section">
  {userDetails['Business Logo'] && (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <img
        src={userDetails['Business Logo']}
        alt="Business Logo"
        className="profile-photo-img"
      />
      
    </div>


    )}

    {/* 🔁 Render the business info fields below the logo */}
    {businessFields}
  </div>
)}

      {activeTab === 'services' && (
        <div className="offerings-section">
       
          <div className="offering-list">
          {userDetails.services.map((srv, i) => (
  <div key={i} className="offering-card">
    {srv.imageURL && (
      <img src={srv.imageURL} alt={srv.name} className="offering-image" />
    )}
    <h4>{srv.name}</h4>
    <p>{srv.description}</p>
    {srv.percentage && <p>Agreed Percentage: {srv.percentage}%</p>} {/* ✅ Add this */}
  </div>
))}

          </div>
        </div>
      )}
      {activeTab === 'products' && (
        <div className="offerings-section">
        
          <div className="offering-list">
            {userDetails.products.map((prd, i) => (
  <div key={i} className="offering-card">
    {prd.imageURL && (
      <img src={prd.imageURL} alt={prd.name} className="offering-image" />
    )}
    <h4>{prd.name}</h4>
    <p>{prd.description}</p>
    {prd.percentage && <p>Agreed Percentage: {prd.percentage}%</p>} {/* ✅ Add this */}
  </div>
))}

          </div>
        </div>
      )}
    </div>
  </div>
)}
</div>


          </div>
        </div>

        <HeaderNav />
      </section>
    </main>
  );
};

export default Profile;