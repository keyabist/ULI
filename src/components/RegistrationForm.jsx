import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    walletAddress: '',
    userType: 'borrower',
    interestRate: '',
    maxLoanAmount: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.walletAddress.trim()) newErrors.walletAddress = 'Wallet address is required';
    if (formData.userType === 'lender') {
      if (!formData.interestRate) newErrors.interestRate = 'Interest rate is required';
      if (!formData.maxLoanAmount) newErrors.maxLoanAmount = 'Maximum loan amount is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Handle form submission logic here
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>Create Account</h2>
          <p>Join our lending platform as a borrower or lender</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
            {errors.phone && <div className="form-error">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="walletAddress">Wallet Address</label>
            <input
              type="text"
              id="walletAddress"
              name="walletAddress"
              className="form-input"
              value={formData.walletAddress}
              onChange={handleChange}
              placeholder="Enter your wallet address"
            />
            {errors.walletAddress && <div className="form-error">{errors.walletAddress}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="userType">Account Type</label>
            <select
              id="userType"
              name="userType"
              className="form-select"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="borrower">Borrower</option>
              <option value="lender">Lender</option>
            </select>
          </div>

          {formData.userType === 'lender' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="interestRate">Interest Rate (%)</label>
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  className="form-input"
                  value={formData.interestRate}
                  onChange={handleChange}
                  placeholder="Enter interest rate"
                  min="0"
                  max="100"
                  step="0.1"
                />
                {errors.interestRate && <div className="form-error">{errors.interestRate}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="maxLoanAmount">Maximum Loan Amount (ETH)</label>
                <input
                  type="number"
                  id="maxLoanAmount"
                  name="maxLoanAmount"
                  className="form-input"
                  value={formData.maxLoanAmount}
                  onChange={handleChange}
                  placeholder="Enter maximum loan amount"
                  min="0"
                  step="0.01"
                />
                {errors.maxLoanAmount && <div className="form-error">{errors.maxLoanAmount}</div>}
              </div>
            </>
          )}

          <button type="submit" className="form-button">
            Create Account
          </button>
        </form>

        <div className="form-footer">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
