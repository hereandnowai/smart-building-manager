
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Icons } from '../constants';
import { DarkModeContext } from '../App';

const LiveCameraFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPlaybackStarted, setHasPlaybackStarted] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);
  const darkModeContext = useContext(DarkModeContext);

  // Effect for acquiring and cleaning up the camera stream
  useEffect(() => {
    let acquiredStream: MediaStream | null = null; // To hold the stream for cleanup

    const acquireStream = async () => {
      setIsLoadingStream(true);
      setError(null);
      setHasPlaybackStarted(false);
      setCurrentStream(null); // Clear previous stream from state

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access (getUserMedia) is not supported by your browser.');
        }
        acquiredStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCurrentStream(acquiredStream); // Set stream in state for other effects
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setError("Camera permission denied. Please enable camera access in your browser's site settings and try again. You may need to reload the page after granting permission.");
          } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            setError("No camera found on this device. Please ensure a camera is connected and enabled.");
          } else {
            setError(`Error accessing camera: ${err.message}. Please try again.`);
          }
        } else {
          setError("An unknown error occurred while accessing the camera. Please try again.");
        }
        setCurrentStream(null); // Ensure stream state is null on error
      } finally {
        setIsLoadingStream(false);
      }
    };

    acquireStream();

    return () => { // Cleanup function for this effect
      if (acquiredStream) {
        acquiredStream.getTracks().forEach(track => track.stop());
      }
      // Reset states related to a specific stream attempt
      setCurrentStream(null);
      setHasPlaybackStarted(false);
    };
  }, [retryCount]); // Re-run when retryCount changes

  // Effect to manage the video element and its 'playing' event
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && currentStream) {
      if (videoElement.srcObject !== currentStream) { // Avoid unnecessary re-assignments
        videoElement.srcObject = currentStream;
      }
      
      const handlePlaying = () => {
        setHasPlaybackStarted(true);
      };

      videoElement.addEventListener('playing', handlePlaying);
      // It's good practice to ensure video is played if autoplay doesn't kick in,
      // though modern browsers are good with autoplay on muted videos.
      videoElement.play().catch(playError => {
        // Autoplay was prevented. This can happen for various reasons.
        // User interaction might be required if not muted.
        // console.warn("Video play() was prevented:", playError);
        // We could set an error state here or provide a play button.
        // For now, rely on autoplay with muted.
      });

      return () => {
        videoElement.removeEventListener('playing', handlePlaying);
        // Optionally, pause and remove srcObject if the stream is being replaced/stopped
        // videoElement.pause();
        // videoElement.srcObject = null; // Covered by the main stream effect's cleanup
      };
    } else {
      // If no stream or no video element, ensure playback status is false
      setHasPlaybackStarted(false);
    }
  }, [currentStream]); // Re-run if the currentStream state changes

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (!darkModeContext) return null;
  const { darkMode } = darkModeContext;
  const bgColor = darkMode ? 'bg-gray-700' : 'bg-gray-300';
  const textColor = darkMode ? 'text-gray-300' : 'text-gray-400';
  const iconColor = darkMode ? 'text-primary' : 'text-secondary';
  const errorBgColor = darkMode ? 'bg-red-900/[.7]' : 'bg-red-100/[.7]';
  const errorTextColor = darkMode ? 'text-red-200' : 'text-red-700';
  const errorBorderColor = darkMode ? 'border-red-700' : 'border-red-400';

  if (isLoadingStream) {
    return (
      <div className={`aspect-video ${bgColor} rounded-lg flex flex-col items-center justify-center ${textColor}`}>
        <Icons.VideoCamera className={`w-16 h-16 ${iconColor} animate-pulse mb-2`} />
        <p className="font-semibold">Status: Accessing Camera</p>
        <p>Please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`aspect-video ${bgColor} ${errorBgColor} border-2 ${errorBorderColor} rounded-lg flex flex-col items-center justify-center p-4 text-center ${errorTextColor}`}>
        <Icons.VideoCameraSlash className={`w-16 h-16 ${darkMode ? 'text-red-400' : 'text-red-500'} mb-2`} />
        <p className="font-bold text-lg">Camera Error</p>
        <p className="text-sm mb-3">{error}</p>
        <button 
            onClick={handleRetry} 
            className={`mt-2 px-4 py-2 rounded font-semibold transition-colors
                        ${darkMode ? 'bg-primary text-secondary hover:bg-yellow-300' 
                                   : `bg-secondary text-white hover:bg-teal-700`}`}
        >
            Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`aspect-video ${bgColor} rounded-lg overflow-hidden relative shadow-md`}>
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      {currentStream && hasPlaybackStarted && (
        <>
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow flex items-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-ping absolute opacity-75"></span>
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 relative"></span>
            LIVE
          </div>
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            Feed 1 (Device Camera)
          </div>
        </>
      )}
      {!hasPlaybackStarted && currentStream && !isLoadingStream && !error && (
         <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <p className="text-white text-sm">Attempting to start video...</p>
         </div>
      )}
    </div>
  );
};

export default LiveCameraFeed;
