import React from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import { CategoryScale } from "chart.js";

export default function ExportAllUsers() {
  const handleExport = async () => {
    try {
      const snapshot = await getDocs(collection(db, "userdetail"));

      if (snapshot.empty) {
        alert("No users found!");
        return;
      }

      const MAX_SERVICES = 5;
      const MAX_PRODUCTS = 5;

      const allUsers = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();

        const userObj = {
          ID: docSnap.id,
          Name: data.Name || data[" Name"] || "—",
          Category: data.Category || "—",
          Email: data.Email || "—",
          MobileNo: data["Mobile no"] || data.Mobile || "—",
          MentorName: data.mentorName || "—",
          MentorPhone: data.mentorPhone || "—",
          UJBCode: data.ujbCode || "—",
          ReferralID: data.referralId || "—",
          ReferralType: data.referralType || "—",
          ReferralSource: data.referralSource || "—",
          ProfilePhotoURL: data["Profile Photo URL"] || "—",
          BusinessLogoURL: data["Business Logo"] || "—",
          Category1:data["Category 1"] || "—",
              Category2:data["Category 2"] || "—",
          BusinessDetails: data.business || "—",
          Skills: data.Skills ? data.Skills.join(", ") : "—",
          ContributionAreas: data["Contribution Area in UJustBe"] ? data["Contribution Area in UJustBe"].join(", ") : "—",
          Timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : data.timestamp || "—",
        };

        // Services grouped in one cell per service
        for (let i = 0; i < MAX_SERVICES; i++) {
          const s = data.services && data.services[i];
          userObj[`Service ${i + 1}`] = s
            ? `Name: ${s.name || '—'}\nDescription: ${s.description || '—'}`
            : "—";
        }

        // Products grouped in one cell per product
        for (let i = 0; i < MAX_PRODUCTS; i++) {
          const p = data.products && data.products[i];
          userObj[`Product ${i + 1}`] = p
            ? `Name: ${p.name || '—'}\nDescription: ${p.description || '—'}\nImage: ${p.imageURL || '—'}\n%: ${p.percentage || '—'}`
            : "—";
        }

        return userObj;
      });

      const worksheet = XLSX.utils.json_to_sheet(allUsers);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      XLSX.writeFile(workbook, "AllUsersExport.xlsx");
      alert("✅ All users exported successfully!");
    } catch (error) {
      console.error("Error exporting users:", error);
      alert("❌ Failed to export users. Check console for details.");
    }
  };

  return (
    <button onClick={handleExport} className="m-button-5">
      Export All Users
    </button>
  );
}
