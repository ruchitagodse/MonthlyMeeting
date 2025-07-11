import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

 import { useRouter } from 'next/router';
const ProspectSection = ({ eventID, data = {}, fetchData }) => {
  const [prospectSections, setProspectSections] = useState(data.prospectSections || []);
  const [userList, setUserList] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredUsersMap, setFilteredUsersMap] = useState({});

const router = useRouter();
const { conclaveId, id: meetingId } = router.query;
  const handleSearchChange = (index, value) => {
    setProspectSections(prev =>
      prev.map((section, i) =>
        i === index ? { ...section, prospectSearch: value } : section
      )
    );
  
    const filtered = userList.filter(user =>
      user.name?.toLowerCase().includes(value.toLowerCase())
    );
  
    setFilteredUsersMap(prev => ({
      ...prev,
      [index]: filtered
    }));
  };
  
  const handleSelectName = (index, name) => {
    setProspectSections(prev =>
      prev.map((section, i) =>
        i === index ? { ...section, prospect: name, prospectSearch: '' } : section
      )
    );
  
    setFilteredUsersMap(prev => ({
      ...prev,
      [index]: []
    }));
  };
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'userdetails'));
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data()[" Name"],
        }));
        setUserList(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);


  const handleFieldChange = (index, field, value) => {
    setProspectSections(prev =>
      prev.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    );
  };

  const handleAddSection = () => {
    setProspectSections(prev => [
      ...prev,
      {
        prospect: '',
        prospectSearch: '',
        prospectName: '',
        prospectDescription: '',
      }
    ]);
  };


const handleRemoveSection = async (index) => {
  const toRemove = prospectSections[index];
  if (toRemove.prospect || toRemove.prospectName || toRemove.prospectDescription) {
    try {
      if (!conclaveId || !meetingId) throw new Error("Missing IDs");
      const docRef = doc(db, 'Conclaves', conclaveId, 'meetings', meetingId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const updated = data.prospectSections?.filter((_, i) => i !== index) || [];
        await updateDoc(docRef, { prospectSections: updated });
        console.log('Prospect section removed from Firestore');
      }
    } catch (error) {
      console.error('Error removing prospect section:', error);
    }
  }
  setProspectSections(prev => prev.filter((_, i) => i !== index));
};

const handleSaveSections = async () => {
  try {
    if (!conclaveId || !meetingId) throw new Error("Missing IDs");
    const docRef = doc(db, 'Conclaves', conclaveId, 'meetings', meetingId);

    const cleanedProspectSections = prospectSections.map(
      ({ prospect, prospectDescription, prospectName }) => ({
        prospect,
        prospectDescription,
        prospectName,
      })
    );

    await updateDoc(docRef, { prospectSections: cleanedProspectSections });
    console.log('Prospect sections saved successfully');
    fetchData?.();
  } catch (error) {
    console.error('Error saving prospect sections:', error);
  }
};

  return (
    <div className="content-wrapper">
        <h3>Prospect Section</h3>
      <div className="form-row">
        <div className="repeater-content">
          {prospectSections.map((section, index) => (
            <div key={index} className="formBoxCon">
              <h4>Select Orbiter Name:<sup>*</sup></h4>
              <div className="autosuggest">
                <input
                  type="text"
                  placeholder="Search Orbiter"
                  value={section.prospectSearch || section.prospect}
                  onChange={(e) => handleSearchChange(index, e.target.value)}
                  onFocus={() => setFilteredUsers(userList)}
                />
             {filteredUsersMap[index]?.length > 0 && (
  <ul className="dropdown">
    {filteredUsersMap[index].map(user => (
      <li key={user.id} onClick={() => handleSelectName(index, user.name)}>
        {user.name}
      </li>
    ))}
  </ul>
)}

              </div>
              <div className='autosuggest'>
              <h4>Prospect Name:<sup>*</sup></h4>
              <input
                type="text"
                placeholder="Name"
                value={section.prospectName}
                onChange={(e) => handleFieldChange(index, 'prospectName', e.target.value)}
              />
</div>
              <h4>Detailed Info:<sup>*</sup></h4>
              <textarea
                placeholder="Description"
                value={section.prospectDescription}
                onChange={(e) => handleFieldChange(index, 'prospectDescription', e.target.value)}
              />

<button class="tooltip" onClick={() =>  handleRemoveSection(index)}>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" height="25" width="25">
    <path fill="#6361D9" d="M8.78842 5.03866C8.86656 4.96052 8.97254 4.91663 9.08305 4.91663H11.4164C11.5269 4.91663 11.6329 4.96052 11.711 5.03866C11.7892 5.11681 11.833 5.22279 11.833 5.33329V5.74939H8.66638V5.33329C8.66638 5.22279 8.71028 5.11681 8.78842 5.03866ZM7.16638 5.74939V5.33329C7.16638 4.82496 7.36832 4.33745 7.72776 3.978C8.08721 3.61856 8.57472 3.41663 9.08305 3.41663H11.4164C11.9247 3.41663 12.4122 3.61856 12.7717 3.978C13.1311 4.33745 13.333 4.82496 13.333 5.33329V5.74939H15.5C15.9142 5.74939 16.25 6.08518 16.25 6.49939C16.25 6.9136 15.9142 7.24939 15.5 7.24939H15.0105L14.2492 14.7095C14.2382 15.2023 14.0377 15.6726 13.6883 16.0219C13.3289 16.3814 12.8414 16.5833 12.333 16.5833H8.16638C7.65805 16.5833 7.17054 16.3814 6.81109 16.0219C6.46176 15.6726 6.2612 15.2023 6.25019 14.7095L5.48896 7.24939H5C4.58579 7.24939 4.25 6.9136 4.25 6.49939C4.25 6.08518 4.58579 5.74939 5 5.74939H6.16667H7.16638ZM7.91638 7.24996H12.583H13.5026L12.7536 14.5905C12.751 14.6158 12.7497 14.6412 12.7497 14.6666C12.7497 14.7771 12.7058 14.8831 12.6277 14.9613C12.5495 15.0394 12.4436 15.0833 12.333 15.0833H8.16638C8.05588 15.0833 7.94989 15.0394 7.87175 14.9613C7.79361 14.8831 7.74972 14.7771 7.74972 14.6666C7.74972 14.6412 7.74842 14.6158 7.74584 14.5905L6.99681 7.24996H7.91638Z" clip-rule="evenodd" fill-rule="evenodd"></path>
  </svg>
  <span class="tooltiptext">Remove</span>
</button>
            </div>
          ))}
        </div>
      </div>

      <button className="m-button-7" type="button" onClick={handleAddSection}>
        + Add Prospect
      </button>
      <ul>
        <li className="form-row">
          <div className="multipleitem">
      <button className="submitbtn" onClick={handleSaveSections}>
        Save
        </button>
        </div>
        </li>
        </ul>
    </div>
  );
};

export default ProspectSection;
