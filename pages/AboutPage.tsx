import React, { useContext } from 'react';
import { ORG_DETAILS, BRANDING, Icons, SOCIAL_LINKS } from '../constants';
import { DarkModeContext } from '../App'; 

const AboutPage: React.FC = () => {
  const darkModeContext = useContext(DarkModeContext);
  if (!darkModeContext) return null; 
  const { darkMode } = darkModeContext;

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const subTextColor = darkMode ? 'text-gray-300' : 'text-gray-600';
  const headingColor = darkMode ? 'text-primary' : 'text-secondary';

  return (
    <div className="space-y-8 p-4 md:p-0">
      <header className={`text-center py-10 ${cardBg} shadow-lg rounded-xl`}>
        <img 
          src={BRANDING.MAIN_LOGO_URL} 
          alt={`${ORG_DETAILS.SHORT_NAME} Logo`} 
          className="w-40 md:w-48 h-auto mx-auto mb-6"
        />
        <h1 className={`text-3xl md:text-4xl font-bold ${headingColor} mb-2`}>
          {ORG_DETAILS.FULL_NAME}
        </h1>
        <p className={`text-lg italic ${darkMode ? 'text-yellow-300' : 'text-secondary'}`}>
          "{ORG_DETAILS.SLOGAN}"
        </p>
      </header>

      <section className={`${cardBg} p-6 md:p-8 rounded-xl shadow-lg`}>
        <h2 className={`text-2xl font-semibold ${headingColor} mb-4 border-b pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>Our Mission</h2>
        <p className={`${subTextColor} leading-relaxed text-justify`}>
          At {ORG_DETAILS.SHORT_NAME}, we are dedicated to pioneering advancements in Artificial Intelligence to create impactful solutions 
          that address real-world challenges. Our research focuses on developing intelligent systems that are not only innovative 
          but also ethically responsible and beneficial to society. For the Smart Building Manager, our mission is to transform conventional 
          buildings into intelligent, adaptive, and sustainable environments. We aim to empower businesses and facility managers 
          with AI-driven tools that optimize energy consumption, bolster security, and enhance the comfort and productivity of occupants. 
          Through continuous research and collaboration, we strive to set new benchmarks in smart building technology, making spaces more 
          efficient, secure, and intuitive.
        </p>
      </section>

      <section className={`${cardBg} p-6 md:p-8 rounded-xl shadow-lg`}>
        <h2 className={`text-2xl font-semibold ${headingColor} mb-4 border-b pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>Contact Us</h2>
        <div className="space-y-3">
          <p className={`${subTextColor}`}>
            <strong className={`${textColor}`}>Website:</strong> 
            <a href={ORG_DETAILS.WEBSITE} target="_blank" rel="noopener noreferrer" className={`ml-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
              {ORG_DETAILS.WEBSITE}
            </a>
          </p>
          <p className={`${subTextColor}`}>
            <strong className={`${textColor}`}>Email:</strong> 
            <a href={`mailto:${ORG_DETAILS.EMAIL}`} className={`ml-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
              {ORG_DETAILS.EMAIL}
            </a>
          </p>
          <p className={`${subTextColor}`}>
            <strong className={`${textColor}`}>Phone:</strong> 
            <a href={`tel:${ORG_DETAILS.PHONE.replace(/\s/g, '')}`} className={`ml-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
              {ORG_DETAILS.PHONE}
            </a>
          </p>
        </div>
      </section>

      <section className={`${cardBg} p-6 md:p-8 rounded-xl shadow-lg`}>
        <h2 className={`text-2xl font-semibold ${headingColor} mb-6 border-b pb-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>Connect With Us</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {SOCIAL_LINKS.map(link => (
            <a 
              key={link.name} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label={`Visit ${ORG_DETAILS.SHORT_NAME} on ${link.name}`}
              className={`flex flex-col items-center p-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-110 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {React.cloneElement(link.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { 
                className: `w-8 h-8 ${darkMode ? 'text-primary' : 'text-secondary'}` 
              })}
              <span className={`mt-2 text-xs ${subTextColor}`}>{link.name}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;