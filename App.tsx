
import React, { useState, useEffect, createContext, useCallback, SVGProps } from 'react';
import { HashRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import EnergyPage from './pages/EnergyPage';
import SecurityPage from './pages/SecurityPage';
import ComfortPage from './pages/ComfortPage';
import SchedulesPage from './pages/SchedulesPage';
import IPCameraPage from './pages/IPCameraPage'; // New IP Camera Page
import AboutPage from './pages/AboutPage'; 
import CaramelAIChatWidget from './components/CaramelAIChatWidget';
import { ORG_DETAILS, BRANDING, Icons, SOCIAL_LINKS } from './constants';
import { NavItem, Page } from './types';

// Dark Mode Context
interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}
export const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prevMode => !prevMode);
  }, []);

  const navItems: NavItem[] = [
    { name: Page.Home, path: "/", icon: <Icons.Home className="w-6 h-6 mr-3" /> },
    { name: Page.Dashboard, path: "/dashboard", icon: <Icons.Dashboard className="w-6 h-6 mr-3" /> },
    { name: Page.Energy, path: "/energy", icon: <Icons.Energy className="w-6 h-6 mr-3" /> },
    { name: Page.Security, path: "/security", icon: <Icons.Security className="w-6 h-6 mr-3" /> },
    { name: Page.IPCameraManagement, path: "/ip-cameras", icon: <Icons.NetworkCamera className="w-6 h-6 mr-3" /> }, // New Nav Item
    { name: Page.Comfort, path: "/comfort", icon: <Icons.Comfort className="w-6 h-6 mr-3" /> },
    { name: Page.Schedules, path: "/schedules", icon: <Icons.CalendarDays className="w-6 h-6 mr-3" /> },
    { name: Page.About, path: "/about", icon: <Icons.InformationCircle className="w-6 h-6 mr-3" /> },
  ];

  const Header: React.FC = () => {
    const location = useLocation();
    const currentNavItem = navItems.find(item => {
      if (item.path === "/") return location.pathname === "/";
      // Ensure deeper paths like /ip-cameras/some-id still match /ip-cameras
      return location.pathname.startsWith(item.path) && (location.pathname.length === item.path.length || location.pathname[item.path.length] === '/');
    }) || navItems.find(item => item.path === "/"); 
    
    const currentPageName = currentNavItem ? currentNavItem.name : Page.Home;
    
    return (
      <header className="bg-secondary dark:bg-gray-800 text-white p-4 shadow-md flex justify-between items-center fixed top-0 left-0 right-0 h-16 z-50">
        <div className="flex items-center">
          <img src={BRANDING.MAIN_LOGO_URL} alt={`${ORG_DETAILS.SHORT_NAME} Logo`} className="h-10 mr-4" />
          <h1 className="text-xl font-semibold hidden md:block">{ORG_DETAILS.SHORT_NAME} - Smart Building Manager</h1>
        </div>
        <div className="flex items-center">
           <h2 className="text-lg font-medium mr-4 hidden sm:block">{currentPageName}</h2>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Icons.Sun className="w-6 h-6 text-yellow-300" /> : <Icons.Moon className="w-6 h-6 text-gray-300" />}
          </button>
          <Icons.User className="w-8 h-8 ml-4 text-gray-300 cursor-pointer" />
        </div>
      </header>
    );
  };

  const Sidebar: React.FC = () => (
    <aside className="bg-gray-100 dark:bg-gray-900 text-secondary dark:text-gray-300 w-64 min-h-screen pt-20 fixed top-0 left-0 shadow-lg flex flex-col justify-between">
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                end={item.path === "/"} 
                className={({ isActive }) =>
                  `flex items-center py-3 px-6 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors duration-200 ${
                    isActive ? 'bg-primary/30 dark:bg-primary/40 border-r-4 border-primary text-secondary dark:text-primary' : ''
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
       <div className="p-6 border-t border-gray-300 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            {ORG_DETAILS.SLOGAN}
          </p>
        </div>
    </aside>
  );

  const Footer: React.FC = () => (
    <footer className="bg-secondary dark:bg-gray-800 text-gray-300 dark:text-gray-400 p-6 text-center mt-auto ml-64">
      <div className="container mx-auto">
        <div className="flex justify-center space-x-6 mb-4">
          {SOCIAL_LINKS.map(link => (
            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" 
               aria-label={link.name}
               className="text-gray-300 hover:text-primary transition-colors duration-200">
              {React.cloneElement(link.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: "w-6 h-6" })}
            </a>
          ))}
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} {ORG_DETAILS.FULL_NAME}. All rights reserved.</p>
        <p className="text-xs mt-1">Developed by Arlin Robeiksha Britto [ AI Products Engineering Team]</p>
        <p className="text-xs mt-1">
          Contact: <a href={`mailto:${ORG_DETAILS.EMAIL}`} className="hover:text-primary">{ORG_DETAILS.EMAIL}</a> | 
          Phone: <a href={`tel:${ORG_DETAILS.PHONE.replace(/\s/g, '')}`} className="hover:text-primary">{ORG_DETAILS.PHONE}</a>
        </p>
      </div>
    </footer>
  );

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex flex-1 pt-16">
            <Sidebar />
            <main className="flex-1 p-8 ml-64 bg-hnai-light dark:bg-hnai-dark overflow-y-auto">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/energy" element={<EnergyPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/ip-cameras" element={<IPCameraPage />} /> {/* New Route */}
                <Route path="/comfort" element={<ComfortPage />} />
                <Route path="/schedules" element={<SchedulesPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>
          </div>
          <Footer />
          <CaramelAIChatWidget />
        </div>
      </HashRouter>
    </DarkModeContext.Provider>
  );
};

export default App;