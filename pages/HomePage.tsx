import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ORG_DETAILS, BRANDING, Icons } from '../constants';
import { DarkModeContext } from '../App'; // Assuming App.tsx exports DarkModeContext

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode, linkTo: string }> = ({ title, description, icon, linkTo }) => {
  const darkModeContext = useContext(DarkModeContext);
  if (!darkModeContext) return null;
  const { darkMode } = darkModeContext;

  return (
    <Link to={linkTo} className={`block p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}>
      <div className={`mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full ${darkMode ? 'bg-primary/20' : 'bg-secondary/10'}`}>
        {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: `w-8 h-8 ${darkMode ? 'text-primary' : 'text-secondary'}` })}
      </div>
      <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-primary' : 'text-secondary'}`}>{title}</h3>
      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{description}</p>
    </Link>
  );
};

const HomePage: React.FC = () => {
  const darkModeContext = useContext(DarkModeContext);
  if (!darkModeContext) return null; // Should be provided by App
  const { darkMode } = darkModeContext;

  return (
    <div className={`min-h-full flex flex-col items-center justify-center p-4 md:p-8 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <header className="text-center mb-12">
        <img 
          src={BRANDING.MAIN_LOGO_URL} 
          alt={`${ORG_DETAILS.SHORT_NAME} Logo`} 
          className="w-48 h-auto mx-auto mb-6"
        />
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Welcome to <span className="text-primary">Smart Building Manager</span>
        </h1>
        <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
          By {ORG_DETAILS.FULL_NAME}
        </p>
        <p className={`text-lg italic ${darkMode ? 'text-yellow-300' : 'text-secondary'}`}>
          "{ORG_DETAILS.SLOGAN}"
        </p>
      </header>

      <section className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl font-semibold mb-4">Intelligently Managing Your Spaces</h2>
        <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          The Smart Building Manager application leverages cutting-edge AI and IoT integrations
          to help your organization optimize energy consumption, enhance security measures,
          and significantly improve occupant comfort. Explore how we transform buildings into
          smarter, more efficient, and user-friendly environments.
        </p>
      </section>

      <section className="w-full max-w-5xl mx-auto mb-12">
        <h2 className="text-2xl font-semibold text-center mb-8">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Energy Optimization" 
            description="Monitor, predict, and control energy usage with AI-driven insights and automation for maximum efficiency."
            icon={<Icons.Energy />}
            linkTo="/energy"
          />
          <FeatureCard 
            title="Smart Security" 
            description="Enhance building safety with AI-powered surveillance, access control, and real-time emergency alerts."
            icon={<Icons.Security />}
            linkTo="/security"
          />
          <FeatureCard 
            title="Occupant Comfort" 
            description="Personalize and automate environmental controls for optimal air quality, lighting, and temperature."
            icon={<Icons.Comfort />}
            linkTo="/comfort"
          />
        </div>
      </section>

      <section className="text-center">
        <Link
          to="/dashboard"
          className="px-8 py-3 bg-primary text-secondary text-lg font-semibold rounded-lg hover:bg-yellow-300 transition-colors duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          Go to Dashboard
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
