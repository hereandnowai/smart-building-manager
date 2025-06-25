
import React, { useState, useEffect, useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icons, BRANDING } from '../constants';
import { getEnergySavingRecommendations, mockApiService } from '../services/aiService';
import { EnergyData } from '../types';
import { DarkModeContext } from '../App';


const EnergyPage: React.FC = () => {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [recommendations, setRecommendations] = useState<string>('');
  const [loadingRecs, setLoadingRecs] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [userInput, setUserInput] = useState<string>('High energy usage during evenings, moderate during daytime. Office building with standard HVAC and lighting.');
  const darkModeContext = useContext(DarkModeContext);


  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const data = await mockApiService.getEnergyData();
        setEnergyData(data);
      } catch (error) {
        console.error("Failed to fetch energy data:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleGetRecommendations = async () => {
    if (!userInput.trim()) {
      setRecommendations("Please describe your energy usage pattern to get recommendations.");
      return;
    }
    setLoadingRecs(true);
    setRecommendations('');
    try {
      const recs = await getEnergySavingRecommendations(userInput);
      setRecommendations(recs);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      setRecommendations("Sorry, an error occurred while fetching recommendations.");
    } finally {
      setLoadingRecs(false);
    }
  };
  
  if (!darkModeContext) return null;
  const { darkMode } = darkModeContext;

  const chartStrokeColor = darkMode ? '#A0AEC0' : '#4A5568'; // gray-400 dark, gray-700 light
  const chartFillColor = BRANDING.PRIMARY_COLOR;


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">Energy Management</h2>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Today's Energy Usage & Prediction (kWh)</h3>
        {loadingData ? (
          <div className="flex justify-center items-center h-64">
            <Icons.Energy className="w-10 h-10 animate-spin text-primary" />
            <span className="ml-3">Loading energy data...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#4A5568" : "#E2E8F0"} />
              <XAxis dataKey="time" stroke={chartStrokeColor} />
              <YAxis stroke={chartStrokeColor} />
              <Tooltip 
                contentStyle={{ 
                    backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.8)', // gray-700 dark, white light
                    borderColor: darkMode ? '#4A5568' : '#CBD5E0', // gray-600 dark, gray-300 light
                    color: darkMode ? '#F7FAFC' : '#1A202C' // gray-100 dark, gray-900 light
                }} 
                itemStyle={{ color: darkMode ? '#F7FAFC' : '#1A202C' }}
              />
              <Legend wrapperStyle={{ color: chartStrokeColor }}/>
              <Bar dataKey="usage" fill={chartFillColor} name="Actual Usage" />
              <Bar dataKey="prediction" fillOpacity={0.6} fill={BRANDING.SECONDARY_COLOR} name="AI Prediction" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">AI Energy Saving Recommendations</h3>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Describe current energy usage patterns (e.g., high HVAC use in afternoons, lights always on in hallways)..."
          rows={3}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          onClick={handleGetRecommendations}
          disabled={loadingRecs}
          className="px-6 py-2 bg-primary text-secondary font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center"
        >
          {loadingRecs ? (
            <>
              <Icons.Energy className="w-5 h-5 mr-2 animate-spin" />
              Getting Recommendations...
            </>
          ) : (
            <>
              <Icons.Chat className="w-5 h-5 mr-2" /> Get AI Recommendations
            </>
          )}
        </button>

        {recommendations && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">Recommendations from Caramel AI:</h4>
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {recommendations.split('\n').map((line, index) => (
                <p key={index} className={line.startsWith('*') || line.startsWith('-') ? 'ml-4' : ''}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Energy Controls (Simulated)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="hvac-mode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">HVAC Mode</label>
            <select id="hvac-mode" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option>Auto (AI Optimized)</option>
              <option>Cool</option>
              <option>Heat</option>
              <option>Off</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="lighting-zone-a" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lighting (Zone A)</label>
            <input type="range" id="lighting-zone-a" min="0" max="100" defaultValue="70" className="w-full accent-primary"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyPage;
