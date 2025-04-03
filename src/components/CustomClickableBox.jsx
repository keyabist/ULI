import { useNavigate } from "react-router-dom";

const LoanBox = ({ icon, heading, caption, link }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-gray-800 text-white p-4 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 cursor-pointer flex items-center gap-4"
      onClick={() => navigate(link)}
    >
      <div className="p-2 bg-gray-700 rounded-full">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold">{heading}</h3>
        <p className="text-sm opacity-75">{caption}</p>
      </div>
    </div>
  );
};

export default LoanBox;
