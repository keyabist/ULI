import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";

const TransactionPage = () => {
    const { state } = useLocation();
    const loanId = state?.loanId;
    const [transactions, setTransactions] = useState([]);
    const [paymentAmount, setPaymentAmount] = useState("");
    const CONTRACT_ADDRESS = "0x4d20B7131ac08bba92b885188d0980d2C2dea68f";

    // Function to fetch the transaction history for the loan
    const fetchTransactions = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
            const txs = await contract.getTransactions(loanId);
            const formattedTxs = txs.map(tx => ({
                loanId: tx.loanId.toNumber(),
                from: tx.from,
                to: tx.to,
                amount: ethers.formatEther(tx.amount),
                timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleString()
            }));
            setTransactions(formattedTxs);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        }
    };

    useEffect(() => {
        if (loanId) {
            fetchTransactions();
        }
    }, [loanId]);

    // Function to handle making a new payment
    const handlePayment = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

            // Calling recordPayment with the entered payment amount (in ETH)
            const transaction = await contract.recordPayment(
                loanId,
                ethers.parseEther(paymentAmount)
            );
            await transaction.wait();
            alert("Payment Successful!");
            setPaymentAmount("");
            fetchTransactions(); // Refresh the transaction list after payment
        } catch (error) {
            console.error("Payment Error:", error);
            alert("Payment Failed!");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Loan Transactions</h2>

            {/* Payment Section */}
            <div className="mb-4">
                <input
                    type="number"
                    placeholder="Enter Payment Amount (ETH)"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="border p-2 rounded mr-2"
                />
                <button
                    onClick={handlePayment}
                    className="bg-blue-500 text-white p-2 rounded"
                >
                    Pay Now
                </button>
            </div>

            {/* Transaction History Section */}
            {transactions.length === 0 ? (
                <p>No transactions found for this loan.</p>
            ) : (
                <table className="w-full border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">From</th>
                            <th className="border p-2">To</th>
                            <th className="border p-2">Amount (ETH)</th>
                            <th className="border p-2">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, index) => (
                            <tr key={index} className="border">
                                <td className="border p-2">{tx.from}</td>
                                <td className="border p-2">{tx.to}</td>
                                <td className="border p-2">{tx.amount}</td>
                                <td className="border p-2">{tx.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TransactionPage;
