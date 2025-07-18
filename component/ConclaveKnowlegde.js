import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useRouter } from 'next/router';
const KnowledgeSharingSection = ({ eventID, data = {}, fetchData }) => {
    const router = useRouter();
    const { id } = router.query;
  const [knowledgeSections, setKnowledgeSections] = useState(data.knowledgeSections || []);
  const [userList, setUserList] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredUsersMap, setFilteredUsersMap] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'userdetails'));
     const users = snapshot.docs.map(doc => ({
  id: doc.id,
  name: doc.data()[" Name"] || '',
}));

        setUserList(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);
  const handleSearchChange = (index, value) => {
    setKnowledgeSections(prev =>
      prev.map((section, i) =>
        i === index ? { ...section, search: value } : section
      )
    );
  
  const filtered = userList.filter(user =>
  (user.name || '').toLowerCase().includes(value.toLowerCase())
);

  
    setFilteredUsersMap(prev => ({
      ...prev,
      [index]: filtered,
    }));
  };
  
  const handleSelectName = (index, name) => {
    setKnowledgeSections(prev =>
      prev.map((section, i) =>
        i === index ? { ...section, name, search: '' } : section
      )
    );
  
    setFilteredUsersMap(prev => ({
      ...prev,
      [index]: []
    }));
  };
  

  const handleFieldChange = (index, field, value) => {
    setKnowledgeSections(prev =>
      prev.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    );
  };

  const handleAddSection = () => {
    setKnowledgeSections(prev => [
      ...prev,
      {
        name: '',
        search: '',
        topic: '',
        description: ''
      }
    ]);
  };

 const handleSaveSections = async () => {
  const meetingId = eventID; // LeoSV3RGDbfku64P7AJT
  const conclaveId = router.query.conclaveId; // I8Xlp4AFeSvRBUeVLil2

  if (!meetingId || !conclaveId) {
    console.error('Missing meetingId or conclaveId');
    return;
  }

  try {
    const docRef = doc(db, 'Conclaves', conclaveId, 'meetings', meetingId);

    const cleanedKnowledgeSections = knowledgeSections.map(
      ({ description, name, topic }) => ({
        description,
        name,
        topic,
      })
    );

    await updateDoc(docRef, { knowledgeSections: cleanedKnowledgeSections });
    console.log('Knowledge sections saved successfully');
    fetchData?.();
  } catch (error) {
    console.error('Error saving knowledge sections:', error);
  }
};
const handleRemoveSection = async (index) => {
  const meetingId = eventID;
  const conclaveId = router.query.conclaveId;

  const toRemove = knowledgeSections[index];
  if (!toRemove) return;

  try {
    const docRef = doc(db, 'Conclaves', conclaveId, 'meetings', meetingId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      const updated = data.knowledgeSections?.filter((_, i) => i !== index) || [];
      await updateDoc(docRef, { knowledgeSections: updated });
      console.log('Knowledge section removed from Firestore');
    }
  } catch (error) {
    console.error('Error removing knowledge section:', error);
  }

  setKnowledgeSections(prev => prev.filter((_, i) => i !== index));
};

  

  return (
    <div className="content-wrapper">
      <h3>Knowledge Sharing Section</h3>
      <div className="form-row">
        <div className="repeater-content">
          {knowledgeSections.map((section, index) => (
            <div key={index} className="formBoxCon">
              <h4>Select Orbiter's Name:<sup>*</sup></h4>
              <div className="autosuggest">
                <input
                  type="text"
                  placeholder="Search Orbiter"
                  value={section.search || section.name}
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

              <h4>Topic Name:<sup>*</sup></h4>
              <div className="multipleitem">
              <input
              type='text'
                placeholder="Topic Name"
                value={section.topic}
                onChange={(e) => handleFieldChange(index, 'topic', e.target.value)}
              />
</div>
              <h4>Description:<sup>*</sup></h4>
              <textarea
                placeholder="Description"
                value={section.description}
                onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
              />

              
             
<button class="tooltip" onClick={() => handleRemoveSection(index)}>
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
        + Add Knowledge Sharing
      </button>
      <ul>
        <li className="form-row">
          <div className="multipleitem">
      <button className="submitbtn" onClick={handleSaveSections}>
        Save
      </button>
      </div>
      </li></ul>
    </div>
  );
};

export default KnowledgeSharingSection;
