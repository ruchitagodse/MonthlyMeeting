import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import axios from "axios";
import "../pages/events/frontend.css"; // Make sure to import your SCSS file
import Layout from '../component/Layout'
import "../src/app/styles/main.scss";

const BirthdayPage = () => {
  const [users, setUsers] = useState([]);

  const getFormattedDate = (offset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  const today = getFormattedDate(0);
  const tomorrow = getFormattedDate(1);

  const fetchBirthdayUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "birthdaycanva"));
    const birthdayUsers = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const dobRaw = data.dob; // Ensure 'dob' is correct

      if (dobRaw) {
        const dobDate = new Date(dobRaw); // Convert the raw dob value to Date
        const formattedDOB = `${String(dobDate.getDate()).padStart(2, "0")}/${String(dobDate.getMonth() + 1).padStart(2, "0")}`;

        console.log(`🔍 Checking: ${data.Name} | DOB: ${formattedDOB}`);

        if (formattedDOB === today || formattedDOB === tomorrow) {
          birthdayUsers.push({ id: doc.id, ...data });
        }
      } else {
        console.log(`❌ No DOB found for user: ${data.Name}`);
      }
    });

    console.log("🎉 Final birthday list:", birthdayUsers);
    setUsers(birthdayUsers);
  };

  const sendWhatsAppMessage = async (user) => {
    const templateName = "daily_reminder";
    let phoneNumber = user["phone"]; // Change `const` to `let`
    const name = user["name"];
    const imageUrl = user.imageUrl;
   const accessToken = "EAAHwbR1fvgsBOwUInBvR1SGmVLSZCpDZAkn9aZCDJYaT0h5cwyiLyIq7BnKmXAgNs0ZCC8C33UzhGWTlwhUarfbcVoBdkc1bhuxZBXvroCHiXNwZCZBVxXlZBdinVoVnTB7IC1OYS4lhNEQprXm5l0XZAICVYISvkfwTEju6kV4Aqzt4lPpN8D3FD7eIWXDhnA4SG6QZDZD"; // Replace with your Meta API token
    const phoneNumberId = "527476310441806";  

    // Log the entire user object to inspect its structure
    console.log("User Object:", user);

    // Check if the phone number is valid and properly formatted
    if (!phoneNumber || phoneNumber.trim() === "") {
      alert("Phone number is missing or invalid.");
      return;
    }

    // Ensure phone number is in international format without the "+" sign
    phoneNumber = phoneNumber.replace(/^\+/, ""); // Remove "+" if exists

    // Check if phone number is numeric and has a valid length (assuming 10 digits minimum for most countries)
    if (!/^\d{10,15}$/.test(phoneNumber)) {
      alert("Phone number is not in a valid format.");
      return;
    }

    // Ensure name is defined
    if (!name || name.trim() === "") {
      alert("Name is missing.");
      return;
    }

    try {
      await axios.post(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to: phoneNumber,  // Correctly formatted phone number
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "image",
                    image: { link: imageUrl },
                  },
                ],
              },
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: `Happy Birthday, ${name}!`, // Added default text for the body
                  },
                ],
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert(`WhatsApp message sent to ${name}`);
    } catch (error) {
      console.error("Error sending message", error.response?.data || error);
      alert(`Failed to send message to ${name}`);
    }
  };

  useEffect(() => {
    fetchBirthdayUsers();
  }, []);

  // Separate birthdays into today, tomorrow, and upcoming
  const todayBirthdays = users.filter(user => {
    const dobDate = new Date(user.dob);
    const formattedDOB = `${String(dobDate.getDate()).padStart(2, "0")}/${String(dobDate.getMonth() + 1).padStart(2, "0")}`;
    return formattedDOB === today;
  });

  const tomorrowBirthdays = users.filter(user => {
    const dobDate = new Date(user.dob);
    const formattedDOB = `${String(dobDate.getDate()).padStart(2, "0")}/${String(dobDate.getMonth() + 1).padStart(2, "0")}`;
    return formattedDOB === tomorrow;
  });

  const upcomingBirthdays = users.filter(user => {
    const dobDate = new Date(user.dob);
    const formattedDOB = `${String(dobDate.getDate()).padStart(2, "0")}/${String(dobDate.getMonth() + 1).padStart(2, "0")}`;
    return formattedDOB !== today && formattedDOB !== tomorrow;
  });

  return (
    <Layout>
    <div className="birthday-page">
      <h2>🎉 Today's and Tomorrow's Birthdays</h2>

      <div className="birthday-section today">
        <h3>🎂 Today's Birthdays</h3>
        {todayBirthdays.length === 0 ? (
          <p>No birthdays today.</p>
        ) : (
          todayBirthdays.map((user) => (
            <div key={user.id} className="birthday-card">
              <h3>{user.name}</h3>
              <p>🎂 DOB: {user.dob}</p>
              <p>📱 Mobile: {user["phone"]}</p>
              {user.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt={user.Name}
                  className="birthday-image"
                />
              )}
              <button
                onClick={() => sendWhatsAppMessage(user)}
                className="send-message-btn"
              >
                Send WhatsApp Message
              </button>
            </div>
          ))
        )}
      </div>

      <div className="birthday-section tomorrow">
        <h3>🎂 Tomorrow's Birthdays</h3>
        {tomorrowBirthdays.length === 0 ? (
          <p>No birthdays tomorrow.</p>
        ) : (
          tomorrowBirthdays.map((user) => (
            <div key={user.id} className="birthday-card">
              <h3>{user.name}</h3>
              <p>🎂 DOB: {user.dob}</p>
              <p>📱 Mobile: {user["phone"]}</p>
              {user.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt={user.Name}
                  className="birthday-image"
                />
              )}
              <button
                onClick={() => sendWhatsAppMessage(user)}
                className="send-message-btn"
              >
                Send WhatsApp Message
              </button>
            </div>
          ))
        )}
      </div>

      <div className="birthday-section upcoming">
        <h3>🎂 Upcoming Birthdays</h3>
        {upcomingBirthdays.length === 0 ? (
          <p>No upcoming birthdays.</p>
        ) : (
          upcomingBirthdays.map((user) => (
            <div key={user.id} className="birthday-card">
              <h3>{user.Name}</h3>
              <p>🎂 DOB: {user.dob}</p>
              <p>📱 Mobile: {user["Mobile no"]}</p>
              {user.imageUrl && (
                <img
                  src={user.imageUrl}
                  alt={user.Name}
                  className="birthday-image"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </Layout>
  );
};

export default BirthdayPage;
