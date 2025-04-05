import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const RequestStatusPage = () => {
  const [loanRequests, setLoanRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (!window.ethereum) {
      alert("MetaMask is not installed.");
      return;
    }
    const p = new ethers.BrowserProvider(window.ethereum);
    setProvider(p);
    p.getSigner()
      .then((s) => {
        setSigner(s);
        const c = new ethers.Contract(CONTRACT_ADDRESS, contractABI, s);
        setContract(c);
      })
      .catch((error) => {
        console.error("Error getting signer:", error);
      });
  }, []);

  useEffect(() => {
    const fetchLoanRequests = async () => {
      if (!contract || !signer) return;

      try {
        const userAddress = (await signer.getAddress()).toLowerCase();
        const loanCount = await contract.nextLoanId();

        let loans = [];
        for (let i = 1; i < loanCount; i++) {
          const loan = await contract.loans(i);
          const status = getLoanStatus(loan.status);

          if (loan.borrower.toLowerCase() === userAddress && status !== "Completed") {
            loans.push({
              loanId: loan.loanId.toString(),
              amount: ethers.formatUnits(loan.amount, 18) + " ETH",
              interestRate: loan.interestRate.toString() + "%",
              repaymentPeriod: loan.repaymentPeriod.toString() + " months",
              status: status,
            });
          }
        }

        setLoanRequests(loans);
        setFilteredRequests(loans);
      } catch (error) {
        console.error("Error fetching loans:", error);
      }
    };

    fetchLoanRequests();
  }, [contract, signer]);

  const getLoanStatus = (status) => {
    const statuses = ["Pending", "Accepted", "Rejected", "Completed"];
    return statuses[status] || "Unknown";
  };

  const filterRequests = (status) => {
    setActiveFilter(status);
    if (status === "all") {
      setFilteredRequests(loanRequests);
    } else if (status === "accepted_rejected") {
      setFilteredRequests(loanRequests.filter((req) => req.status === "Accepted" || req.status === "Rejected"));
    } else {
      setFilteredRequests(loanRequests.filter((req) => req.status.toLowerCase() === status));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Your Loan Requests</h2>

      {/* Filter Buttons */}
      <div className="mb-4 flex gap-2">
        {["all", "pending", "accepted", "rejected", "accepted_rejected"].map((filter) => (
          <button
            key={filter}
            className={`p-2 rounded ${activeFilter === filter ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            onClick={() => filterRequests(filter)}
          >
            {filter === "accepted_rejected" ? "Accepted & Rejected" : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Loan Requests Table */}
      {filteredRequests.length === 0 ? (
        <p>No requests found for this filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">Loan ID</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Interest Rate</th>
                <th className="p-2 text-left">Repayment Period</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.loanId} className="border-b hover:bg-gray-50 cursor-pointer">
                  <td className="p-2">{req.loanId}</td>
                  <td className="p-2">{req.amount}</td>
                  <td className="p-2">{req.interestRate}</td>
                  <td className="p-2">{req.repaymentPeriod}</td>
                  <td className={`p-2 font-bold ${req.status === "Accepted" ? "text-green-600" : req.status === "Rejected" ? "text-red-600" : "text-gray-700"}`}>
                    {req.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestStatusPage;