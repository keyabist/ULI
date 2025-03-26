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
      if (contract && signer) {
        try {
          const userAddress = (await signer.getAddress()).toLowerCase();
          // Replace with your method to fetch borrower requests:
          // const requests = await contract.getRequestsByBorrower(userAddress);
          const requests = [
            { loanId: 1, amount: "1 ETH", status: "Pending" },
            { loanId: 2, amount: "2 ETH", status: "Approved" },
            { loanId: 3, amount: "0.5 ETH", status: "Rejected" },
          ];
          setLoanRequests(requests);
          setFilteredRequests(requests);
        } catch (error) {
          console.error("Error fetching loan requests:", error);
        }
      }
    };

    fetchLoanRequests();
  }, [contract, signer]);

  const filterRequests = (status) => {
    setActiveFilter(status);
    if (status === "all") {
      setFilteredRequests(loanRequests);
    } else {
      const filtered = loanRequests.filter((req) => {
        // Adjust status names as needed (e.g., "Approved" might correspond to accepted)
        if (status === "accepted") return req.status === "Approved";
        return req.status.toLowerCase() === status;
      });
      setFilteredRequests(filtered);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Your Loan Requests</h2>
      <div className="mb-4">
        <button
          className={`p-2 ${activeFilter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => filterRequests("all")}
        >
          All
        </button>
        <button
          className={`p-2 ml-2 ${activeFilter === "pending" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => filterRequests("pending")}
        >
          Pending
        </button>
        <button
          className={`p-2 ml-2 ${activeFilter === "accepted" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => filterRequests("accepted")}
        >
          Accepted
        </button>
        <button
          className={`p-2 ml-2 ${activeFilter === "rejected" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => filterRequests("rejected")}
        >
          Rejected
        </button>
      </div>
      {filteredRequests.length === 0 ? (
        <p>No requests found for this filter.</p>
      ) : (
        <ul>
          {filteredRequests.map((req) => (
            <li key={req.loanId}>
              <strong>Loan ID:</strong> {req.loanId} – <strong>Amount:</strong> {req.amount} – <strong>Status:</strong> {req.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RequestStatusPage;
