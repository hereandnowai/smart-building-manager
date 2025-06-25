
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Icons, DAYS_OF_WEEK, LOCAL_STORAGE_SCHEDULES_KEY } from '../constants';
import { ScheduleItem, DayOfWeek } from '../types';
import { DarkModeContext } from '../App';

const initialFormData: Omit<ScheduleItem, 'id'> = {
  name: '',
  targetDevice: 'Temperature',
  targetValue: '',
  time: '00:00',
  days: [],
  isActive: true,
};

const SchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [formData, setFormData] = useState<Omit<ScheduleItem, 'id'>>(initialFormData);
  const darkModeContext = useContext(DarkModeContext);

  useEffect(() => {
    try {
      const storedSchedules = localStorage.getItem(LOCAL_STORAGE_SCHEDULES_KEY);
      if (storedSchedules) {
        setSchedules(JSON.parse(storedSchedules));
      }
    } catch (error) {
        console.error("Error loading schedules from localStorage:", error);
        localStorage.removeItem(LOCAL_STORAGE_SCHEDULES_KEY); // Clear corrupted data
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem(LOCAL_STORAGE_SCHEDULES_KEY, JSON.stringify(schedules));
    } catch (error) {
        console.error("Error saving schedules to localStorage:", error);
    }
  }, [schedules]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && name === 'isActive') { // Corrected: removed extra ')'
        setFormData(prev => ({ ...prev, isActive: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleDayToggle = useCallback((day: DayOfWeek) => {
    setFormData(prev => {
      const newDays = prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day];
      return { ...prev, days: newDays };
    });
  }, []);

  const handleOpenModal = (schedule?: ScheduleItem) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        name: schedule.name,
        targetDevice: schedule.targetDevice,
        targetValue: schedule.targetValue,
        time: schedule.time,
        days: schedule.days,
        isActive: schedule.isActive,
      });
    } else {
      setEditingSchedule(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetValue || !formData.time || formData.days.length === 0) {
      alert("Please fill in all required fields: Name, Target Value, Time, and select at least one Day.");
      return;
    }

    if (editingSchedule) {
      setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? { ...formData, id: s.id } : s));
    } else {
      const newSchedule: ScheduleItem = { ...formData, id: `sch_${Date.now()}` };
      setSchedules(prev => [...prev, newSchedule]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      setSchedules(prev => prev.filter(s => s.id !== id));
    }
  };

  const toggleScheduleActive = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };
  
  if (!darkModeContext) return null;
  const { darkMode } = darkModeContext;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const borderColor = darkMode ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className={`text-3xl font-semibold ${textColor}`}>Manage Comfort Schedules</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-secondary font-semibold rounded-lg hover:bg-yellow-300 transition-colors flex items-center"
        >
          <Icons.PlusCircle className="w-5 h-5 mr-2" /> Add New Schedule
        </button>
      </div>

      {/* Schedules Table/List */}
      <div className={`${cardBg} shadow-xl rounded-xl overflow-hidden`}>
        {schedules.length === 0 ? (
          <p className={`p-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No schedules found. Add one to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  {['Name', 'Target', 'Time', 'Days', 'Status', 'Actions'].map(header => (
                    <th key={header} scope="col" className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {schedules.map(schedule => (
                  <tr key={schedule.id} className={`${darkMode ? 'hover:bg-gray-700/[0.5]' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textColor}`}>{schedule.name}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{schedule.targetDevice}: {schedule.targetValue}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{schedule.time}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{schedule.days.join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <button
                        onClick={() => toggleScheduleActive(schedule.id)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors
                          ${schedule.isActive 
                            ? (darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-100 hover:bg-green-200 text-green-800')
                            : (darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-800')}
                        `}
                      >
                        {schedule.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleOpenModal(schedule)} className={`p-1 rounded hover:bg-primary/20 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`} aria-label="Edit schedule">
                        <Icons.Pencil className="w-5 h-5"/>
                      </button>
                      <button onClick={() => handleDelete(schedule.id)} className={`p-1 rounded hover:bg-primary/20 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`} aria-label="Delete schedule">
                        <Icons.Trash className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Modal for Add/Edit Schedule */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center p-4 z-[1000] transition-opacity duration-300" onClick={handleCloseModal}>
          <div className={`${cardBg} ${textColor} p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100`} onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-semibold mb-6">{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Schedule Name</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required 
                       className={`w-full p-2 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="targetDevice" className="block text-sm font-medium mb-1">Target Device</label>
                  <select name="targetDevice" id="targetDevice" value={formData.targetDevice} onChange={handleInputChange}
                          className={`w-full p-2 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`}>
                    <option value="Temperature">Temperature</option>
                    <option value="Lighting">Lighting</option>
                    <option value="HVAC">HVAC</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="targetValue" className="block text-sm font-medium mb-1">Target Value (e.g., 22°C, 75%, On)</label>
                  <input type="text" name="targetValue" id="targetValue" value={formData.targetValue} onChange={handleInputChange} required
                         className={`w-full p-2 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium mb-1">Time (HH:MM)</label>
                <input type="time" name="time" id="time" value={formData.time} onChange={handleInputChange} required
                       className={`w-full p-2 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Days of the Week</label>
                <div className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 p-2 border ${borderColor} rounded-lg ${inputBg}`}>
                  {DAYS_OF_WEEK.map(day => (
                    <button type="button" key={day} onClick={() => handleDayToggle(day)}
                            className={`p-2 rounded-md text-sm transition-colors
                              ${formData.days.includes(day) 
                                ? 'bg-primary text-secondary font-semibold' 
                                : `${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} ${textColor}`
                              }`}>
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleInputChange} 
                       className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded accent-primary"/>
                <label htmlFor="isActive" className="ml-2 block text-sm">Active</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={handleCloseModal} 
                        className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-500 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'} transition-colors`}>
                  Cancel
                </button>
                <button type="submit" 
                        className="px-4 py-2 bg-primary text-secondary font-semibold rounded-lg hover:bg-yellow-300 transition-colors">
                  {editingSchedule ? 'Save Changes' : 'Add Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesPage;
