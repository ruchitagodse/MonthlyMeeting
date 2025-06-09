import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Adjust if needed
import '../../src/app/styles/user.scss';
import HeaderNav from "../../component/HeaderNav";
import Swal from 'sweetalert2';
const CPDetails = () => {
  const router = useRouter();
  const { phoneNumber } = router.query; // Get phone number from URL

  const [userName, setUserName] = useState("");
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
  if (!phoneNumber) return;

  const fetchUserDetails = async () => {
    try {
      const userRef = doc(db, "userdetails", phoneNumber);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserName(userSnap.data()[" Name"] || "User");
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchCPDetails = async () => {
    try {
      const activitiesRef = collection(db, "Orbiters", phoneNumber, "activities");
      const activitiesSnapshot = await getDocs(activitiesRef);

      let totalPoints = 0;
      const activitiesList = activitiesSnapshot.docs.map((doc) => {
        const data = doc.data();
        const points = parseInt(data.points) || 0;
        totalPoints += points;
        return {
          id: doc.id,
          ...data,
        };
      });

      setActivities(activitiesList);
      setFilteredActivities(activitiesList);
      setTotalPoints(totalPoints);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  // ✅ Call both async functions
  fetchUserDetails();
  fetchCPDetails();
}, [phoneNumber]);


  const activityTypes = ["All", ...new Set(activities.map(activity => activity.activityType))];

  const handleFilterClick = (type) => {
    setActiveFilter(type);
    if (type === "All") {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(activity => activity.activityType === type));
    }
  };

  if (loading) {
    return  <div className='loader'><span className="loader2"></span></div>;
  }
  const handleLogout = () => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You will be logged out.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Logout',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('ntnumber');
      window.location.reload(); // or navigate to login
    }
  });
};
 const getInitials = (name) => {
    return name
      .split(" ") // Split the name into words
      .map(word => word[0]) // Get the first letter of each word
      .join(""); // Join them together
  };
  
  
  return (
    <>
      <main className="pageContainer">
        <header className="Main m-Header">
          <section className="container">
            <div className="innerLogo" onClick={() => router.push("/")}>
              <img src="/ujustlogo.png" alt="Logo" className="logo" />
            </div>
             <div>
         <div className="userName" onClick={handleLogout} style={{ cursor: 'pointer' }}>
  <span>{getInitials(userName)}</span>
</div>
          </div>
          </section>
        </header>

        <section className="dashBoardMain">
          <div className="container pageHeading">
           
  <h1>{userName}'s CP List</h1>
  <h2 style={{ fontWeight: 500, marginTop: '10px' }}>Total CP Points: {totalPoints}</h2>
</div>


          <div className="container filterTab">
            <h4>Filter by Activity Type</h4>
            <ul>
              {activityTypes.map((type, index) => (
                <li
                  key={index}
                  className={`navItem ${activeFilter === type ? "active" : ""}`}
                  onClick={() => handleFilterClick(type)}
                >
                  {type}
                </li>
              ))}
            </ul>
          </div>

          {filteredActivities.length === 0 ? (
            <p>No activities found.</p>
          ) : (
            <div className="container suggestionList">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="suggestionBox">
                  <div className="suggestionDetails">
                    <span className="meetingLable2">CP Points: {activity.points}</span>
                    <span className="suggestionTime">{activity.month}</span>
                  </div>
                  <div className="suggestions">
                    <h4>{activity.activityType}</h4>
                    <p>{activity.activityDescription}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

    <HeaderNav/>
        </section>
      </main>
    </>
  );
};

export default CPDetails;
