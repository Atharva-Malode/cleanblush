import React, { useEffect, useState } from "react";
import NavButton from "../../components/btn";
import content from "../data.json";

function HomePage() {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'english');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <div className="text-center p-8 mx-4 w-3/4">
      <img
        src="./Home image.jpeg"
        alt="BIRAC AGC JanCare Project"
        className="mx-auto w-1/2 h-auto"
      />

      <h2 className="font-sans text-2xl font-medium text-gray-700 leading-snug mt-4">
        {content["Home Page"][language].heading}
      </h2>

      <p className="font-sans text-gray-500 text-lg italic mt-2">
        {content["Home Page"][language].tagline}
      </p>

      <div className="flex items-center justify-center mt-4 space-x-4">
        <NavButton text="Let's Go!" destination="/info" />
        <select
          className="border border-gray-300 rounded-md p-2 bg-white text-gray-700"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="gujarati">Gujarati</option>
          <option value="marathi">Marathi</option>
        </select>
      </div>
    </div>
  );
}

export default HomePage;