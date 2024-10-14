import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Menu, Settings, HelpCircle, Activity, Bot, User, Sparkles, X } from 'lucide-react';

const API_KEY = 'AIzaSyD-kvFzEo9vFoChd8ymqUNJtw7zepYm83E';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deployLink, setDeployLink] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input }] }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from API');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.candidates[0].content.parts[0].text,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Simulate creating a new chatbot and generating a deploy link
      setTimeout(() => {
        setDeployLink(`https://example.com/chatbot-${Date.now()}`);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const newChat = () => {
    setMessages([]);
    setDeployLink('');
    setActiveTab('chat');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <>
            <div className={`flex-1 overflow-y-auto p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex mb-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      {message.role === 'user' ? (
                        <User className="w-5 h-5 mr-2" />
                      ) : (
                        <Bot className="w-5 h-5 mr-2" />
                      )}
                      <span className="font-semibold">
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className={`p-4 border-t ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <form onSubmit={handleSubmit} className="flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter a prompt to create a new chatbot..."
                  className={`flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  }`}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Send className="w-6 h-6" />
                  )}
                </button>
              </form>
              {deployLink && (
                <div className={`mt-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'}`}>
                  <p>New chatbot created! Deploy link: <a href={deployLink} target="_blank" rel="noopener noreferrer" className="underline">{deployLink}</a></p>
                </div>
              )}
            </div>
          </>
        );
      case 'help':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Help</h2>
            <p>Welcome to the Chatbot Creator AI! Here's how to use it:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Enter a prompt describing the chatbot you want to create.</li>
              <li>The AI will generate a response and create a new chatbot based on your input.</li>
              <li>You'll receive a deploy link for your new chatbot.</li>
              <li>Use the sidebar to start a new chat, toggle the theme, or view your activity.</li>
            </ul>
          </div>
        );
      case 'activity':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Activity</h2>
            <p>Here's a summary of your recent activity:</p>
            <ul className="list-disc pl-5 mt-2">
              {messages.map((message, index) => (
                <li key={index}>
                  {message.role === 'user' ? 'You: ' : 'Assistant: '}
                  {message.content.substring(0, 50)}...
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} transition-all duration-300 ease-in-out overflow-hidden fixed h-full z-20 md:relative`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Bot className="w-8 h-8 mr-2" />
              <h1 className="text-xl font-bold">Chatbot Creator</h1>
            </div>
            <button onClick={toggleSidebar} className="md:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav>
            <button onClick={newChat} className={`flex items-center w-full py-2 px-4 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
              <Sparkles className="w-5 h-5 mr-2" />
              New chat
            </button>
            <button onClick={toggleTheme} className={`flex items-center w-full py-2 px-4 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
              <Settings className="w-5 h-5 mr-2" />
              Toggle Theme
            </button>
            <button onClick={() => setActiveTab('help')} className={`flex items-center w-full py-2 px-4 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
              <HelpCircle className="w-5 h-5 mr-2" />
              Help
            </button>
            <button onClick={() => setActiveTab('activity')} className={`flex items-center w-full py-2 px-4 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
              <Activity className="w-5 h-5 mr-2" />
              Activity
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={`flex items-center justify-between p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b`}>
          <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold">AI Chatbot</h2>
          <div className="w-6 h-6"></div> {/* Placeholder for symmetry */}
        </header>

        {/* Content area */}
        {renderContent()}
      </div>
    </div>
  );
}

export default App;