import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs ,doc,getDoc} from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { useRouter } from 'next/router';
import Link from 'next/link';
import HeaderNav from '../component/HeaderNav';
import '../src/app/styles/user.scss';
import { FaMapMarkerAlt } from "react-icons/fa";

const db = getFirestore(app);

const AllEvents = () => {
  const [cosmOrbiters, setCosmOrbiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [cpPoints, setCPPoints] = useState(0);
  const router = useRouter();
  const filteredOrbiters = cosmOrbiters.filter((co) => {
    const query = searchQuery.toLowerCase();
    return (
      co.name.toLowerCase().includes(query) ||
      co.businessName.toLowerCase().includes(query) ||
       co.businessHistory.toLowerCase().includes(query) ||
      co.city.toLowerCase().includes(query) ||
      co.locality.toLowerCase().includes(query) ||
      co.state.toLowerCase().includes(query)
    );
  });

  const getInitials = (name) =>
    name
      ? name
        .split(' ')
        .map((word) => word[0])
        .join('')
      : '';

  useEffect(() => {
    const fetchCosmOrbiters = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'userdetail'));
        const list = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data.Category === 'CosmOrbiter' &&
            ((Array.isArray(data.services) && data.services.length > 0) ||
              (Array.isArray(data.products) && data.products.length > 0))
          ) {
            list.push({
              id: doc.id,
              name: data[' Name'] || 'Unknown',
              businessName: data['Business Name'] || 'N/A',
                businessHistory: data['Business History'] || 'N/A',
              tagline: data['Tag Line'] || '',
              city: data.City || '',
              locality: data.Locality || '',
              state: data.State || '',
              logo: data['Business Logo'] || '',

              // ✅ New fields
              category: data.Category || '',
              category1: data['Category 1'] || '',
              category2: data['Category 2'] || '',
            });
          }
        });

        setCosmOrbiters(list);
      } catch (error) {
        console.error('Error fetching CosmOrbiters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCosmOrbiters();
  }, []);

useEffect(() => {
  const storedPhoneNumber = localStorage.getItem('mmOrbiter');
  if (storedPhoneNumber) {
    fetchUserName(storedPhoneNumber);
    setPhoneNumber(storedPhoneNumber);
  } else {
    console.error("Phone number not found in localStorage.");
  }
}, []);
const fetchUserName = async (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
    console.error("Invalid phone number:", phoneNumber);
    return;
  }

  console.log("Fetch User from Userdetails", phoneNumber);
  try {
    const userRef = doc(db, 'userdetails', phoneNumber);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const orbitername = userDoc.data()[" Name"] || 'User';
      setUserName(orbitername);
    } else {
      console.log("User not found in userdetails");
    }
  } catch (err) {
    console.error("Error fetching user name:", err);
  }
};
  return (
    <main className="pageContainer">
      <header className="Main m-Header">
        <section className="container">
          <div className="innerLogo" onClick={() => router.push('/')}>
            <img src="/ujustlogo.png" alt="Logo" className="logo" />
          </div>

          <div className="headerRight">
            <button
              onClick={() => router.push(`/cp-details/${phoneNumber}`)}
              className="reward-btn"
            >
              <div className="text">CP: {cpPoints}</div>
            </button>
            <div className="userName">
              <span>{getInitials(userName)}</span>
            </div>
          </div>
        </section>
      </header>

      <section className="dashBoardMain">
        <div className="sectionHeadings">
          <h2>CosmOrbiters Businesses</h2>
        
        </div>
      
<div className="search">
   <input
            type="text"
            placeholder="Search by name, business, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search__input"
          />
    <button className="search__button">
        <svg className="search__icon" aria-hidden="true" viewBox="0 0 24 24">
            <g>
                <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
            </g>
        </svg>
    </button>
</div>


        <div className="container eventList">
          {loading ? (
            <div className='loader'>
              <span className="loader2"></span>
            </div>
          ) : filteredOrbiters.length === 0 ? (
            <p className="noDataText">No CosmOrbiters found.</p>
          ) : (
            filteredOrbiters.map((co, index) => (
              <Link href={`/BusinessDetails/${co.id}`} key={index} className="meetingBoxLink">
                <div className="cosmoCard" key={index}>
                  {/* Top Row: Logo + Business Info */}
                  <div className="cosmoCard-header">
                    <img
                      src={co.logo || "/default-logo.png"}
                      alt={co.businessName}
                      className="cosmoCard-logo"
                    />
                    <div className="cosmoCard-info">
                      <p className="cosmoCard-category">  {co.category1} • {co.category2}</p>

                      <h3 className="cosmoCard-owner">{co.businessName}</h3>
                      <div className="cosmoCard-location">
                        <div>
                          <FaMapMarkerAlt />
                        </div> 
                        <p>{co.locality} {co.city} {co.state}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Rating + Percentage + Button */}
                  {/* <div className="cosmoCard-footer">
    <div className="cosmoCard-stats">
      <span className="cosmoCard-rating">⭐ 3</span>
      <span className="cosmoCard-percentage">% shared {co.percentage || 10}</span>
    </div>
    <button
      className="cosmoCard-referBtn"
      onClick={(e) => {
        e.stopPropagation();
        alert(`Refer Now for ${co.businessName}`);
      }}
    >
      REFER NOW
    </button>
  </div> */}
                </div>

              </Link>

            ))
          )}
        </div>

        <HeaderNav />
      </section>
    </main>
  );
};

export default AllEvents;
