import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getFirestore, doc, getDoc, getDocs, collection } from "firebase/firestore";
import { app } from "../firebaseConfig";
import Swal from 'sweetalert2';

const db = getFirestore(app);

const Headertop = () => {
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cpPoints, setCPPoints] = useState(0);

  const router = useRouter();

  const getInitials = (name) =>
    name ? name.split(" ").map((word) => word[0]).join("") : "";
  // 🔎 Fetch user when phone number is in localStorage
  useEffect(() => {
    const storedPhoneNumber = localStorage.getItem("mmOrbiter");
    if (storedPhoneNumber) {
      fetchUserName(storedPhoneNumber);
      setPhoneNumber(storedPhoneNumber);
      fetchCPPoints(storedPhoneNumber);
    } else {
      console.error("Phone number not found in localStorage.");
    }
  }, []);

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
          localStorage.removeItem('mmOrbiter');
          window.location.href = "/"; // redirect to home
        }
      });
    };

  const fetchUserName = async (phoneNumber) => {
    if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
      console.error("Invalid phone number:", phoneNumber);
      return;
    }

    try {
      const userRef = doc(db, "userdetails", phoneNumber);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const orbitername = userDoc.data()[" Name"] || "User";
        console.log("Header",orbitername),
        
        setUserName(orbitername);
      } else {
        console.log("User not found in userdetails");
      }
    } catch (err) {
      console.error("Error fetching user name:", err);
    }
  };

const fetchCPPoints = async (phone) => {
    const snap = await getDocs(collection(db, 'Orbiters', phone, 'activities'));
    let total = 0;
    snap.forEach(doc => total += Number(doc.data()?.points) || 0);
    setCPPoints(total);
  };


  return (
    <header className="Main m-Header">
      <section className="container">
        <div className="innerLogo" onClick={() => router.push("/")}>
          <img src="/ujustlogo.png" alt="Logo" className="logo" />
        </div>

        <div className="headerRight">
          <button
            onClick={() => router.push(`/cp-details/${phoneNumber}`)}
            className="reward-btn"
          >
            <div className="text">CP: {cpPoints}</div>
          </button>
          <div className="userName" onClick={handleLogout}>
            <span>{getInitials(userName)}</span>
          </div>
        </div>
      </section>
    </header>
  );
};

export default Headertop;
