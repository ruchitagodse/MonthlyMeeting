import React from "react";
import { db } from "../../firebaseConfig"; 
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";

export default function ExportButton() {
  const handleExport = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "userdetail"));

      if (querySnapshot.empty) {
        alert("No users found!");
        return;
      }

      const allUsers = [];
      querySnapshot.forEach((doc) => {
        allUsers.push({ MobileNo: doc.id, ...doc.data() });
      });

      // Create Excel
      const worksheet = XLSX.utils.json_to_sheet(allUsers);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      // Save directly
      XLSX.writeFile(workbook, "userdetails_export.xlsx");
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  return (
    <button
      onClick={handleExport}
    className="m-button-5"
    >
      Export
    </button>
  );
}
