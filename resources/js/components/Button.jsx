import React from "react";
import { useNavigate } from "react-router-dom";

const Button = ({ text, to, bgColor = "bg-green-600", textColor = "text-white" , border='border border-none', icon: Icon }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
     className={`${bgColor} ${textColor} ${border} px-6 py-2 rounded-lg font-medium hover:opacity-90 transition duration-300 ease-in-out w-max cursor-pointer flex items-center gap-2`}
    >
      {text}
      {Icon && <Icon className="w-5 h-5" />}
    </button>
  );
};

export default Button;
