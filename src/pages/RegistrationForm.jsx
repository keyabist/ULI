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
        const monthlyIncome = formData.monthlyIncome === "" ? "0" : formData.monthlyIncome.toString();

        tx = await contract.registerLender(
          formData.fullName,
          formData.phoneNumber.toString(),
          formData.email,
          formData.interestRate.toString(),
          monthlyIncome
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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a, #222)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'linear-gradient(135deg, #1a1f1f, #0a0a0a)',
        borderRadius: '12px',
        border: '2px solid #00ff80',
        boxShadow: '0 0 20px 5px rgba(0, 255, 128, 0.3)',
        padding: '30px',
        color: '#d4edda',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#00ff80',
          marginBottom: '30px',
          fontSize: '2rem',
          textShadow: '0 0 10px rgba(0,255,128,0.5)'
        }}>
          User Registration
        </h2>
        
        <form onSubmit={handleSubmit} style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px'
        }}>
          {/* Form Groups */}
          <div style={{ gridColumn: 'span 2' }}>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <select 
              name="userType" 
              value={formData.userType} 
              onChange={handleInputChange}
              style={{
                ...inputStyle,
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2300ff80\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 15px center'
              }}
            >
              <option value="borrower">Borrower</option>
              <option value="lender">Lender</option>
            </select>
          </div>

          {formData.userType === "lender" && (
            <div style={{ gridColumn: 'span 2' }}>
              <input
                type="number"
                name="interestRate"
                placeholder="Interest Rate (%)"
                value={formData.interestRate}
                onChange={handleInputChange}
                required
                style={inputStyle}
              />
            </div>
          )}

          <button 
            type="submit" 
            style={{
              gridColumn: 'span 2',
              padding: '15px',
              background: '#00cc66',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '20px',
              ':hover': {
                background: '#00994d',
                transform: 'scale(1.02)',
                boxShadow: '0 0 15px rgba(0,255,128,0.5)'
              }
            }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

// Reusable input styles
const inputStyle = {
  width: '100%',
  padding: '12px 15px',
  background: '#1a1f1f',
  border: '1px solid #00ff80',
  borderRadius: '8px',
  color: '#d4edda',
  fontSize: '16px',
  transition: 'all 0.3s ease',
};

export default RegistrationForm;
