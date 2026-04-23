import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  User, 
  Bot,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Expand,
  Scale,
  BookOpen,
  Gavel,
  Shield,
  FileText,
  Users,
  Star
} from 'lucide-react';
import './ChatbotImproved.css';

const ChatbotEnhanced = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [userInfo, setUserInfo] = useState(null);
  const [suggestions, setSuggestions] = useState([
    'Legal news',
    'File a case',
    'Legal sections',
    'Platform help'
  ]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const quickActions = [
    { text: "Evidence Upload", query: "how to upload evidence" },
    { text: "Latest News", query: "latest legal news" },
    { text: "Search Laws", query: "search legal sections" },
    { text: "Account Help", query: "my account information" },
    { text: "Support", query: "contact support" },
    { text: "Court Updates", query: "court updates today" }
  ];
  
  const API_BASE_URL = 'http://localhost:5000/api';
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchUserInfo = useCallback(async () => {
    if (hasInitialized) return;
    
    try {
      setConnectionStatus('connecting');
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        setConnectionStatus('disconnected');
        return;
      }

      // Parse user data from localStorage instead of API call
      const user = JSON.parse(userData);
      setUserInfo(user);
      setConnectionStatus('connected');
      setHasInitialized(true);
      
      if (messages.length === 0) {
        const welcomeMessage = {
          id: Date.now(),
          type: 'bot',
          content: `Hello ${user.username || user.name || 'there'}! I'm your LegalVault AI Assistant.

I can help you with:
• Legal sections and explanations
• Current legal news
• Platform navigation
• General legal guidance

How can I assist you today?`,
          intent: 'welcome',
          suggestions: user.role === 'admin' ? [
            'Latest legal news',
            'User management help',
            'System status',
            'Platform analytics'
          ] : user.role === 'lawyer' ? [
            'Legal sections',
            'Case management',
            'Legal research',
            'Client tools'
          ] : [
            'Legal news',
            'File a case',
            'Legal rights',
            'Platform help'
          ],
          isWelcome: true,
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      setConnectionStatus('error');
      console.error('Error initializing chatbot:', error);
    }
  }, [hasInitialized, messages.length]);

  useEffect(() => {
    if (isOpen && !userInfo) {
      fetchUserInfo();
    }
  }, [isOpen, userInfo, fetchUserInfo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingIndicator, scrollToBottom]);

  useEffect(() => {
    const checkConnection = () => {
      setConnectionStatus(navigator.onLine ? 'connected' : 'error');
    };

    checkConnection();
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  // Location sharing functionality
  const [userLocation, setUserLocation] = useState(null);
  const [_locationPermission, setLocationPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'

  const requestUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          setUserLocation(location);
          setLocationPermission('granted');
          resolve(location);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationPermission('denied');
          reject(error);
        },
        options
      );
    });
  };

  const handleLocationShare = async () => {
    try {
      setIsLoading(true);
      const location = await requestUserLocation();
      
      // Send location-enabled message
      const locationMessage = `📍 Location shared successfully! Finding nearby courts and police stations...`;
      
      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: locationMessage,
        timestamp: new Date(),
        location: location
      };

      setMessages(prev => [...prev, userMessage]);
      
      // Send the original location query with coordinates
      const lastMessage = messages[messages.length - 1];
      const originalQuery = lastMessage?.additionalData?.originalMessage || 'court near me';
      
      await sendMessageWithLocation(originalQuery, location);
      
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.code === 1 ? 'Location access denied. Please enable location services.' :
                      error.code === 2 ? 'Location information unavailable.' :
                      error.code === 3 ? 'Location request timeout.' :
                      'Could not get your location. Please try again.';
      
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: `❌ ${errorMsg}

**Alternative options:**
• Type your city name (e.g., "courts in Mumbai")
• Use area/landmark (e.g., "police in Connaught Place")
• Browse emergency contacts without location`,
        isError: true,
        suggestions: ['Courts in Mumbai', 'Police in Delhi', 'Emergency contacts', 'Legal helplines'],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const sendMessageWithLocation = async (messageText, location = null) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        message: messageText.trim(),
        userLocation: location || userLocation,
        context: { 
          timestamp: new Date().toISOString(),
          conversationLength: messages.length,
          hasLocation: !!(location || userLocation)
        }
      })
    });

    return response;
  };

  const sendMessage = async (messageText = inputMessage, customLocation = null) => {
    if (!messageText.trim() || isLoading) return;

    // Check if this is a location sharing request
    if (messageText.includes('Share my location') || messageText.includes('🌍 Share my location')) {
      await handleLocationShare();
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setTypingIndicator(true);
    setShowQuickActions(false);

    try {
      const response = customLocation ? 
        await sendMessageWithLocation(messageText, customLocation) :
        userLocation ? 
        await sendMessageWithLocation(messageText) :
        await fetch(`${API_BASE_URL}/chatbot/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            message: messageText.trim(),
            context: { 
              timestamp: new Date().toISOString(),
              conversationLength: messages.length
            }
          })
        });

      if (response.ok) {
        const data = await response.json();
        
        const typingDelay = Math.min(2000, Math.max(800, data.response.length * 8));
        
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            type: 'bot',
            content: data.response,
            intent: data.intent,
            suggestions: data.suggestions,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botMessage]);
          setTypingIndicator(false);
          setIsLoading(false);
          
          if (data.suggestions && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
          }
        }, typingDelay);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      setTypingIndicator(false);
      setIsLoading(false);
      setConnectionStatus('error');
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm having trouble connecting right now. Please check your internet connection and try again.",
        isError: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error sending message:', error);
    }
  };

  const handleMessageReaction = (messageId, reaction) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
        : msg
    ));
  };

  const copyMessageToClipboard = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setShowQuickActions(true);
    setHasInitialized(false);
    if (userInfo) {
      fetchUserInfo();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderConnectionStatus = () => {
    const statusConfig = {
      connected: { icon: CheckCircle, color: 'text-green-400', text: 'Connected' },
      connecting: { icon: RefreshCw, color: 'text-yellow-400', text: 'Connecting...' },
      disconnected: { icon: RefreshCw, color: 'text-gray-400', text: 'Disconnected' },
      error: { icon: AlertCircle, color: 'text-red-400', text: 'Connection Error' }
    };

    const config = statusConfig[connectionStatus];
    const StatusIcon = config.icon;

    return (
      <div className={`flex items-center space-x-1 text-xs ${config.color}`}>
        <StatusIcon size={12} className={connectionStatus === 'connecting' ? 'animate-spin' : ''} />
        <span>{config.text}</span>
      </div>
    );
  };

  const renderTypingIndicator = () => (
    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl mx-4 mb-4">
      <div className="w-8 h-8 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
        <Bot size={16} className="text-white" />
      </div>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-slate-500 rounded-full typing-dot"></div>
        <div className="w-2 h-2 bg-slate-600 rounded-full typing-dot"></div>
        <div className="w-2 h-2 bg-slate-500 rounded-full typing-dot"></div>
      </div>
      <span className="text-sm text-slate-600 font-medium">AI is thinking...</span>
    </div>
  );

  const renderMessage = (message) => {
    const isBot = message.type === 'bot';
    const isWelcome = message.isWelcome;
    const isError = message.isError;

    return (
      <div key={message.id} className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-6 px-4`}>
        <div className={`flex ${isBot ? 'flex-row' : 'flex-row-reverse'} items-start space-x-3 max-w-[85%]`}>
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            isBot 
              ? 'bg-gradient-to-r from-slate-700 to-slate-800' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          } text-white ring-2 ring-white/20`}>
            {isBot ? <Bot size={18} /> : <User size={18} />}
          </div>
          
          <div className={`message-container relative group max-w-full`}>
            <div className={`p-4 rounded-2xl shadow-lg transition-all duration-200 ${
              isBot 
                ? isWelcome 
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-slate-500/25' 
                  : isError
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-white text-slate-800 border border-slate-200'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25'
            }`}>
              {message.intent && (
                <div className="inline-block px-2 py-1 mb-2 text-xs font-semibold rounded-full bg-white bg-opacity-20 text-white">
                  {message.intent}
                </div>
              )}
              
              <div className="prose prose-sm max-w-none">
                {message.content.split('\n').map((line, index) => {
                  // Clean up markdown symbols
                  let cleanLine = line
                    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** bold markers
                    .replace(/\*(.*?)\*/g, '$1')     // Remove * italic markers
                    .replace(/^#+\s/, '')            // Remove # headers
                    .trim();
                  
                  // Skip empty lines
                  if (!cleanLine) {
                    return <div key={index} className="h-2"></div>;
                  }
                  
                  // Handle emojis and clean them out
                  cleanLine = cleanLine
                    .replace(/📰|⚖️|🏛️|📰|💡|📅|🔗|📋|📚|⚡|🌐|🗄️|📊/g, '')
                    .trim();
                  
                  // Handle main section headers (all caps or starts with emoji space)
                  if ((cleanLine === cleanLine.toUpperCase() && cleanLine.length > 10) || 
                      cleanLine.match(/^(LATEST|USER|SYSTEM|SUPREME|SEARCH|RECENT)/)) {
                    return (
                      <h2 key={index} className={`font-bold text-lg mb-3 mt-4 ${isWelcome || !isBot ? 'text-white border-b border-white border-opacity-30' : 'text-slate-900 border-b border-slate-300'} pb-2`}>
                        {cleanLine}
                      </h2>
                    );
                  }
                  
                  // Handle subsection headers (contains colon or Updated:)
                  if ((cleanLine.includes(':') && cleanLine.length < 60) || cleanLine.includes('Updated:')) {
                    return (
                      <h3 key={index} className={`font-semibold text-base mt-3 mb-2 ${isWelcome || !isBot ? 'text-blue-100' : 'text-slate-800'}`}>
                        {cleanLine}
                      </h3>
                    );
                  }
                  
                  // Handle separator lines
                  if (line.includes('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')) {
                    return <hr key={index} className="my-4 border-gray-300 border-t-2" />;
                  }
                  
                  // Handle numbered news headlines
                  if (cleanLine.match(/^\d+\.\s/)) {
                    const title = cleanLine.replace(/^\d+\.\s/, '');
                    const number = cleanLine.match(/^\d+/)[0];
                    return (
                      <div key={index} className="mt-4 mb-2">
                        <h4 className={`font-semibold text-base ${isWelcome || !isBot ? 'text-blue-100' : 'text-slate-900'} flex items-start gap-2`}>
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${isWelcome || !isBot ? 'bg-white bg-opacity-20 text-white' : 'bg-slate-100 text-slate-800'}`}>
                            {number}
                          </span>
                          {title}
                        </h4>
                      </div>
                    );
                  }
                  
                  // Handle source/date lines
                  if (cleanLine.includes('|') && (cleanLine.includes('Source:') || cleanLine.match(/\d{2}\/\d{2}\/\d{4}/))) {
                    return (
                      <p key={index} className={`text-sm mb-2 italic ${isWelcome || !isBot ? 'text-blue-200' : 'text-slate-600'}`}>
                        📅 {cleanLine}
                      </p>
                    );
                  }
                  
                  // Handle links - extract URLs and create proper buttons
                  if (cleanLine.includes('[Read Full Article]') && cleanLine.includes('(http')) {
                    const urlMatch = cleanLine.match(/\(https?:\/\/[^)]+\)/);
                    if (urlMatch) {
                      const url = urlMatch[0].slice(1, -1); // Remove parentheses
                      return (
                        <div key={index} className="mb-3">
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                              isWelcome || !isBot 
                                ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 border border-white border-opacity-30' 
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Read Full Article
                          </a>
                        </div>
                      );
                    }
                  }
                  
                  // Handle simple URLs that need to be converted to buttons
                  if (cleanLine.startsWith('Read more:') && cleanLine.includes('http')) {
                    const url = cleanLine.replace('Read more: ', '');
                    return (
                      <div key={index} className="mb-3">
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                            isWelcome || !isBot 
                              ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 border border-white border-opacity-30' 
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Read Full Article
                        </a>
                      </div>
                    );
                  }
                  
                  // Handle bullet points with better styling
                  if (cleanLine.startsWith('•')) {
                    const text = cleanLine.substring(1).trim();
                    return (
                      <div key={index} className="flex items-start space-x-3 my-2">
                        <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${isWelcome || !isBot ? 'bg-blue-200' : 'bg-slate-500'}`}></span>
                        <span className={`${isWelcome || !isBot ? 'text-white' : 'text-slate-700'} text-sm leading-relaxed`}>
                          {text}
                        </span>
                      </div>
                    );
                  }
                  
                  // Handle numbered steps
                  if (cleanLine.match(/^\d+\.\s/) && cleanLine.length > 20 && !cleanLine.includes('http')) {
                    const number = cleanLine.match(/^\d+/)[0];
                    const text = cleanLine.replace(/^\d+\.\s/, '');
                    return (
                      <div key={index} className="flex items-start space-x-3 my-2">
                        <span className={`mt-0.5 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${isWelcome || !isBot ? 'bg-white bg-opacity-20 text-white' : 'bg-slate-100 text-slate-800'}`}>
                          {number}
                        </span>
                        <span className={`${isWelcome || !isBot ? 'text-white' : 'text-slate-700'} text-sm leading-relaxed`}>
                          {text}
                        </span>
                      </div>
                    );
                  }
                  
                  // Handle Stay Informed or conclusion text
                  if (cleanLine.includes('Stay Informed:') || cleanLine.includes('Stay informed:')) {
                    return (
                      <div key={index} className={`mt-4 p-3 rounded-lg ${isWelcome || !isBot ? 'bg-white bg-opacity-10' : 'bg-slate-50'}`}>
                        <p className={`text-sm font-medium ${isWelcome || !isBot ? 'text-blue-100' : 'text-slate-800'}`}>
                          💡 {cleanLine.replace('Stay Informed:', '').replace('Stay informed:', '').trim()}
                        </p>
                      </div>
                    );
                  }
                  
                  // Handle regular paragraphs
                  if (cleanLine && !cleanLine.startsWith('•') && !cleanLine.match(/^\d+\./)) {
                    return (
                      <p key={index} className={`mb-2 text-sm leading-relaxed ${isWelcome || !isBot ? 'text-white' : 'text-slate-800'}`}>
                        {cleanLine}
                      </p>
                    );
                  }
                  
                  return null;
                })}
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-opacity-20">
                <div className="flex items-center space-x-2">
                  {isBot && (
                    <>
                      <button
                        onClick={() => handleMessageReaction(message.id, 'like')}
                        className={`message-reaction-btn p-1 rounded-md transition-all duration-200 ${
                          message.reaction === 'like' 
                            ? 'bg-green-100 text-green-600' 
                            : 'hover:bg-white hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100'
                        }`}
                        title="Like this response"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMessageReaction(message.id, 'dislike')}
                        className={`message-reaction-btn p-1 rounded-md transition-all duration-200 ${
                          message.reaction === 'dislike' 
                            ? 'bg-red-100 text-red-600' 
                            : 'hover:bg-white hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100'
                        }`}
                        title="Dislike this response"
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => copyMessageToClipboard(message.content)}
                    className="message-reaction-btn p-1 rounded-md hover:bg-white hover:bg-opacity-20 text-white text-opacity-60 hover:text-opacity-100 transition-all duration-200"
                    title="Copy message"
                  >
                    <Copy size={12} />
                  </button>
                </div>
                
                <span className="text-xs opacity-60">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
            
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-4 suggestion-container">
                <p className="text-xs text-slate-500 font-medium mb-3 px-1">Suggested actions:</p>
                <div className="flex space-x-2 overflow-x-auto pb-2 suggestion-scroll-container scrollbar-hide">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(suggestion)}
                      className="suggestion-pill flex-shrink-0 px-4 py-2 rounded-full text-sm text-slate-700 hover:text-slate-800 font-medium whitespace-nowrap hover:shadow-md hover:scale-105 transition-all duration-200"
                      disabled={isLoading}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                {/* Scroll indicator for mobile */}
                {message.suggestions.length > 3 && (
                  <div className="flex justify-center mt-2 space-x-1 md:hidden">
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center animate-float z-50 hover:scale-110 ring-4 ring-slate-900/20"
        aria-label="Open Legal Assistant"
      >
        <Gavel size={24} />
      </button>
    );
  }

  return (
    <div 
      ref={chatContainerRef}
      className={`fixed z-50 transition-all duration-300 ease-in-out ${
        isMinimized 
          ? 'w-80 h-16 bottom-6 right-6' 
          : isFullscreen
            ? 'inset-0 w-full h-full'
            : 'w-[420px] h-[700px] bottom-6 right-6'
      }`}
    >
      <div 
        className={`w-full h-full bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden ${
          isFullscreen ? 'rounded-none' : ''
        }`}
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-15 rounded-full flex items-center justify-center backdrop-blur-md ring-2 ring-white/20">
              <Gavel size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-white">LegalVault AI Assistant</h3>
              {renderConnectionStatus()}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <Expand size={18} />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
              aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white" style={{ scrollbarWidth: 'thin' }}>
              {messages.length === 0 && showQuickActions && (
                  <div className="text-center py-12 px-6">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center shadow-xl ring-4 ring-slate-200">
                    <Gavel size={36} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">LegalVault AI Assistant</h3>
                  <p className="text-slate-600 mb-8 text-lg">How can I help you today?</p>
                  
                  <div className="space-y-3 max-w-sm mx-auto">
                    {suggestions.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage(suggestion)}
                        className="block w-full px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 border border-slate-200 hover:border-slate-400 rounded-xl text-slate-700 hover:text-slate-800 transition-all duration-200 text-left shadow-sm hover:shadow-lg hover:scale-105 font-medium"
                        disabled={isLoading}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-8">
                    <p className="text-sm text-slate-500 mb-4 font-medium">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => sendMessage(action.query)}
                          className="px-4 py-3 bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-lg text-sm text-slate-700 hover:text-slate-800 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 font-medium flex items-center justify-center gap-2"
                          disabled={isLoading}
                        >
                          {action.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="py-4">
                {messages.map(renderMessage)}
              </div>
              
              {typingIndicator && renderTypingIndicator()}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 p-4 bg-white">
              {connectionStatus === 'error' && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                  <span className="text-red-600 text-sm font-medium">Connection lost - Please check your internet</span>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-red-600 hover:text-red-700 transition-colors"
                    title="Refresh page"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              )}
              
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    disabled={isLoading || connectionStatus === 'disconnected'}
                    className="w-full p-4 pr-16 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 bg-slate-50 placeholder-slate-500 text-slate-900 font-medium"
                    rows="1"
                    style={{ 
                      minHeight: '56px', 
                      maxHeight: '140px',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: '15px',
                      lineHeight: '1.5'
                    }}
                  />
                  
                  {inputMessage.length > 0 && (
                    <div className="absolute bottom-2 right-2 text-xs text-slate-400 bg-white px-2 py-1 rounded">
                      {inputMessage.length}/500
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading || connectionStatus === 'disconnected'}
                  className="p-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center min-w-[56px] shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <RefreshCw size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
              
              {/* Quick actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearConversation}
                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors font-medium"
                  >
                    Clear Chat
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors font-medium"
                  >
                    {showQuickActions ? 'Hide' : 'Show'} Suggestions
                  </button>
                </div>
                
                <div className="text-xs text-slate-400 font-medium">
                  LegalVault AI Assistant
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatbotEnhanced;