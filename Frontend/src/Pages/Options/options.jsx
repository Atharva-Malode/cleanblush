import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import content from '../data.json';

function SelectionPage() {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'english');
  const navigate = useNavigate();

  useEffect(() => {
    // Check for changes in localStorage directly
    const handleStorageChange = () => {
      const newLanguage = localStorage.getItem('language');
      if (newLanguage) {
        setLanguage(newLanguage);
        console.log('Language:', newLanguage);
      }
    };

    // Call the handler to set initial language
    handleStorageChange();

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array so it runs once when component mounts

  return (
    <div className='space-y-6'>
      {/* Use the language content from JSON */}
      <h1 className="font-serif text-4xl font-bold text-indigo-600 leading-tight">
        {content.Select[language].title}
      </h1>
      
      <button 
        onClick={() => navigate('/osmf')} 
        className='mr-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full'>
        {content.Select[language].dis1}
      </button>
      
      <button 
        onClick={() => navigate('/gingivitis')} 
        className='mr-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full'>
        {content.Select[language].dis2}
      </button>
      
      <button 
        onClick={() => navigate('/phenotype')} 
        className='mr-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full'>
        {content.Select[language].dis3}
      </button>
      
      <button 
        onClick={() => navigate('/calculus')} 
        className='mr-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-full'>
        {content.Select[language].dis4}
      </button>
    </div>
  );
}

export default SelectionPage;
