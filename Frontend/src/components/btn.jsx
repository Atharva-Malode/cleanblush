import React from "react";
import { useNavigate } from "react-router-dom";

function NavButton({ destination, text, onClick }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(destination);
        }
    };

    return (
        <button
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full"
            onClick={handleClick}
        >
            {text}
        </button>
    );
}

export default NavButton;
