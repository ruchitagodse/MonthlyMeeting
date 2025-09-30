import React, { useState } from "react";
import * as XLSX from "xlsx";
import { db } from "../firebaseConfig";
import { collection, doc, updateDoc } from "firebase/firestore"; // Import updateDoc

const UploadExcel = () => {
  const [excelData, setExcelData] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(jsonData); 
      console.log(jsonData);
    };

    reader.readAsArrayBuffer(file);
  };

  const uploadDataToFirestore = async () => {
    if (excelData) {
      try {
        const collectionRef = collection(db, "userdetail");

        for (let row of excelData) {
          const mobileNumber = String(row["Mobile no"]); // Column from Excel
          if (mobileNumber) {
            const docRef = doc(collectionRef, mobileNumber);

            // Fields you want to update
            const updateFields = {
              Location: row["Location"] || "",
              State: row["State"] || "",
              Hobbies: row["Hobbies"] || "",
              "Business Name": row["Business Name"] || "",
              Locality: row["Locality"] || "",
              "Business History": row["Business History"] || "",
              "Business Details (Nature & Type)": row["Business Details (Nature & Type)"] || "",
              "Category 1": row["Category 1"] || "",
              "Category 2": row["Category 2"] || "",
              "Business Email ID": row["Business Email ID"] || ""
            };

            await updateDoc(docRef, updateFields);
          } else {
            console.error("Mobile number missing in row:", row);
          }
        }

        alert("Data updated successfully in Firestore!");
      } catch (error) {
        console.error("Error updating data:", error);
      }
    } else {
      alert("Please upload a file first.");
    }
  };

  return (
    <>
      <section className="c-form box">
        <h2>Upload Excel</h2>
        <button className="m-button-5" onClick={() => window.history.back()}>
          Back
        </button>
        <ul>
          <div className="upload-container">
            <input
              type="file"
              id="fileUpload"
              className="file-input"
              onChange={handleFileUpload}
              accept=".xlsx, .xls"
            />
          </div>

          <li className="form-row">
            <div>
              <button
                className="m-button-7"
                onClick={uploadDataToFirestore}
                style={{ backgroundColor: "#f16f06", color: "white" }}
              >
                Update Data
              </button>
            </div>
          </li>
        </ul>
      </section>
    </>
  );
};

export default UploadExcel;
