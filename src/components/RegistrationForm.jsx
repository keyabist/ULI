import { useState } from "react";
import { ethers } from "ethers";
import "./RegistrationForm.css";
import { useNavigate } from "react-router-dom";
import { contractConfig } from "../contractConfig"; // Import contract config

const contractAddress = contractConfig.contractAddress;
const contractABI = contractConfig.abi; // Ensure ABI is correctly imported

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    userType: "borrower",
    interestRate: "", // Only for lenders
    monthlyIncome: "", // Only for lenders
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      if (!window.ethereum) {
        alert("MetaMask is required to register.");
        return;
      }
  
      // Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      // Initialize contract correctly
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
      let tx;
      if (formData.userType === "borrower") {
        tx = await contract.registerBorrower(
          formData.fullName,
          formData.phoneNumber.toString(),
          formData.email,
        );
      } else {
        tx = await contract.registerLender(
          formData.fullName,
          formData.phoneNumber.toString(),
          formData.email,
          formData.interestRate.toString(),
          formData.monthlyIncome.toString()
        );
      }
  
      await tx.wait();
      alert("Registration successful!");
  
      navigate(formData.userType === "lender" ? "/lenderDashboard" : "/borrowerDashboard");
    } catch (error) {
      console.error("Error in registration:", error);
      alert("Registration failed!");
    }
  };
  

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Registration Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="fullName"
              placeholder="User Name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <select name="userType" value={formData.userType} onChange={handleInputChange} required>
              <option value="borrower">Borrower</option>
              <option value="lender">Lender</option>
            </select>
          </div>
          {formData.userType === "lender" && (
            <>
              <div className="form-group">
                <input
                  type="number"
                  name="interestRate"
                  placeholder="Interest Rate"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="monthlyIncome"
                  placeholder="Monthly Income"
                  value={formData.monthlyIncome}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}
          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
