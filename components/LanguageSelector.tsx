import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES, Language } from '../hooks/useTranslation';

const LanguageSelector: React.FC = () => {
  const { language, changeLanguage } = useTranslation();

  return (
    <div className="relative inline-block">
      <div className="flex items-center space-x-2">
        <Globe className="w-4 h-4 text-gray-500" />
        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value as Language)}
          className="appearance-none bg-transparent border-none pr-8 py-1 pl-2 text-sm text-gray-700 hover:text-gray-900 cursor-pointer focus:outline-none"
        >
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default LanguageSelector;