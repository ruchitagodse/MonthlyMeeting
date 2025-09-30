import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiHome } from "react-icons/fi";
import { MdOutlineBusinessCenter, MdBusinessCenter } from "react-icons/md";
import { BiSolidCoinStack } from "react-icons/bi";
import { GrGroup } from "react-icons/gr";
import { HiUser } from "react-icons/hi2";
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

function HeaderNav() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [cpPoints, setCPPoints] = useState(0);

  useEffect(() => {
    const storedPhoneNumber = localStorage.getItem("mmOrbiter");
    if (storedPhoneNumber) {
      setPhoneNumber(storedPhoneNumber);
      fetchUserName(storedPhoneNumber);
    }
  }, []);

  useEffect(() => {
    if (!phoneNumber) return;

    const fetchCP = async () => {
      try {
        const activitiesRef = collection(db, "Orbiters", phoneNumber, "activities");
        const activitiesSnapshot = await getDocs(activitiesRef);

        let totalCP = 0;
        activitiesSnapshot.forEach((doc) => {
          const points = Number(doc.data().points);
          if (!isNaN(points)) totalCP += points;
        });

        setCPPoints(totalCP);
      } catch (error) {
        console.error("Error fetching CP points:", error);
      }
    };

    fetchCP();
  }, [phoneNumber]);

  const fetchUserName = async (phoneNumber) => {
    try {
      const userRef = doc(db, 'Orbiters', phoneNumber);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setUserName(userDoc.data().name);
        setPhoneNumber(userDoc.data().phoneNumber);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const navItems = [
    { label: "Home", icon: <FiHome size={26} />, path: "/" },
    { label: "MM", icon: <MdOutlineBusinessCenter size={26} />, path: "/Monthlymeetdetails" },
    { label: "Conclave", icon: <GrGroup size={26} />, path: "/ConclaveMeeting" },
    { label: "CP", icon: <BiSolidCoinStack size={26} />, path: `/cp-details/${phoneNumber}` },
    { label: "Business", icon: <MdBusinessCenter size={26} />, path: "/ReferralDetails" },
    { label: "My Profile", icon: <HiUser size={26} />, path: "/ProfilePage" },
  ];

  return (
    <div className="sticky-buttons-container">
      {navItems.map((item) => {
        let isActive = false;

        // For dynamic CP route
        if (item.label === "CP" && router.asPath.startsWith("/cp-details/")) {
          isActive = true;
        } else if (router.pathname === item.path) {
          isActive = true;
        }

        return (
          <div
            key={item.label}
            className={`icon-wrapper ${isActive ? "active" : ""}`}
            onClick={() => router.push(item.path)}
          >
            {item.icon}
            <span className="icon-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default HeaderNav;
