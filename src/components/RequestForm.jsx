import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoanRequestForm = () => {
  const [formData, setFormData] = useState({
    amountNeeded: '',
    repaymentPeriod: '',
    repaymentSchedule: ''
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process the loan request here (e.g., send data to your backend)
    console.log("Loan Request Submitted:", formData);
    navigate("/borrowerDashboard");
  };

  return (
    <div className="loan-request-container">
      <h2>Loan Request Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Amount Needed:</label>
          <input
            type="number"
            name="amountNeeded"
            value={formData.amountNeeded}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Repayment Period (in months):</label>
          <input
            type="number"
            name="repaymentPeriod"
            value={formData.repaymentPeriod}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Repayment Schedule:</label>
          <select
            name="repaymentSchedule"
            value={formData.repaymentSchedule}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Schedule</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <button type="submit">Submit Loan Request</button>
      </form>
    </div>
  );
};

export default LoanRequestForm;
