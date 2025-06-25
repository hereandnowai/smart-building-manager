export interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'caramel';
  text: string;
  timestamp: Date;
}

export interface EnergyData {
  timestamp: string;
  usage: number; // kWh
  prediction?: number; // kWh
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'Entry' | 'Exit' | 'Anomaly' | 'Alert';
  description: string;
  severity?: 'Low' | 'Medium' | 'High';
}

export interface ComfortSettings {
  temperature: number; // Celsius
  lightingLevel: number; // Percentage
  airQuality: {
    co2: number; // ppm
    humidity: number; // Percentage
    voc: number; // Index
  };
}

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface ScheduleItem {
  id: string;
  name: string;
  targetDevice: 'Temperature' | 'Lighting' | 'HVAC';
  targetValue: string; // e.g., "22°C", "75%", "On"
  time: string; // HH:MM format
  days: DayOfWeek[];
  isActive: boolean;
}

export type IPCameraStreamType = 'RTSP' | 'MJPEG';
export type IPCameraStatus = 'Online' | 'Offline' | 'Connecting' | 'Error' | 'Loading Stream';

export interface IPCamera {
  id: string;
  name: string;
  ipAddress: string; // DVR IP or Hostname
  port: number; // DVR RTSP Port
  cameraChannel?: number; // Camera channel number on DVR
  username?: string;
  password?: string; 
  streamType: IPCameraStreamType; // Used for RTSP URL construction if not custom
  customRtspUrl?: string; // Full RTSP URL, overrides auto-generation
  locationTag?: string;
  status: IPCameraStatus;
  simulatedHlsUrl: string; // Mandatory for playback attempt
  lastChecked?: string;
  motionDetectionSimulated: boolean;
  isRecordingSimulated: boolean;
}

export enum Page {
  Home = 'Home',
  Dashboard = 'Dashboard',
  Energy = 'Energy Management',
  Security = 'Security Monitoring',
  Comfort = 'Occupant Comfort',
  Schedules = 'Manage Schedules',
  IPCameraManagement = 'IP Cameras',
  About = 'About Us',
}