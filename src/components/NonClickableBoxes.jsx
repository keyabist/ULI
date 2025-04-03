import React from "react";

const NonClickableBoxes = ({ boxes }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {boxes.map((box, index) => (
        <div 
          key={index}
          className="bg-green-50 text-green-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
        >
          <h3 className="text-xl font-semibold mb-2">{box.title}</h3>
          <p className="text-sm">{box.description}</p>
        </div>
      ))}
    </div>
  );
};

export default NonClickableBoxes;
