import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs,doc,getDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig'; 
import '../src/app/styles/user.scss';
//import '/pages/events/event.scss'; // Ensure your CSS file is correctly linked
import { useRouter } from 'next/router';
import Link from 'next/link'
import HeaderNav from '../component/HeaderNav';
const db = getFirestore(app);

const AllEvents = () => {
  const [events, setEvents] = useState([]);
   const [userName, setUserName] = useState('');
     const [phoneNumber, setPhoneNumber] = useState('');
   const router = useRouter();
  


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
    <>
    <main className="pageContainer">
      <header className='Main m-Header'>
        <section className='container'>
          <div className='innerLogo' onClick={() => router.push('/')}>
            <img src="/ujustlogo.png" alt="Logo" className="logo" />
          </div>
          <div>
            <div className='userName'> {userName || 'User'} <span>{getInitials(userName)}</span> </div>
          </div>
        </section>
      </header>
      <section className='dashBoardMain'>
     <div className='sectionHeadings'>
          <h2>Monthly Meetings</h2> 
         </div>
      <div className='container eventList'>
  {events.map((event, index) => {
    const eventDate = event.time?.toDate?.();
    const now = new Date();

    // Calculate time left
let timeLeft = '';
let isWithinOneHour = false; // <-- new flag

if (eventDate) {
  const diffMs = eventDate - now;

  if (diffMs > 0) {
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
    timeLeft = `${diffDays}d ${diffHours}h ${diffMinutes}m left`;

    // Check if within 1 hour
    isWithinOneHour = diffMs <= 60 * 60 * 1000;
  } else {
    timeLeft = 'Meeting Ended';
  }
} else {
  timeLeft = 'N/A';
}

    const isUpcoming = eventDate && eventDate > now;

    return (
 <Link href={`/events/${event.id}`} key={index} className="meetingBoxLink">
  <div className='meetingBox'>
    <div className="suggestionDetails">
      {timeLeft === 'Meeting Ended' ? (
        <span className="meetingLable2">Meeting Done</span>
      ) : (
        <span className="meetingLable3">{timeLeft}</span>
      )}
      <span className="suggestionTime">
        {eventDate?.toLocaleString?.() || 'N/A'}
      </span>
    </div>

    <div className='meetingDetails'>
      <h3 className="eventName">{event.Eventname || 'N/A'}</h3>
    </div>

    <div className='meetingBoxFooter'>
      <div className='viewDetails'>
        <Link href={`/events/${event.id}`}>View Details</Link>
      </div>

      {timeLeft === 'Meeting Ended' ? (
        event.isUserRegistered ? (
          <button className="registered-btn" onClick={(e) => e.stopPropagation()}>
            ✅ Registered
          </button>
        ) : null
      ) : (
        <>
          {isWithinOneHour ? (
            <div className="meetingLink" onClick={(e) => e.stopPropagation()}>
              <a href={event.zoomLink} target="_blank" rel="noopener noreferrer">
                <span>Join Meeting</span>
              </a>
            </div>
          ) : event.isUserRegistered ? (
            <button className="registered-btn" onClick={(e) => e.stopPropagation()}>
              ✅ Registered
            </button>
          ) : (
            <button className="register-now-btn" onClick={(e) => e.stopPropagation()}>
              Register Now
            </button>
          )}
        </>
      )}
    </div>
  </div>
</Link>


    );
  })}
</div>

    <HeaderNav/>
    </section>
    </main>
    </>
  );
};

export default AllEvents;
