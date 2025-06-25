
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { BRANDING, Icons } from '../constants';
import { ChatMessage } from '../types';
import { getChatbotResponse } from '../services/aiService';
import { DarkModeContext } from '../App';


const CaramelAIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const darkModeContext = useContext(DarkModeContext);


  useEffect(() => {
    if (isOpen && chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Initial greeting from Caramel AI when chat opens for the first time
    useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'caramel-greeting',
          sender: 'caramel',
          text: "Hello! I'm Caramel AI, your Smart Building assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);


  const handleSendMessage = useCallback(async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponseText = await getChatbotResponse(inputValue, messages);
      const botMessage: ChatMessage = {
        id: `caramel-${Date.now()}`,
        sender: 'caramel',
        text: botResponseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'caramel',
        text: "Sorry, I couldn't connect to the AI service. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages]);


  if (!darkModeContext) return null; // Should not happen if context is provided
  const { darkMode } = darkModeContext;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 bg-primary text-secondary p-4 rounded-full shadow-xl hover:bg-yellow-300 transition-transform duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500 z-[1000]`}
        aria-label="Toggle Caramel AI Chat"
      >
        <Icons.Chat className="w-8 h-8" />
      </button>

      {isOpen && (
        <div className={`fixed bottom-24 right-6 w-80 md:w-96 h-[30rem] md:h-[32rem] bg-white dark:bg-gray-800 shadow-2xl rounded-lg flex flex-col transition-all duration-300 ease-out z-[999] border border-gray-300 dark:border-gray-700`}>
          <header className="bg-secondary dark:bg-gray-700 text-white p-3 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center">
              <img src={BRANDING.CARAMEL_AI_DP_URL} alt="Caramel AI DP" className="w-8 h-8 rounded-full mr-2 border-2 border-primary" />
              <h3 className="font-semibold text-lg">Caramel AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300" aria-label="Close chat">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div ref={chatBoxRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-800">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'caramel' && <img src={BRANDING.CARAMEL_AI_FACE_URL} alt="Caramel Face" className="w-8 h-8 rounded-full mr-2 self-end"/>}
                <div
                  className={`max-w-[70%] p-3 rounded-xl shadow ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-secondary rounded-br-none' 
                      : `bg-gray-200 dark:bg-gray-700 ${darkMode ? 'text-gray-100' : 'text-gray-900'} rounded-bl-none`
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-secondary/70' : darkMode ? 'text-gray-400' : 'text-gray-500'} text-right`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                 {msg.sender === 'user' && <Icons.User className="w-8 h-8 rounded-full ml-2 self-end text-secondary dark:text-primary"/>}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <img src={BRANDING.CARAMEL_AI_FACE_URL} alt="Caramel Face" className="w-8 h-8 rounded-full mr-2 self-end"/>
                <div className={`max-w-[70%] p-3 rounded-xl shadow bg-gray-200 dark:bg-gray-700 ${darkMode ? 'text-gray-100' : 'text-gray-900'} rounded-bl-none`}>
                  <p className="text-sm italic">Caramel is typing...</p>
                </div>
              </div>
            )}
          </div>

          <footer className="p-3 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-b-lg">
            <div className="flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Caramel..."
                className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || inputValue.trim() === ''}
                className="ml-2 p-2 bg-primary text-secondary rounded-lg hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default CaramelAIChatWidget;
