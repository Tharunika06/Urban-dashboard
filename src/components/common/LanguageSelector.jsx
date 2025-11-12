// src/components/common/LanguageSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import '../../styles/LanguageSelector.css';

const LanguageSelector = () => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState({
    code: 'en-US',
    name: 'Eng (US)',
    flag: 'https://flagcdn.com/w40/us.png'
  });

  const dropdownRef = useRef();

  const languages = [
    { code: 'en-US', name: 'Eng (US)', flag: 'https://flagcdn.com/w40/us.png' },
    { code: 'en-GB', name: 'Eng (UK)', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'es', name: 'Spanish', flag: 'https://flagcdn.com/w40/es.png' },
    { code: 'fr', name: 'French', flag: 'https://flagcdn.com/w40/fr.png' },
    { code: 'de', name: 'German', flag: 'https://flagcdn.com/w40/de.png' },
    { code: 'it', name: 'Italian', flag: 'https://flagcdn.com/w40/it.png' },
    { code: 'pt', name: 'Portuguese', flag: 'https://flagcdn.com/w40/pt.png' },
    { code: 'zh', name: 'Chinese', flag: 'https://flagcdn.com/w40/cn.png' },
    { code: 'ja', name: 'Japanese', flag: 'https://flagcdn.com/w40/jp.png' },
    { code: 'ko', name: 'Korean', flag: 'https://flagcdn.com/w40/kr.png' },
    { code: 'ar', name: 'Arabic', flag: 'https://flagcdn.com/w40/sa.png' },
    { code: 'hi', name: 'Hindi', flag: 'https://flagcdn.com/w40/in.png' },
    { code: 'ru', name: 'Russian', flag: 'https://flagcdn.com/w40/ru.png' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    };

    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageMenu]);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowLanguageMenu(false);
    localStorage.setItem('selectedLanguage', JSON.stringify(language));
  };

  return (
    <div className="language-selector-container" ref={dropdownRef}>
      <button 
        className="language-selector-btn"
        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
      >
        <img 
          src={selectedLanguage.flag} 
          alt={selectedLanguage.name} 
          className="flag-icon" 
        />
        <span className="d-none d-md-inline">{selectedLanguage.name}</span>
        <FiChevronDown className="d-none d-md-inline" />
      </button>

      {showLanguageMenu && (
        <div className="language-dropdown">
          {languages.map((language) => (
            <div
              key={language.code}
              className={`language-option ${selectedLanguage.code === language.code ? 'active' : ''}`}
              onClick={() => handleLanguageSelect(language)}
            >
              <img 
                src={language.flag} 
                alt={language.name} 
                className="flag-icon" 
              />
              <span>{language.name}</span>
              {selectedLanguage.code === language.code && (
                <span className="checkmark">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;