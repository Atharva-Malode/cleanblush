import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import content from "../data.json";

function InfoPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [village, setVillage] = useState("");
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'english');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const existingFormData = localStorage.getItem("formData");
    if (existingFormData) {
      localStorage.clear();
    }
    const formData = {
      name: name,
      age: age,
      gender: gender,
      village: village
    };
    localStorage.setItem("formData", JSON.stringify(formData));
    navigate("/selection");
    console.log(formData);
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <div className="text-black">
      <h1 className="font-serif text-4xl font-bold text-indigo-600 leading-tight">{content["Info Page"][language].title}</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4 flex flex-row items-center">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mr-2">{content["Info Page"][language].nameLabel}</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={content["Info Page"][language].namePlaceholder}
            className="border rounded-md px-3 py-2 w-full text-gray-700"
            required
          />
        </div>
        <div className="mb-4 flex flex-row items-center">
          <label htmlFor="age" className="block text-gray-700 text-sm font-bold mr-2">{content["Info Page"][language].ageLabel}</label>
          <input
            type="number"
            id="age"
            name="age"
            placeholder={content["Info Page"][language].agePlaceholder}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="border rounded-md px-3 py-2 w-full text-gray-700"
            required
          />
        </div>
        <div className="mb-4 flex flex-row items-center">
          <label htmlFor="gender" className="block text-gray-700 text-sm font-bold mr-2">{content["Info Page"][language].genderLabel}</label>
          <select
            id="gender"
            name="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border rounded-md px-3 py-2 w-full text-gray-700"
            required
          >
            <option value="">{content["Info Page"][language].genderOptions.select}</option>
            <option value="male">{content["Info Page"][language].genderOptions.male}</option>
            <option value="female">{content["Info Page"][language].genderOptions.female}</option>
            <option value="other">{content["Info Page"][language].genderOptions.other}</option>
          </select>
        </div>
        <div className="mb-4 flex flex-row items-center">
          <label htmlFor="village" className="block text-gray-700 text-sm font-bold mr-2">{content["Info Page"][language].villageLabel}</label>
          <input
            type="text"
            id="village"
            name="village"
            value={village}
            placeholder={content["Info Page"][language].villagePlaceholder}
            onChange={(e) => setVillage(e.target.value)}
            className="border rounded-md px-3 py-2 w-full text-gray-700"
            required
          />
        </div>
        <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full mb-2">{content["Info Page"][language].submitButton}</button>
      </form>
    </div>
  );
}

export default InfoPage;

