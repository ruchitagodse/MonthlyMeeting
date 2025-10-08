'use client';

import React, { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { CiImageOn } from 'react-icons/ci';
import { MdArrowBack } from 'react-icons/md';
import { toast } from 'react-hot-toast';

const db = getFirestore(app);

const ReferralModal = ({ item, onClose, userCache, setUserCache }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [orbiterDetails, setOrbiterDetails] = useState({ name: '', phone: '', email: '' });
  const [selectedOption, setSelectedOption] = useState(item?.name || '');
  const [leadDescription, setLeadDescription] = useState('');
  const [selectedFor, setSelectedFor] = useState('self');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [otherName, setOtherName] = useState('');
  const [otherPhone, setOtherPhone] = useState('');
  const [otherEmail, setOtherEmail] = useState('');

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userCache[item.id]) {
        setUserDetails(userCache[item.id]);
        setServices(userCache[item.id].services);
        setProducts(userCache[item.id].products);
      } else {
        const snap = await getDoc(doc(db, 'userdetail', item.id));
        if (snap.exists()) {
          const data = snap.data();
          const userData = {
            name: data[' Name'] || '',
            email: data.Email || '',
            phone: data['Mobile no'] || '',
            businessName: data['Business Name'] || 'N/A',
            logo: data['Business Logo'] || '',
            services: Array.isArray(data.services) ? data.services : [],
            products: Array.isArray(data.products) ? data.products : [],
          };
          setUserCache((prev) => ({ ...prev, [item.id]: userData }));
          setUserDetails(userData);
          setServices(userData.services);
          setProducts(userData.products);
        }
      }

      // Orbiter details
      const storedPhone = localStorage.getItem('mmOrbiter');
      if (storedPhone) {
        const orbSnap = await getDoc(doc(db, 'userdetail', storedPhone.trim()));
        if (orbSnap.exists()) {
          const d = orbSnap.data();
          setOrbiterDetails({
            name: d[' Name'] || '',
            email: d.Email || '',
            phone: d['Mobile no'] || '',
          });
        }
      }
    };

    fetchUserDetails();
  }, [item]);

  const handleSubmit = async () => {
    if (!selectedOption || !leadDescription.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      const data = {
        referralType: selectedFor === 'self' ? 'Self' : 'Others',
        leadDescription,
        timestamp: new Date(),
        cosmoOrbiter: {
          name: userDetails.name,
          email: userDetails.email,
          phone: userDetails.phone,
        },
        orbiter:
          selectedFor === 'self'
            ? orbiterDetails
            : { name: otherName, phone: otherPhone, email: otherEmail },
      };

      await addDoc(collection(db, 'Referral'), data);
      toast.success('Referral sent successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to send referral.');
    }
  };

  return (
    <div className="ref-modal-overlay">
      <div></div>
      <div className="ref-modal-content">
        <div className="modelheader">
          <button className="back-btn" onClick={onClose}><MdArrowBack /></button>
          <h3>Refer now</h3>
        </div>

        <div className="modelContent">
          <div className="profile-section">
            <div className="businessLogo">
              {userDetails?.logo ? (
                <img src={userDetails.logo} alt={userDetails.businessName} />
              ) : (
                <CiImageOn />
              )}
            </div>
            <h4 className="profile-name">{userDetails?.businessName}</h4>

            {/* Dropdown */}
            <div className="dropdownMain">
              <button className="dropdown-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {selectedOption || 'Select product or service*'}
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  {services.concat(products).map((opt, i) => (
                    <div
                      key={i}
                      className="dropdown-item"
                      onClick={() => {
                        setSelectedOption(opt.name);
                        setDropdownOpen(false);
                      }}
                    >
                      {opt.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea
              className="description-input"
              placeholder="Short description of the lead*"
              value={leadDescription}
              onChange={(e) => setLeadDescription(e.target.value)}
            />

            {selectedFor === 'someone' && (
              <div className="ref-section">
                <h4 className="ref-subtitle">Orbiter Info (Others)</h4>
                <input type="text" placeholder="Name" value={otherName} onChange={(e) => setOtherName(e.target.value)} className="ref-input" />
                <input type="text" placeholder="Phone" value={otherPhone} onChange={(e) => setOtherPhone(e.target.value)} className="ref-input" />
                <input type="email" placeholder="Email" value={otherEmail} onChange={(e) => setOtherEmail(e.target.value)} className="ref-input" />
              </div>
            )}
          </div>

          <div className="form-container">
            <div className="buttons">
              <button
                className={`border-btn ${selectedFor === 'self' ? 'active' : ''}`}
                onClick={() => setSelectedFor('self')}
              >
                For Self
              </button>
              <button
                className={`border-btn ${selectedFor === 'someone' ? 'active' : ''}`}
                onClick={() => setSelectedFor('someone')}
              >
                For Someone Else
              </button>
            </div>
          </div>
        </div>

        <div className="modelheader">
          <button className="submit-btn" onClick={handleSubmit}>Send Referral</button>
        </div>
      </div>
    </div>
  );
};

export default ReferralModal;