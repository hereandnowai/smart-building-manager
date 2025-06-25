
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import Hls from 'hls.js/dist/hls.min.js'; // Import Hls.js
import { 
    Icons, 
    LOCAL_STORAGE_IP_CAMERAS_KEY, 
    STREAM_TYPES, 
    DEFAULT_RTSP_PORT,
    DEFAULT_MJPEG_PORT,
} from '../constants';
import { IPCamera, IPCameraStatus, IPCameraStreamType } from '../types';
import { DarkModeContext } from '../App';

const initialFormData: Omit<IPCamera, 'id' | 'status' | 'simulatedHlsUrl' | 'lastChecked' | 'motionDetectionSimulated' | 'isRecordingSimulated'> = {
  name: '',
  ipAddress: '', 
  port: DEFAULT_RTSP_PORT,
  cameraChannel: 1,
  username: '',
  password: '',
  streamType: 'RTSP',
  customRtspUrl: '',
  locationTag: '',
};

const IPCameraPage: React.FC = () => {
  const [ipCameras, setIpCameras] = useState<IPCamera[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState<IPCamera | null>(null);
  const [formData, setFormData] = useState<Omit<IPCamera, 'id' | 'status' | 'simulatedHlsUrl' | 'lastChecked' | 'motionDetectionSimulated' | 'isRecordingSimulated'>>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [showEnlargeModal, setShowEnlargeModal] = useState(false);
  const [enlargedCamera, setEnlargedCamera] = useState<IPCamera | null>(null);
  const darkModeContext = useContext(DarkModeContext);

  useEffect(() => {
    try {
      const storedCameras = localStorage.getItem(LOCAL_STORAGE_IP_CAMERAS_KEY);
      if (storedCameras) {
        const parsedCameras: IPCamera[] = JSON.parse(storedCameras).map((cam: any) => ({
          ...initialFormData,
          ...cam,
          simulatedHlsUrl: cam.simulatedHlsUrl || `https://simulated.stream/${cam.id || `cam_${Date.now()}`}/live.m3u8`, // Ensure HLS URL exists
          motionDetectionSimulated: cam.motionDetectionSimulated ?? false,
          isRecordingSimulated: cam.isRecordingSimulated ?? false,
          status: cam.status || 'Offline',
          cameraChannel: cam.cameraChannel || 1,
        }));
        setIpCameras(parsedCameras);
      }
    } catch (error) {
      console.error("Error loading IP cameras from localStorage:", error);
      localStorage.removeItem(LOCAL_STORAGE_IP_CAMERAS_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_IP_CAMERAS_KEY, JSON.stringify(ipCameras));
    } catch (error) {
      console.error("Error saving IP cameras to localStorage:", error);
    }
  }, [ipCameras]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => {
        let newFormData = { ...prev, [name]: type === 'checkbox' ? checked : value };
        if (name === 'streamType') {
            newFormData.port = value === 'RTSP' ? DEFAULT_RTSP_PORT : DEFAULT_MJPEG_PORT;
        }
        if (name === 'port' || name === 'cameraChannel') {
            newFormData = { ...newFormData, [name]: parseInt(value, 10) || (name === 'cameraChannel' ? 1 : 0) };
        }
        return newFormData;
    });
  }, []);

  const handleOpenModal = (camera?: IPCamera) => {
    if (camera) {
      setEditingCamera(camera);
      setFormData({
        name: camera.name,
        ipAddress: camera.ipAddress,
        port: camera.port,
        cameraChannel: camera.cameraChannel || 1,
        username: camera.username || '',
        password: camera.password || '',
        streamType: camera.streamType,
        customRtspUrl: camera.customRtspUrl || '',
        locationTag: camera.locationTag || '',
      });
    } else {
      setEditingCamera(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCamera(null);
    setFormData(initialFormData);
    setIsLoading(false);
  };
  
  const handleOpenEnlargeModal = (camera: IPCamera) => {
    setEnlargedCamera(camera);
    setShowEnlargeModal(true);
  };

  const handleCloseEnlargeModal = () => {
    setShowEnlargeModal(false);
    setEnlargedCamera(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ipAddress) {
      alert("Please fill in Camera Name and DVR IP Address/Hostname.");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate backend processing

    // Simulate RTSP URL construction for display/logging if no custom URL
    // This isn't directly used for HLS playback in this simulation but good for concept
    const constructedRtspUrl = formData.customRtspUrl || 
      `rtsp://${formData.username && formData.password ? `${formData.username}:${formData.password}@` : ''}${formData.ipAddress}:${formData.port}/cam/realmonitor?channel=${formData.cameraChannel || 1}&subtype=0`;

    const camId = editingCamera ? editingCamera.id : `ipcam_${Date.now()}`;
    // This is the CRITICAL part for HLS.js: a unique, plausible (but fake) HLS URL.
    // In a real system, the backend would generate this after successful RTSP -> HLS conversion.
    const simulatedHlsUrl = `https://your-simulated-hls-server.com/live/${camId.replace(/[^a-zA-Z0-9_-]/g, '')}/index.m3u8`;

    const cameraDataFromForm = {
        ...formData,
        port: Number(formData.port) || (formData.streamType === 'RTSP' ? DEFAULT_RTSP_PORT : DEFAULT_MJPEG_PORT),
        cameraChannel: Number(formData.cameraChannel) || 1,
    };

    if (editingCamera) {
      setIpCameras(prevCams => prevCams.map(cam => 
        cam.id === editingCamera.id 
        ? { ...editingCamera, ...cameraDataFromForm, simulatedHlsUrl, status: cam.status === 'Offline' ? 'Offline' : 'Online', lastChecked: new Date().toISOString() } 
        : cam
      ));
    } else {
      const newCamera: IPCamera = {
        id: camId,
        ...cameraDataFromForm,
        status: 'Online', 
        simulatedHlsUrl,
        lastChecked: new Date().toISOString(),
        motionDetectionSimulated: false,
        isRecordingSimulated: false,
      };
      setIpCameras(prevCams => [...prevCams, newCamera]);
    }
    setIsLoading(false);
    handleCloseModal();
  };

  const handleDeleteCamera = (id: string) => {
    if (window.confirm("Are you sure you want to delete this IP camera configuration?")) {
      setIpCameras(prev => prev.filter(cam => cam.id !== id));
    }
  };
  
  const toggleCameraStatus = (id: string) => {
    setIpCameras(prev => prev.map(cam => {
      if (cam.id === id) {
        const newStatus: IPCameraStatus = cam.status === 'Online' ? 'Offline' : 'Online';
        return { ...cam, status: newStatus, lastChecked: new Date().toISOString() };
      }
      return cam;
    }));
  };

  const toggleMotionDetection = (id: string) => {
    setIpCameras(prev => prev.map(cam => cam.id === id ? { ...cam, motionDetectionSimulated: !cam.motionDetectionSimulated } : cam));
  };

  const toggleRecording = (id: string) => {
    setIpCameras(prev => prev.map(cam => cam.id === id ? { ...cam, isRecordingSimulated: !cam.isRecordingSimulated } : cam));
  };
  
  const handleSnapshot = (cameraName: string) => {
    alert(`Snapshot taken for ${cameraName} (Simulated).`);
  };

  if (!darkModeContext) return null;
  const { darkMode } = darkModeContext;
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-600' : 'border-gray-300';
  const placeholderIconColor = darkMode ? 'text-gray-500' : 'text-gray-400';
  const buttonHoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';


  const VideoPlayer: React.FC<{ camera: IPCamera, isEnlarged?: boolean }> = ({ camera, isEnlarged }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [playerStatus, setPlayerStatus] = useState<IPCameraStatus>(camera.status);
    const [lastAttemptedUrl, setLastAttemptedUrl] = useState<string | null>(null);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        // Function to cleanup existing HLS instance
        const cleanupHls = () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (videoElement.src) { // Clear previous source
                videoElement.removeAttribute('src');
                videoElement.load(); // Resets the media element to its initial state
            }
        };
        
        if (camera.status === 'Online' && camera.simulatedHlsUrl) {
            if (lastAttemptedUrl === camera.simulatedHlsUrl && playerStatus === 'Online') {
                 // Already playing this URL, do nothing
            } else {
                cleanupHls(); // Cleanup before initializing new stream
                setPlayerStatus('Loading Stream');
                setLastAttemptedUrl(camera.simulatedHlsUrl);

                if (Hls.isSupported()) {
                    const hls = new Hls({
                        // Increase initial load timeout for potentially slow (simulated) streams
                        manifestLoadingTimeOut: 10000, // 10 seconds
                        // More aggressive retry for errors
                        manifestLoadingMaxRetry: 5,
                        manifestLoadingRetryDelay: 1000, // 1 second
                    });
                    hlsRef.current = hls;
                    hls.loadSource(camera.simulatedHlsUrl);
                    hls.attachMedia(videoElement);
                    
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        videoElement.play().then(() => {
                           setPlayerStatus('Online');
                        }).catch(e => {
                           console.warn(`HLS: Video play() promise rejected for ${camera.name}`, e);
                           setPlayerStatus('Error'); // Consider it an error if play is rejected
                        });
                    });

                    hls.on(Hls.Events.ERROR, (event, data) => {
                        console.error(`HLS.js error for ${camera.name}:`, data.type, data.details, data.fatal);
                        if (data.fatal) {
                            switch (data.type) {
                                case Hls.ErrorTypes.NETWORK_ERROR:
                                    console.error('HLS: fatal network error encountered, try to recover');
                                    hls.startLoad(); // or hls.loadSource(camera.simulatedHlsUrl);
                                    setPlayerStatus('Connecting'); // Indicate recovery attempt
                                    break;
                                case Hls.ErrorTypes.MEDIA_ERROR:
                                    console.error('HLS: fatal media error encountered, try to recover');
                                    hls.recoverMediaError();
                                    setPlayerStatus('Connecting');
                                    break;
                                default:
                                    // cannot recover
                                    setPlayerStatus('Error');
                                    cleanupHls(); // Destroy on unrecoverable fatal error
                                    break;
                            }
                        } else {
                            // Non-fatal errors, HLS.js often handles these.
                            // Could update status to 'Connecting' or similar if desired.
                        }
                    });
                } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                    // For Safari native HLS support
                    videoElement.src = camera.simulatedHlsUrl;
                    videoElement.addEventListener('loadedmetadata', () => {
                        videoElement.play().then(() => {
                           setPlayerStatus('Online');
                        }).catch(e => {
                           console.warn(`Native HLS: Video play() promise rejected for ${camera.name}`, e);
                           setPlayerStatus('Error');
                        });
                    });
                     videoElement.addEventListener('error', () => {
                        setPlayerStatus('Error');
                    });
                } else {
                    setPlayerStatus('Error'); // HLS not supported
                    console.error("HLS.js is not supported in this browser, and native HLS playback is also not available.");
                }
            }
        } else { // Camera is Offline or no HLS URL
            cleanupHls();
            setPlayerStatus(camera.status); // Reflect camera's intended status (e.g. Offline)
            setLastAttemptedUrl(null);
        }

        return cleanupHls; // Cleanup on component unmount or when dependencies change

    }, [camera.simulatedHlsUrl, camera.status, camera.name]); // Re-run effect if URL or status changes

    const effectiveStatus = camera.status === 'Online' ? playerStatus : camera.status;
    const statusColor = effectiveStatus === 'Online' ? 'bg-green-500' : 
                        effectiveStatus === 'Offline' ? 'bg-red-500' :
                        effectiveStatus === 'Loading Stream' || effectiveStatus === 'Connecting' ? 'bg-yellow-500' : 'bg-red-700';
    
    return (
        <div className={`aspect-video ${darkMode ? 'bg-black' : 'bg-gray-900'} flex items-center justify-center relative group rounded-md overflow-hidden`}>
            <video ref={videoRef} muted autoPlay playsInline className="w-full h-full object-contain" />
            
            {effectiveStatus !== 'Online' && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-2 ${placeholderIconColor} ${darkMode ? 'bg-black/70' : 'bg-gray-900/70'}`}>
                    {effectiveStatus === 'Loading Stream' && <Icons.Energy className="w-10 h-10 animate-spin text-primary mb-2" />}
                    {effectiveStatus === 'Connecting' && <Icons.Wifi className="w-10 h-10 animate-pulse text-yellow-400 mb-2" />}
                    {(effectiveStatus === 'Error' || effectiveStatus === 'Offline') && <Icons.VideoCameraSlash className="w-10 h-10 text-red-500 mb-2" />}
                    <p className="text-sm font-semibold">
                        {effectiveStatus === 'Loading Stream' ? 'Loading Stream...' :
                         effectiveStatus === 'Connecting' ? 'Reconnecting...' :
                         effectiveStatus === 'Error' ? 'Stream Unavailable (Simulated)' :
                         effectiveStatus === 'Offline' ? 'Camera Offline' : camera.name}
                    </p>
                    {effectiveStatus === 'Error' && <p className="text-xs">Check URL or network. This is simulated.</p>}
                </div>
            )}

            {effectiveStatus === 'Online' && (
             <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow flex items-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-ping absolute opacity-75"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 relative"></span>
                LIVE
             </div>
            )}
            {!isEnlarged && (
                 <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                    {camera.streamType}
                 </div>
            )}
            {!isEnlarged && (
                <button 
                    onClick={() => handleOpenEnlargeModal(camera)} 
                    className="absolute bottom-2 left-2 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Enlarge View"
                    aria-label="Enlarge camera feed"
                >
                    <Icons.Expand className="w-4 h-4" />
                </button>
            )}
             <div className={`absolute bottom-2 ${isEnlarged ? 'left-3' : 'right-2'} text-white text-xs px-2 py-0.5 rounded flex items-center`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${statusColor}`}></span>
                <span>{effectiveStatus}</span>
            </div>
        </div>
    );
  };


  const CameraCard: React.FC<{ camera: IPCamera }> = ({ camera }) => {
    return (
      <div className={`${cardBg} shadow-xl rounded-xl overflow-hidden flex flex-col`}>
        <VideoPlayer camera={camera} />
        <div className="p-4 flex-grow">
          <h3 className={`text-lg font-semibold ${textColor} truncate`} title={camera.name}>{camera.name}</h3>
          <p className={`${subTextColor} text-sm truncate`} title={camera.ipAddress}>
            {camera.customRtspUrl ? camera.customRtspUrl : `${camera.ipAddress}:${camera.port} (Ch: ${camera.cameraChannel})`}
          </p>
          {camera.locationTag && (
            <div className={`flex items-center text-xs mt-1 ${subTextColor}`}>
              <Icons.LocationMarker className="w-3 h-3 mr-1" />
              <span>{camera.locationTag}</span>
            </div>
          )}
           <div className={`text-xs mt-1.5 ${subTextColor}`}>
            Motion: {camera.motionDetectionSimulated ? <span className="text-green-500 font-semibold">Active</span> : 'Inactive'} (Simulated)
          </div>
        </div>
        <div className={`p-2 border-t ${borderColor} flex justify-around items-center`}>
            <button onClick={() => handleSnapshot(camera.name)} className={`p-1.5 rounded-full ${buttonHoverBg} ${subTextColor} hover:text-primary`} title="Take Snapshot">
                <Icons.Camera className="w-5 h-5"/>
            </button>
            <button onClick={() => toggleRecording(camera.id)} className={`p-1.5 rounded-full ${buttonHoverBg} ${subTextColor} ${camera.isRecordingSimulated ? 'text-red-500' : 'hover:text-primary'}`} title={camera.isRecordingSimulated ? "Stop Recording" : "Start Recording"}>
                {camera.isRecordingSimulated ? <Icons.RecordOn className="w-5 h-5" /> : <Icons.RecordOff className="w-5 h-5" />}
            </button>
             <button 
                onClick={() => toggleMotionDetection(camera.id)} 
                className={`p-1.5 rounded-full ${buttonHoverBg} ${subTextColor} ${camera.motionDetectionSimulated ? 'text-green-500' : 'hover:text-primary'}`}
                title={camera.motionDetectionSimulated ? 'Disable Motion Detection' : 'Enable Motion Detection'}
            >
                <Icons.Eye className="w-5 h-5" />
            </button>
            <button onClick={() => toggleCameraStatus(camera.id)} className={`p-1.5 rounded-full ${buttonHoverBg} ${subTextColor} ${camera.status === 'Online' ? 'text-yellow-500 hover:text-yellow-400' : 'text-green-500 hover:text-green-400'}`} title={camera.status === 'Online' ? "Set Offline" : "Set Online"}>
                 {camera.status === 'Online' ? <Icons.VideoCameraSlash className="w-5 h-5"/> : <Icons.VideoCamera className="w-5 h-5"/>}
            </button>
          <button onClick={() => handleOpenModal(camera)} className={`p-1.5 rounded-full ${buttonHoverBg} ${subTextColor} hover:text-primary`} aria-label="Edit IP Camera">
            <Icons.Pencil className="w-5 h-5"/>
          </button>
          <button onClick={() => handleDeleteCamera(camera.id)} className={`p-1.5 rounded-full ${buttonHoverBg} ${subTextColor} hover:text-red-500`} aria-label="Delete IP Camera">
            <Icons.Trash className="w-5 h-5"/>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className={`text-3xl font-semibold ${textColor}`}>IP Camera Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-secondary font-semibold rounded-lg hover:bg-yellow-300 transition-colors flex items-center shadow hover:shadow-md"
        >
          <Icons.PlusCircle className="w-5 h-5 mr-2" /> Add IP Camera
        </button>
      </div>

      {ipCameras.length === 0 && !isLoading ? (
        <div className={`${cardBg} p-8 rounded-xl shadow-lg text-center ${subTextColor}`}>
          <Icons.NetworkCamera className="w-16 h-16 mx-auto mb-4 opacity-50"/>
          <p className="text-xl">No IP Cameras Configured</p>
          <p>Click "Add IP Camera" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"> {/* Max 3 for better video visibility */}
          {ipCameras.map(camera => <CameraCard key={camera.id} camera={camera} />)}
        </div>
      )}
       {ipCameras.length > 0 && (
         <div className={`${cardBg} p-4 rounded-xl shadow-lg mt-8`}>
            <p className={`${subTextColor} text-sm`}>
                <strong>Note:</strong> Live HLS streams are simulated. Real RTSP to HLS conversion needs a backend (e.g., FFmpeg). 
                Playback may show errors for simulated URLs. This interface demonstrates frontend HLS.js integration.
            </p>
         </div>
       )}

      {/* Add/Edit IP Camera Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex items-center justify-center p-4 z-[1000] transition-opacity duration-300" onClick={handleCloseModal}>
          <div className={`${cardBg} ${textColor} p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold">{editingCamera ? 'Edit IP Camera' : 'Add New IP Camera'}</h3>
                <button onClick={handleCloseModal} className={`p-1 rounded-full ${buttonHoverBg}`} aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Camera Name*</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required 
                       className={`w-full p-2.5 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="ipAddress" className="block text-sm font-medium mb-1">DVR IP/Hostname*</label>
                  <input type="text" name="ipAddress" id="ipAddress" value={formData.ipAddress} onChange={handleInputChange} required placeholder="e.g., 192.168.1.100"
                         className={`w-full p-2.5 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
                <div>
                  <label htmlFor="port" className="block text-sm font-medium mb-1">DVR RTSP Port*</label>
                  <input type="number" name="port" id="port" value={formData.port} onChange={handleInputChange} required min="1" max="65535"
                         className={`w-full p-2.5 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
                 <div>
                  <label htmlFor="cameraChannel" className="block text-sm font-medium mb-1">Camera Channel*</label>
                  <input type="number" name="cameraChannel" id="cameraChannel" value={formData.cameraChannel} onChange={handleInputChange} required min="1"
                         className={`w-full p-2.5 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-1">DVR Username (Opt)</label>
                  <input type="text" name="username" id="username" value={formData.username} onChange={handleInputChange} 
                         className={`w-full p-2.5 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">DVR Password (Opt)</label>
                  <input type="password" name="password" id="password" value={formData.password} onChange={handleInputChange} 
                         className={`w-full p-2.5 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`} />
                </div>
              </div>
              
              <div>
                <label htmlFor="streamType" className="block text-sm font-medium mb-1">Stream Type (for RTSP path construction)</label>
                <select name="streamType" id="streamType" value={formData.streamType} onChange={handleInputChange}
                        className={`w-full p-2.5 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`}>
                  {STREAM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="customRtspUrl" className="block text-sm font-medium mb-1">Full Custom RTSP URL (Optional - overrides auto-generated URL)</label>
                <input type="text" name="customRtspUrl" id="customRtspUrl" value={formData.customRtspUrl} onChange={handleInputChange} placeholder="e.g., rtsp://user:pass@host:port/path"
                        className={`w-full p-2.5 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`} />
              </div>
              
              <div>
                <label htmlFor="locationTag" className="block text-sm font-medium mb-1">Location Tag (Optional)</label>
                <input type="text" name="locationTag" id="locationTag" value={formData.locationTag} onChange={handleInputChange} placeholder="e.g., Lobby, Parking Lot Zone A"
                       className={`w-full p-2.5 border ${borderColor} rounded-lg ${inputBg} focus:ring-2 focus:ring-primary outline-none`} />
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={handleCloseModal} disabled={isLoading}
                        className={`px-5 py-2.5 rounded-lg border ${darkMode ? 'border-gray-500 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'} transition-colors disabled:opacity-50`}>
                  Cancel
                </button>
                <button type="submit" disabled={isLoading}
                        className="px-5 py-2.5 bg-primary text-secondary font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <Icons.Energy className="w-5 h-5 mr-2 animate-spin" />
                      {editingCamera ? 'Saving...' : 'Adding...'}
                    </>
                  ) : (
                    editingCamera ? 'Save Changes' : 'Add IP Camera'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enlarge Camera View Modal */}
      {showEnlargeModal && enlargedCamera && (
         <div className="fixed inset-0 bg-black bg-opacity-80 dark:bg-opacity-90 flex items-center justify-center p-4 z-[1001] transition-opacity duration-300" onClick={handleCloseEnlargeModal}>
            <div 
                className={`${cardBg} ${textColor} p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-2xl md:max-w-3xl lg:max-w-4xl transform transition-all duration-300 scale-100 opacity-100 flex flex-col max-h-[90vh]`} 
                onClick={e => e.stopPropagation()}
            >
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl sm:text-2xl font-semibold truncate" title={enlargedCamera.name}>{enlargedCamera.name}</h3>
                    <button onClick={handleCloseEnlargeModal} className={`p-1 rounded-full ${buttonHoverBg}`} aria-label="Close enlarged view">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <VideoPlayer camera={enlargedCamera} isEnlarged={true} />
                <div className="text-sm space-y-1 overflow-y-auto mt-4">
                    <p><strong className="min-w-[120px] inline-block">Location:</strong> {enlargedCamera.locationTag || 'N/A'}</p>
                    <p><strong className="min-w-[120px] inline-block">DVR IP:</strong> {enlargedCamera.ipAddress}:{enlargedCamera.port}</p>
                    <p><strong className="min-w-[120px] inline-block">Channel:</strong> {enlargedCamera.cameraChannel}</p>
                    <p><strong className="min-w-[120px] inline-block">Custom URL:</strong> {enlargedCamera.customRtspUrl || 'Not set'}</p>
                    <p><strong className="min-w-[120px] inline-block">Motion:</strong> {enlargedCamera.motionDetectionSimulated ? 'Active' : 'Inactive'} (Simulated)</p>
                    <p><strong className="min-w-[120px] inline-block">Recording:</strong> {enlargedCamera.isRecordingSimulated ? 'Active' : 'Inactive'} (Simulated)</p>
                    <p className={`text-xs ${subTextColor} mt-2 break-all`}>Simulated HLS URL: {enlargedCamera.simulatedHlsUrl}</p>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default IPCameraPage;
