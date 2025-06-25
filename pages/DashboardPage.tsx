
import React, { useState, useEffect, useContext, SVGProps } from 'react';
import { Icons } from '../constants';
import { mockApiService } from '../services/aiService';
import { DarkModeContext } from '../App';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  unit?: string;
  bgColorClass?: string;
  textColorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, unit, bgColorClass = 'bg-secondary', textColorClass = 'text-primary' }) => {
  const darkModeContext = useContext(DarkModeContext);
  if (!darkModeContext) return null;
  const { darkMode } = darkModeContext;

  const cardBg = darkMode ? 'dark:bg-gray-800' : 'bg-white';
  const textPrimaryColor = darkMode ? 'dark:text-gray-100' : 'text-gray-900'; // Renamed to avoid conflict
  const textSecondaryColor = darkMode ? 'dark:text-gray-400' : 'text-gray-500'; // Renamed to avoid conflict
  const iconColorClass = darkMode ? 'text-primary' : 'text-secondary'; // Renamed for clarity


  return (
    <div className={`p-6 rounded-xl shadow-lg flex items-center space-x-4 ${cardBg} transition-colors duration-300`}>
      <div className={`p-3 rounded-full ${bgColorClass} ${textColorClass}`}>
        {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, { className: `w-8 h-8 ${iconColorClass}` })}
      </div>
      <div>
        <p className={`text-sm font-medium ${textSecondaryColor}`}>{title}</p>
        <p className={`text-3xl font-bold ${textPrimaryColor}`}>{value} <span className="text-lg">{unit}</span></p>
      </div>
    </div>
  );
};


const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const darkModeContext = useContext(DarkModeContext);


  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await mockApiService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  
  if (!darkModeContext) return null; // Ensure context is available
  const { darkMode } = darkModeContext;

  if (loading) {
    return <div className={`flex justify-center items-center h-full ${darkMode ? 'text-white' : 'text-gray-800'}`}><Icons.Energy className="w-12 h-12 animate-spin text-primary" /> <span className="ml-4 text-xl">Loading Dashboard...</span></div>;
  }

  if (!stats) {
    return <div className="text-center text-red-500">Failed to load dashboard data.</div>;
  }

  const textColor = darkMode ? 'text-white' : 'text-gray-800';
  const subTextColor = darkMode ? 'text-gray-300' : 'text-gray-700';


  return (
    <div className="space-y-8">
      <h2 className={`text-3xl font-semibold ${textColor}`}>Building Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Energy Saved This Month" value={stats.totalEnergySaved} unit="kWh" icon={<Icons.Energy />} bgColorClass="bg-green-100 dark:bg-green-900" textColorClass="text-green-600 dark:text-green-300" />
        <StatCard title="Active Security Alerts" value={stats.activeAlerts} icon={<Icons.Security />} bgColorClass="bg-red-100 dark:bg-red-900" textColorClass="text-red-600 dark:text-red-300" />
        <StatCard title="Current Occupancy Rate" value={stats.occupancyRate} unit="%" icon={<Icons.User />} bgColorClass="bg-blue-100 dark:bg-blue-900" textColorClass="text-blue-600 dark:text-blue-300" />
        <StatCard title="Overall Comfort Score" value={stats.overallComfortScore} unit="%" icon={<Icons.Comfort />} bgColorClass="bg-yellow-100 dark:bg-yellow-800" textColorClass="text-yellow-600 dark:text-yellow-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className={`text-xl font-semibold mb-4 ${textColor}`}>Recent Activity</h3>
          <ul className={`space-y-3 ${subTextColor}`}>
            <li className="flex items-center"><Icons.Energy className="w-5 h-5 mr-2 text-green-500"/> Lighting adjusted in Zone B for energy saving.</li>
            <li className="flex items-center"><Icons.Security className="w-5 h-5 mr-2 text-red-500"/> Motion detected at main entrance after hours.</li>
            <li className="flex items-center"><Icons.Comfort className="w-5 h-5 mr-2 text-blue-500"/> Temperature increased in Meeting Room 1 based on schedule.</li>
            <li className="flex items-center"><Icons.User className="w-5 h-5 mr-2 text-yellow-500"/> Peak occupancy detected during lunchtime.</li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className={`text-xl font-semibold mb-4 ${textColor}`}>System Status</h3>
          {/* Placeholder for system status indicators */}
          <div className="space-y-2">
            <p className={`${subTextColor}`}>HVAC System: <span className="text-green-500 font-semibold">Online</span></p>
            <p className={`${subTextColor}`}>Lighting Control: <span className="text-green-500 font-semibold">Online</span></p>
            <p className={`${subTextColor}`}>Security Cameras: <span className="text-green-500 font-semibold">Online</span></p>
            <p className={`${subTextColor}`}>Access Control: <span className="text-yellow-500 font-semibold">Partial Service (Zone C Offline)</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
