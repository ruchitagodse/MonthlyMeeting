import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs,doc,getDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig'; 
import '../src/app/styles/user.scss';
import { useRouter } from 'next/router';
import Link from 'next/link'
import HeaderNav from '../component/HeaderNav';
const db = getFirestore(app);
import { FaCalendarAlt } from "react-icons/fa";
const Profile = () => {
  const [events, setEvents] = useState([]);
   const [userName, setUserName] = useState('');
     const [phoneNumber, setPhoneNumber] = useState('');
   const router = useRouter();
    const [cpPoints, setCPPoints] = useState(0);
const [userDetails, setUserDetails] = useState({
  name: '',
  email: '',
  dob: '',
  gender: '',
  mobile: '',
  category: '',
  ujbCode: '',
});


  useEffect(() => {
  
const fetchAllEvents = async () => {
  try {
    const storedPhoneNumber = localStorage.getItem('mmOrbiter');

    if (!storedPhoneNumber) {
      console.warn('Phone number not found in localStorage');
      return; // Stop the function if there's no phone number
    }

    const querySnapshot = await getDocs(collection(db, 'MonthlyMeeting'));

    const eventList = await Promise.all(
      querySnapshot.docs.map(async (eventDoc) => {
        const eventData = { id: eventDoc.id, ...eventDoc.data() };

        const regUserRef = doc(db, 'MonthlyMeeting', eventDoc.id, 'registeredUsers', storedPhoneNumber);
        const regUserSnap = await getDoc(regUserRef);

        eventData.isUserRegistered = regUserSnap.exists();

        return eventData;
      })
    );

    setEvents(eventList);
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

    fetchAllEvents();
  }, []);
 const getInitials = (name) => {
    return name
      .split(" ") // Split the name into words
      .map(word => word[0]) // Get the first letter of each word
      .join(""); // Join them together
  };
useEffect(() => {
  const storedPhoneNumber = localStorage.getItem('mmOrbiter');
  if (storedPhoneNumber) {
    fetchUserDetails(storedPhoneNumber.trim());
     fetchUserName(storedPhoneNumber);
    setPhoneNumber(storedPhoneNumber.trim());
  } else {
    console.error("Phone number not found in localStorage.");
  }
}, []);

const fetchUserDetails = async (phone) => {
  try {
    const docRef = doc(db, 'userdetails', phone);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserDetails({
        name: data[" Name"] || '',
        email: data.Email || '',
        dob: data.DOB || '',
        gender: data.Gender || '',
        mobile: data["Mobile no"] || '',
        category: data.Category || '',
        ujbCode: data["UJB Code"] || '',
      });
    } else {
      console.warn("User details not found in Firestore.");
    }
  } catch (err) {
    console.error("Error fetching user details:", err);
  }
};


  
useEffect(() => {
  if (!phoneNumber) return; // 👈 important check

  const fetchCP = async () => {
    try {
      const activitiesRef = collection(db, "Orbiters", phoneNumber, "activities");
      const activitiesSnapshot = await getDocs(activitiesRef);

      let totalCP = 0;

      activitiesSnapshot.forEach((doc) => {
        const data = doc.data();
        totalCP += Number(data?.points) || 0;
      });

      setCPPoints(totalCP);
    } catch (error) {
      console.error("Error fetching CP points:", error);
    }
  };

  fetchCP();
}, [phoneNumber]);


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
    <>
    <main className="pageContainer">
      <header className='Main m-Header'>
        <section className='container'>
          <div className='innerLogo' onClick={() => router.push('/')}>
            <img src="/ujustlogo.png" alt="Logo" className="logo" />
          </div>
           <div className='headerRight'>
              <button onClick={() => router.push(`/cp-details/${phoneNumber}`)} class="reward-btn">
                <div class="IconContainer">
                  <svg
                    class="box-top box"
                    viewBox="0 0 60 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 18L58 18"
                      stroke="#6A8EF6"
                      stroke-width="4"
                      stroke-linecap="round"
                    ></path>
                    <circle
                      cx="20.5"
                      cy="9.5"
                      r="7"
                      fill="#101218"
                      stroke="#6A8EF6"
                      stroke-width="5"
                    ></circle>
                    <circle
                      cx="38.5"
                      cy="9.5"
                      r="7"
                      fill="#101218"
                      stroke="#6A8EF6"
                      stroke-width="5"
                    ></circle>
                  </svg>

                  <svg
                    class="box-body box"
                    viewBox="0 0 58 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <mask id="path-1-inside-1_81_19" fill="white">
                      <rect width="58" height="44" rx="3"></rect>
                    </mask>
                    <rect
                      width="58"
                      height="44"
                      rx="3"
                      fill="#101218"
                      stroke="#6A8EF6"
                      stroke-width="8"
                      mask="url(#path-1-inside-1_81_19)"
                    ></rect>
                    <line
                      x1="-3.61529e-09"
                      y1="29"
                      x2="58"
                      y2="29"
                      stroke="#6A8EF6"
                      stroke-width="6"
                    ></line>
                    <path
                      d="M45.0005 20L36 3"
                      stroke="#6A8EF6"
                      stroke-width="5"
                      stroke-linecap="round"
                    ></path>
                    <path
                      d="M21 3L13.0002 19.9992"
                      stroke="#6A8EF6"
                      stroke-width="5"
                      stroke-linecap="round"
                    ></path>
                  </svg>

                  <div class="coin"></div>
                </div>
                <div class="text">CP: {cpPoints}</div>  
              </button>
              <div className='userName'> <span>{getInitials(userName)}</span> </div>
            </div>

        
        </section>
      </header>
      <section className='dashBoardMain'>
     <div className='sectionHeadings'>
          {/* <h2>Dash</h2>  */}
         </div>
<div className="new-profile-container">
 <div className="profile-image-section">
  <div className="profile-initial-circle">
    {getInitials(userDetails.name || 'U')}
  </div>
  {/* <div className="edit-icon"><FaCamera/></div> */}
</div>


  <div className="profile-inputs">
    <label>Fullname</label>
    <input type="text" value={userDetails.name} readOnly />

    <label>Phone Number</label>
    <div className="phone-input">
      <span className="country-code">+91</span>
      <input type="text" value={userDetails.mobile} readOnly />
    </div>

    <label>Email Address</label>
    <input type="text" value={userDetails.email} readOnly />

    <label>Date of Birth</label>
    <div className="date-input">
      <input type="text" value={userDetails.dob} readOnly placeholder="DD/MM/YY" />
      <span className="calendar-icon"><FaCalendarAlt/></span>
    </div>
  </div>
</div>


    <HeaderNav/>
    </section>
    </main>
    </>
  );
};

export default Profile;
