
import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import { GEMINI_TEXT_MODEL } from '../constants';
import { ChatMessage } from "../types";

// Initialize GoogleGenAI.
// As per guidelines, process.env.API_KEY is assumed to be pre-configured, valid, and accessible.
// If process.env.API_KEY is not set, the SDK constructor or subsequent calls will likely fail.
// This is an environmental setup requirement.
let ai: GoogleGenAI;
let chatInitializationAttempted = false;
let globalChatInstance: Chat | null = null;
let servicesOperational = true;

try {
    // This will throw an error if process.env.API_KEY is not a string or is empty,
    // or if `process` or `process.env` is not defined.
    // The guidelines assume `process.env.API_KEY` is a valid string.
    if (typeof process === 'undefined' || typeof process.env === 'undefined' || !process.env.API_KEY || typeof process.env.API_KEY !== 'string') {
        throw new Error("API_KEY is not available in process.env or is not a string.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
    console.error(
        "Fatal Error: Failed to initialize GoogleGenAI. " +
        "This is likely due to `process.env.API_KEY` not being set or invalid. " +
        "AI features will be unavailable. Please ensure the API_KEY environment variable is correctly configured. Error: ",
        error
    );
    servicesOperational = false;
    // @ts-ignore
    // To allow the rest of the app to load without crashing,
    // we assign a stub `ai` object if initialization fails.
    // Calls to its methods will be guarded by `servicesOperational`.
    ai = {
        models: {
            generateContent: async () => Promise.reject(new Error("AI Service not operational")),
            generateImages: async () => Promise.reject(new Error("AI Service not operational")),
            generateContentStream: async () => { throw new Error("AI Service not operational"); }
        },
        chats: {
             create: () => { throw new Error("AI Service not operational"); }
        }
    } as unknown as GoogleGenAI; // Type assertion for stub
}


const getChatInstance = (): Chat => {
  if (!servicesOperational) {
      throw new Error("AI Service not operational, cannot create chat instance.");
  }
  if (!globalChatInstance && !chatInitializationAttempted) {
    chatInitializationAttempted = true; // Attempt only once
    try {
        globalChatInstance = ai.chats.create({
          model: GEMINI_TEXT_MODEL,
          config: {
            systemInstruction: `You are Caramel AI, a helpful and friendly assistant for the Smart Building Manager application by HERE AND NOW AI. 
            Your goal is to assist users with optimizing energy, enhancing security, and improving comfort. 
            Be concise and helpful. When asked about specific building data, you can state that you don't have direct access to real-time data but can provide general advice or process information given to you.
            If a user asks for complex calculations or data you don't have, politely decline or offer to help with what you can do.
            Remember the company is HERE AND NOW AI - Artificial Intelligence Research Institute (hereandnowai.com).`,
          },
          history: [
            {
              role: "user",
              parts: [{ text: "Hello Caramel AI!" }],
            },
            {
              role: "model",
              parts: [{ text: "Hello! I am Caramel AI, your Smart Building assistant. How can I help you today?" }],
            },
          ]
        });
    } catch (error) {
        console.error("Failed to create chat instance:", error);
        globalChatInstance = null; // Ensure it's null if creation failed
        throw error; // Re-throw to be caught by the caller
    }
  }
  if (!globalChatInstance) {
      throw new Error("Chat instance could not be initialized.");
  }
  return globalChatInstance;
};

export const getEnergySavingRecommendations = async (currentUsageDescription: string): Promise<string> => {
  if (!servicesOperational) return "AI features are currently unavailable due to a configuration issue.";
  try {
    const prompt = `
      As an AI energy optimization expert for smart buildings, provide 3-5 concise and actionable energy-saving recommendations 
      based on the following energy usage pattern:
      "${currentUsageDescription}"
      
      Focus on practical tips related to lighting, HVAC, and appliance usage.
      Format the recommendations as a bulleted list.
    `;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting energy recommendations:", error);
    return "Sorry, I couldn't generate recommendations at this time. Please try again later.";
  }
};

export const getChatbotResponse = async (userMessage: string, chatHistory: ChatMessage[]): Promise<string> => {
  if (!servicesOperational) return "AI features are currently unavailable due to a configuration issue.";
  try {
    const chat = getChatInstance(); // This might throw if chat cannot be initialized
    const result: GenerateContentResponse = await chat.sendMessage({ message: userMessage });
    return result.text;
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) { // This specific check might change based on actual SDK errors
        return "There's an issue with the AI service configuration. Please contact support.";
    }
    return "I'm having a little trouble thinking right now. Could you try asking again?";
  }
};

export const analyzeSecurityEvent = async (eventDescription: string): Promise<string> => {
    if (!servicesOperational) return "AI analysis unavailable due to a configuration issue.";
    try {
        const prompt = `
        Analyze the following security event description from a smart building and provide a brief assessment (2-3 sentences), 
        suggesting a potential severity level (Low, Medium, High) and one recommended action:
        Event: "${eventDescription}"
        
        Example format:
        Assessment: Brief analysis of the event.
        Severity: Suggested severity.
        Action: Recommended next step.
        `;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing security event:", error);
        return "Could not analyze the event at this time.";
    }
};

export const getComfortOptimizationTip = async (currentComfortData: string): Promise<string> => {
    if (!servicesOperational) return "AI tips unavailable due to a configuration issue.";
    try {
        const prompt = `
        Given the current building comfort data: "${currentComfortData}", 
        provide one concise tip to optimize occupant comfort or air quality.
        The tip should be practical and easy to implement.
        `;
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_TEXT_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting comfort tip:", error);
        return "Could not generate a comfort tip at this time.";
    }
};

// Mock API service for other data
export const mockApiService = {
  getDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return {
      totalEnergySaved: Math.floor(Math.random() * 1000) + 500, // kWh
      activeAlerts: Math.floor(Math.random() * 5),
      occupancyRate: Math.floor(Math.random() * 60) + 40, // %
      overallComfortScore: Math.floor(Math.random() * 30) + 70, // %
    };
  },
  getEnergyData: async (): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { time: "00:00", usage: Math.random() * 10, prediction: Math.random() * 10 + 2 },
      { time: "03:00", usage: Math.random() * 8, prediction: Math.random() * 8 + 1 },
      { time: "06:00", usage: Math.random() * 12, prediction: Math.random() * 12 + 3 },
      { time: "09:00", usage: Math.random() * 20, prediction: Math.random() * 20 + 5 },
      { time: "12:00", usage: Math.random() * 25, prediction: Math.random() * 25 + 4 },
      { time: "15:00", usage: Math.random() * 22, prediction: Math.random() * 22 + 3 },
      { time: "18:00", usage: Math.random() * 18, prediction: Math.random() * 18 + 2 },
      { time: "21:00", usage: Math.random() * 15, prediction: Math.random() * 15 + 1 },
    ];
  },
  getSecurityLogs: async (): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: "S001", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "Entry", description: "User John Doe entered Zone A." },
      { id: "S002", timestamp: new Date(Date.now() - 1800000).toISOString(), type: "Anomaly", description: "Unusual motion detected near West Entrance after hours.", severity: "Medium" },
      { id: "S003", timestamp: new Date(Date.now() - 600000).toISOString(), type: "Alert", description: "Fire alarm triggered in Kitchen Area.", severity: "High" },
    ];
  },
   getComfortReadings: async (): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      temperature: Math.floor(Math.random() * 5) + 20, // 20-24 C
      lightingLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
      airQuality: {
        co2: Math.floor(Math.random() * 400) + 400, // 400-800 ppm
        humidity: Math.floor(Math.random() * 20) + 40, // 40-60%
        voc: parseFloat((Math.random() * 0.5).toFixed(2)), // 0-0.5 Index
      },
    };
  }
};
