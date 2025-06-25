
import React, { useState, useEffect, useContext } from 'react';
import { Icons, BRANDING } from '../constants';
import { mockApiService, analyzeSecurityEvent } from '../services/aiService';
import { SecurityEvent } from '../types';
import { DarkModeContext } from '../App';
import LiveCameraFeed from '../components/LiveCameraFeed'; // Import the new component


const SecurityPage: React.FC = () => {
  const [securityLogs, setSecurityLogs] = useState<SecurityEvent[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const darkModeContext = useContext(DarkModeContext);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const data = await mockApiService.getSecurityLogs();
        setSecurityLogs(data);
      } catch (error) {
        console.error("Failed to fetch security logs:", error);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, []);

  const handleAnalyzeEvent = async (event: SecurityEvent) => {
    setSelectedEvent(event);
    setLoadingAnalysis(true);
    setAnalysis('');
    try {
      const result = await analyzeSecurityEvent(event.description);
      setAnalysis(result);
    } catch (error) {
      setAnalysis('Failed to analyze event.');
    } finally {
      setLoadingAnalysis(false);
    }
  };
  
  if (!darkModeContext) return null;
  const { darkMode } = darkModeContext;


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">Security Monitoring</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Live Camera Feeds</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            For the live feed, your browser will ask for permission to use your camera. 
            AI-powered anomaly detection is active on all feeds (simulated for others).
          </p>
          <div className="grid grid-cols-2 gap-4">
            <LiveCameraFeed /> {/* Replaced first simulated feed with live feed */}
            {[2, 3, 4].map(id => (
              <div key={id} className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <Icons.VideoCamera className="w-16 h-16 opacity-50" />
                <span className="mt-2">Camera Feed {id} (Simulated)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Access Control (Simulated)</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
              Unlock Main Entrance (Temp)
            </button>
            <button className="w-full px-4 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors">
              Initiate Building Lockdown
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400">Facial recognition enabled for authorized personnel.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Security Event Log</h3>
        {loadingLogs ? (
          <div className="flex justify-center items-center h-40">
            <Icons.Security className="w-8 h-8 animate-pulse text-primary" />
             <span className="ml-3">Loading security logs...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Severity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {securityLogs.map(event => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{new Date(event.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{event.type}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-300 max-w-xs break-words">{event.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.severity === 'High' ? 'bg-red-100 dark:bg-red-700 text-red-800 dark:text-red-100' :
                        event.severity === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-100' :
                        event.severity === 'Low' ? 'bg-green-100 dark:bg-green-700 text-green-800 dark:text-green-100' : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-100'
                      }`}>
                        {event.severity || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleAnalyzeEvent(event)}
                        className="text-primary hover:text-yellow-300 font-medium"
                        disabled={loadingAnalysis && selectedEvent?.id === event.id}
                      >
                        {loadingAnalysis && selectedEvent?.id === event.id ? 'Analyzing...' : 'AI Analyze'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
         {selectedEvent && analysis && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">AI Analysis for Event: {selectedEvent.description.substring(0,30)}...</h4>
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
               {analysis.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPage;
