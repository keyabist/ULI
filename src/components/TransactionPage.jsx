import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";

const TransactionPage = () => {
    const { loanId } = useParams();
    const [transactions, setTransactions] = useState([]);
    const CONTRACT_ADDRESS = "0x6b82A39f2f184A069D999D24025Cf656d0d8E5cf";

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract = new ethers.Contract(contractAddress, contractABI, provider);
                
                const txs = await contract.getTransactions(loanId);
                const formattedTxs = txs.map(tx => ({
                    loanId: tx.loanId.toNumber(),
                    from: tx.from,
                    to: tx.to,
                    amount: ethers.utils.formatEther(tx.amount),
                    timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleString()
                }));
                setTransactions(formattedTxs);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };

        if (loanId) fetchTransactions();
    }, [loanId]);

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Loan Transactions</h2>
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
