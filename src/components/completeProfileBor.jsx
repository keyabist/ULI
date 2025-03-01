import React, { useState } from 'react';

const CompleteProfile = () => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    monthlyIncome: '',
    creditScore: '',
    // File inputs are stored as File objects
    proofOfIncome: null,
    governmentId: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    setProfileData(prev => ({
      ...prev,
      [name]: file,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process the profile details (e.g., send data to your backend)
    console.log("Profile Submitted:", profileData);
  };

  return (
    <div className="complete-profile-container">
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={profileData.fullName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="tel"
            name="phoneNumber"
            value={profileData.phoneNumber}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={profileData.address}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Monthly Income:</label>
          <input
            type="number"
            name="monthlyIncome"
            value={profileData.monthlyIncome}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Credit Score:</label>
          <input
            type="number"
            name="creditScore"
            value={profileData.creditScore}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Proof of Income:</label>
          <input
            type="file"
            name="proofOfIncome"
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            required
          />
        </div>
        <div className="form-group">
          <label>Government ID:</label>
          <input
            type="file"
            name="governmentId"
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            required
          />
        </div>
        <button type="submit">Submit Profile</button>
      </form>
    </div>
  );
};

export default CompleteProfile;
