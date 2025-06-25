
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Icons, BRANDING } from '../constants';
import { mockApiService, getComfortOptimizationTip } from '../services/aiService';
import { ComfortSettings } from '../types';
import { DarkModeContext } from '../App';

const ComfortPage: React.FC = () => {
  const [comfortSettings, setComfortSettings] = useState<ComfortSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiTip, setAiTip] = useState<string>('');
  const [loadingTip, setLoadingTip] = useState(false);
  const darkModeContext = useContext(DarkModeContext);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await mockApiService.getComfortReadings();
        setComfortSettings(data);
      } catch (error) {
        console.error("Failed to fetch comfort settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGetAiTip = async () => {
    if (!comfortSettings) return;
    setLoadingTip(true);
    setAiTip('');
    const currentDataString = `Temp: ${comfortSettings.temperature}°C, Light: ${comfortSettings.lightingLevel}%, CO2: ${comfortSettings.airQuality.co2}ppm, Humidity: ${comfortSettings.airQuality.humidity}%, VOC: ${comfortSettings.airQuality.voc}`;
    try {
      const tip = await getComfortOptimizationTip(currentDataString);
      setAiTip(tip);
    } catch (error) {
      setAiTip('Could not fetch an AI tip at this moment.');
    } finally {
      setLoadingTip(false);
    }
  };
  
  if (!darkModeContext) return null;
  const { darkMode } = darkModeContext;


  if (loading) {
    return <div className="flex justify-center items-center h-full"><Icons.Comfort className="w-12 h-12 animate-spin text-primary" /> <span className="ml-4 text-xl">Loading Comfort Data...</span></div>;
  }

  if (!comfortSettings) {
    return <div className="text-center text-red-500">Failed to load comfort data.</div>;
  }

  const AirQualityItem: React.FC<{ label: string; value: string | number; unit: string; goodThreshold?: (val: number) => boolean }> = 
    ({ label, value, unit, goodThreshold }) => {
      let valueColor = darkMode ? 'text-gray-100' : 'text-gray-900';
      if (typeof value === 'number' && goodThreshold) {
        valueColor = goodThreshold(value) ? 'text-green-500' : 'text-red-500';
      }
      return (
        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
          <span className="text-gray-600 dark:text-gray-300">{label}:</span>
          <span className={`font-semibold ${valueColor}`}>{value} {unit}</span>
        </div>
      );
  };


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">Occupant Comfort Control</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Temperature</h3>
          <div className="flex items-center justify-center space-x-4">
            <Icons.Comfort className="w-16 h-16 text-primary" />
            <span className="text-5xl font-bold text-gray-800 dark:text-white">{comfortSettings.temperature}°C</span>
          </div>
          <input type="range" min="16" max="30" value={comfortSettings.temperature} 
                 onChange={(e) => setComfortSettings(cs => cs ? {...cs, temperature: parseInt(e.target.value)} : null)}
                 className="w-full mt-4 accent-primary" 
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Lighting</h3>
           <div className="flex items-center justify-center space-x-4">
            <Icons.Sun className="w-16 h-16 text-yellow-400" />
            <span className="text-5xl font-bold text-gray-800 dark:text-white">{comfortSettings.lightingLevel}%</span>
          </div>
          <input type="range" min="0" max="100" value={comfortSettings.lightingLevel} 
                 onChange={(e) => setComfortSettings(cs => cs ? {...cs, lightingLevel: parseInt(e.target.value)} : null)}
                 className="w-full mt-4 accent-primary"
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Air Quality Index</h3>
          <AirQualityItem label="CO2" value={comfortSettings.airQuality.co2} unit="ppm" goodThreshold={v => v < 1000} />
          <AirQualityItem label="Humidity" value={comfortSettings.airQuality.humidity} unit="%" goodThreshold={v => v >= 40 && v <= 60} />
          <AirQualityItem label="VOC Index" value={comfortSettings.airQuality.voc} unit="" goodThreshold={v => v < 1} />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">AI Comfort Tip</h3>
        <button
          onClick={handleGetAiTip}
          disabled={loadingTip}
          className="px-6 py-2 bg-primary text-secondary font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center mb-4"
        >
          {loadingTip ? (
            <>
              <Icons.Chat className="w-5 h-5 mr-2 animate-pulse" />
              Getting Tip...
            </>
          ) : (
            <>
              <Icons.Chat className="w-5 h-5 mr-2" /> Get AI Comfort Tip
            </>
          )}
        </button>
        {aiTip && (
           <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 italic">{aiTip}</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Smart Scheduling</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Automate comfort settings for different times and days.
        </p>
        <Link
          to="/schedules"
          className="mt-2 inline-block px-6 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors"
        >
          Manage Schedules
        </Link>
      </div>
    </div>
  );
};

export default ComfortPage;