import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { db } from '../firebaseConfig';
import Link from 'next/link'
import '../src/app/styles/user.scss';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import axios from 'axios';
import HeaderNav from '../component/HeaderNav';
import Swal from 'sweetalert2';
import Headertop from '../component/Header';

const HomePage = () => {
  const router = useRouter();
  const { id } = router.query; // Get event name from URL
  const [phoneNumber, setPhoneNumber] = useState('');
  const [value, setValue] = React.useState(0);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [eventDetails, setEventDetails] = useState(null);
  const [registerUsersList, setregisterUsersList] = useState(null);
  const [cpPoints, setCPPoints] = useState(0);
  const [eventList, setEventList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false); // State to show/hide modal
  const [member, setMember] = useState([]); // Store fetched members
  const [monthlyMetCount, setMonthlyMetCount] = useState(0);
  const [ntMeetCount, setNtMeetCount] = useState(0);
  const [suggestionCount, setSuggestionCount] = useState(0);
  const [pendingSuggestionCount, setPendingSuggestionCount] = useState(0);
  const [upcomingMonthlyMeet, setUpcomingMonthlyMeet] = useState(null);
  const [upcomingNTMeet, setUpcomingNTMeet] = useState(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const now = new Date();

        // Fetch Monthly Meeting
        const monthlySnapshot = await getDocs(collection(db, "MonthlyMeeting"));
        const monthlyEvents = monthlySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().time?.toDate?.() || new Date(0)  // convert Firestore Timestamp to JS Date
        }));

        // Filter future events and get the earliest one
        const futureMonthlyEvents = monthlyEvents.filter(e => e.time > now);
        futureMonthlyEvents.sort((a, b) => a.time - b.time);
        setUpcomingMonthlyMeet(futureMonthlyEvents[0] || null);

        // Fetch NTmeet
        // Fetch Conclave meetings
        const conclaveSnapshot = await getDocs(collection(db, "Conclaves"));
        let allConclaveMeetings = [];

        for (const conclaveDoc of conclaveSnapshot.docs) {
          const meetingsRef = collection(db, "Conclaves", conclaveDoc.id, "meetings");
          const meetingsSnapshot = await getDocs(meetingsRef);

          meetingsSnapshot.forEach(meetingDoc => {
            const data = meetingDoc.data();
            allConclaveMeetings.push({
              id: meetingDoc.id,
              conclaveId: conclaveDoc.id,
              ...data,
              time: data.time?.toDate?.() || new Date(0)
            });
          });
        }

        const futureConclaveMeetings = allConclaveMeetings.filter(m => m.time > now);
        futureConclaveMeetings.sort((a, b) => a.time - b.time);
        setUpcomingNTMeet(futureConclaveMeetings[0] || null);



      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      }
    };

    fetchUpcomingEvents();
  }, []);
  function formatTimeLeft(ms) {
    if (ms <= 0) return "Meeting Ended";

    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  }
  useEffect(() => {
    const storedPhone = localStorage.getItem('mmOrbiter');
    if (storedPhone) {
      setPhoneNumber(storedPhone);
      setIsLoggedIn(true);
      fetchUserName(storedPhone);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchConclaveData = async () => {
      try {
        const now = new Date();
        const conclaveSnapshot = await getDocs(collection(db, "Conclaves"));
        const conclaves = conclaveSnapshot.docs.map(doc => doc.data()); // ✅ define conclaves

        let totalReferrals = 0;
        let completedReferrals = 0;

        for (const conclaveDoc of conclaveSnapshot.docs) {
          const meetingsRef = collection(db, "Conclaves", conclaveDoc.id, "meetings");
          const meetingsSnapshot = await getDocs(meetingsRef);

          for (const meetingDoc of meetingsSnapshot.docs) {
            const data = meetingDoc.data();

            if (Array.isArray(data.referralSection)) {
              totalReferrals += data.referralSection.length;

              // Count completed referrals
              completedReferrals += data.referralSection.filter(
                (ref) => ref.status?.toLowerCase() === "Completed"
              ).length;
            }
          }
        }

        // ✅ Set total conclaves
        setNtMeetCount(conclaves.length);

        // ✅ Set total monthly meetings
        const monthlyMetSnapshot = await getDocs(collection(db, "MonthlyMeeting"));
        setMonthlyMetCount(monthlyMetSnapshot.size);

        // ✅ Set referral counts
        setSuggestionCount(totalReferrals);
        setPendingSuggestionCount(completedReferrals); // You’re using this for completed count

      } catch (error) {
        console.error("Error fetching Conclaves:", error);
      }
    };

    fetchConclaveData();
  }, []);

// 📝 Function to log user login events in Firestore
const logUserLogin = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      console.warn("⚠️ No phone number provided for login log.");
      return;
    }

    const todayDateStr = new Date().toLocaleDateString("en-GB"); // dd/mm/yyyy
    const deviceInfo = navigator.userAgent;
    const loginTime = new Date();

    // 🧠 Fetch IP Address
    let ipAddress = "Unknown";
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      ipAddress = data.ip;
    } catch (err) {
      console.warn("Could not fetch IP:", err);
    }

    // 📝 Check if today's log already exists
    const logsRef = collection(db, "LoginLogs");
    const q = query(
      logsRef,
      where("phoneNumber", "==", phoneNumber),
      where("date", "==", todayDateStr)
    );
    const existingLogsSnap = await getDocs(q);

    if (existingLogsSnap.empty) {
      // ✅ No log for today → create new
      await setDoc(doc(logsRef), {
        phoneNumber,
        loginTime,
        deviceInfo,
        ipAddress,
        date: todayDateStr,
      });

      console.log(`✅ Login log saved for ${phoneNumber} on ${todayDateStr}`);
    } else {
      console.log(`ℹ️ Login log for ${phoneNumber} already exists for today`);
    }
  } catch (error) {
    console.error("❌ Error saving login log:", error);
  }
};
  const handleLogin = async (e) => {
    e.preventDefault();



    try {
      const docRef = doc(db, "userdetails", phoneNumber);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log('✅ Phone number found in NTMembers');

        localStorage.setItem('mmOrbiter', phoneNumber);
        setIsLoggedIn(true);
        fetchUserName(phoneNumber);
        setLoading(false);
          // 📝 Log the login event
  logUserLogin(phoneNumber);
      } else {
        setError('You are not a Orbiter.');
      }
    } catch (err) {
      console.error('❌ Error checking phone number:', err);
      setError('Login failed. Please try again.');
    }
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



  if (!isLoggedIn) {
    return (
      <div className='mainContainer signInBox'>
        {/* <div className='logosContainer'>
          <img src="/ujustlogo.png" alt="Logo" className="logo" />
        </div> */}
        <div className="signin">
          <div className="loginInput">
            <div className='logoContainer'>
              <img src="/logo.png" alt="Logo" className="logos" />

            </div>
            <p>UJustBe Unniverse</p>
            <form onSubmit={handleLogin}>
              <ul>
                <li>
                  <input
                    type="text"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </li>
                <li>
                  <button className="login" type="submit">Login</button>
                </li>
              </ul>
            </form>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      </div>
    );
  }



  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <>
      <main className="pageContainer">
        <Headertop/>
        <section className='dashBoardMain'>
          <div className='container pageHeading'>
            <h1>Hi {userName || 'User'}</h1>
            <p>Let's Create Brand Ambassador through Contribution</p>
          </div>


          <section className="project-summary">

            <Link href="/ConclaveMeeting">
              <div className="summary-card in-progress">
                <p className="count">{ntMeetCount}</p>
                <p className="label">Total Conclaves</p>
              </div>
            </Link>

            <Link href="/Monthlymeetdetails">
              <div className="summary-card in-review">
                <p className="count">{monthlyMetCount}</p>
                <p className="label">Monthly Meetings</p>
              </div>
            </Link>

            {/* <Link href="/ConclaveReferrals">
              <div className="summary-card on-hold">
                <p className="count">9</p>
                <p className="label">Total Referrals</p>
              </div>
            </Link>

            <Link href="/SuggestionList">
              <div className="summary-card completed">
                <p className="count">4</p>
                <p className="label">Completed Referrals</p>
              </div>
            </Link> */}

          </section>



     <section className="upcoming-events">
  <h1>Upcoming Events</h1>

  {upcomingMonthlyMeet ? (
    <div className="meetingBox">
      <div className="suggestionDetails">
        {(() => {
          const now = new Date();
          const eventDate = upcomingMonthlyMeet.time?.toDate ? upcomingMonthlyMeet.time.toDate() : upcomingMonthlyMeet.time;
          const timeLeftMs = eventDate - now;
          const timeLeft = timeLeftMs <= 0 ? 'Meeting Ended' : formatTimeLeft(timeLeftMs);
          return timeLeft === 'Meeting Ended' ? (
            <span className="meetingLable2">Meeting Done</span>
          ) : (
            <span className="meetingLable3">{timeLeft}</span>
          );
        })()}
        <span className="suggestionTime">
          {upcomingMonthlyMeet.time?.toDate
            ? upcomingMonthlyMeet.time.toDate().toLocaleString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }).replace(',', ' at')
            : upcomingMonthlyMeet.time.toLocaleString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }).replace(',', ' at')}
        </span>
      </div>

      <div className="meetingDetailsBox">
        <h3 className="eventName">{upcomingMonthlyMeet.Eventname || 'N/A'}</h3>
      </div>

      <div className="meetingBoxFooter">
        <div className="viewDetails">
          <Link href={`/MonthlyMeeting/${upcomingMonthlyMeet.id}`}>View Details</Link>
        </div>

        {(() => {
          const now = new Date();
          const eventDate = upcomingMonthlyMeet.time?.toDate ? upcomingMonthlyMeet.time.toDate() : upcomingMonthlyMeet.time;
          const isWithinOneHour = eventDate > now && (eventDate - now <= 60 * 60 * 1000);
          return isWithinOneHour && upcomingMonthlyMeet.zoomLink ? (
            <div className="meetingLink">
              <a href={upcomingMonthlyMeet.zoomLink} target="_blank" rel="noopener noreferrer">
                <span>Join Meeting</span>
              </a>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  ) : null}

  {upcomingNTMeet ? (
    <div className="meetingBox">
      <div className="suggestionDetails">
        {(() => {
          const now = new Date();
          const eventDate = upcomingNTMeet.time?.toDate ? upcomingNTMeet.time.toDate() : upcomingNTMeet.time;
          const timeLeftMs = eventDate - now;
          const timeLeft = timeLeftMs <= 0 ? 'Meeting Ended' : formatTimeLeft(timeLeftMs);
          return timeLeft === 'Meeting Ended' ? (
            <span className="meetingLable2">Meeting Done</span>
          ) : (
            <span className="meetingLable3">{timeLeft}</span>
          );
        })()}
        <span className="suggestionTime">
          {upcomingNTMeet.time?.toDate
            ? upcomingNTMeet.time.toDate().toLocaleString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }).replace(',', ' at')
            : upcomingNTMeet.time.toLocaleString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }).replace(',', ' at')}
        </span>
      </div>

      <div className="meetingDetailsBox">
        <h3 className="eventName">{upcomingNTMeet.name || 'N/A'}</h3>
      </div>

      <div className="meetingBoxFooter">
        <div className="viewDetails">
          <Link href={`/events/${upcomingNTMeet.id}`}>View Details</Link>
        </div>

        {(() => {
          const now = new Date();
          const eventDate = upcomingNTMeet.time?.toDate ? upcomingNTMeet.time.toDate() : upcomingNTMeet.time;
          const isWithinOneHour = eventDate > now && (eventDate - now <= 60 * 60 * 1000);
          return isWithinOneHour && upcomingNTMeet.zoomLink ? (
            <div className="meetingLink">
              <a href={upcomingNTMeet.zoomLink} target="_blank" rel="noopener noreferrer">
                <span>Join Meeting</span>
              </a>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  ) : null}

  {/* Show fallback if no meetings */}
  {!upcomingMonthlyMeet && !upcomingNTMeet && (
    <p className="noMeetings">No upcoming meetings</p>
  )}
</section>



          <div>
            {loading ? (
              <div className="loader">
                <span className="loader2"></span>
              </div>
            ) : <HeaderNav />}
          </div>
        </section>
      </main>

    </>
  );

};

export default HomePage;
