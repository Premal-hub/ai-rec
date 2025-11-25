'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from '../../components/ThemeToggle';
import LogoutButton from '../../components/LogoutButton';
import { api } from '../../utils/apiClient';

// ✅ Fix TypeScript errors for SpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function CareerPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Initialize session and user on page load
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const result = await api.verifyToken(token);
        if (!result.ok) return;

        setUserId(result.payload.sub);

        // Create a new session for career counselling
        const sessionRes = await api.post('/sessions', { duration: 0 }); // duration can be updated later
        if (sessionRes.ok) {
          setSessionId(sessionRes.session._id);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };

    initializeSession();
  }, []);

  // 🎙️ Voice input (Speech-to-Text)
  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.start();
    setListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  // 🧠 Send question to AI (streaming)
  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !sessionId || !userId) return;

    setAnswer('');
    setLoading(true);

    // Save user question to DB
    try {
      await api.post('/chats', {
        message: question,
        sender: 'user',
        sessionId,
        userId,
      });
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    try {
      const response = await fetch('http://localhost:5000/api/ai/counselling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.body) {
        setAnswer('⚠️ Failed to connect to AI model.');
        setLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const content = line.replace('data: ', '').trim();

          if (content === '[DONE]') {
            setLoading(false);
            const cleanFinal = cleanText(fullText);
            setAnswer(cleanFinal);
            speakText(cleanFinal);

            // Save AI response to DB
            try {
              await api.post('/chats', {
                message: cleanFinal,
                sender: 'bot',
                sessionId,
                userId,
              });
            } catch (error) {
              console.error('Error saving bot message:', error);
            }
            return;
          } else if (content && content !== '[ERROR]') {
            const fixedChunk = cleanText(content);
            fullText += (fullText.endsWith(' ') ? '' : ' ') + fixedChunk;
            setAnswer(cleanText(fullText));
          } else if (content === '[ERROR]') {
            setAnswer('⚠️ An error occurred while processing your request.');
            setLoading(false);
            return;
          } else if (content.startsWith('Ollama service is not running') || content.startsWith('Internal server error') || content.startsWith('Model not found')) {
            setAnswer(`⚠️ ${content}`);
            setLoading(false);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setAnswer('⚠️ Error connecting to AI model.');
      setLoading(false);
    }
  };

  // 🧹 Clean concatenated AI text
  const cleanText = (text: string): string => {
    return text
      .replace(/\s+/g, ' ') // collapse multiple spaces
      .replace(/([.,!?])(?=[^\s])/g, '$1 ') // ensure space after punctuation
      .replace(/\s([.,!?])/g, '$1') // remove space before punctuation
      .replace(/(\r\n|\n|\r)/g, ' ') // remove line breaks
      .replace(/\s{2,}/g, ' ') // remove double spaces
      .trim();
  };

  // 🔊 Speak text with natural pauses
  const speakText = (text: string) => {
    if (!text) return;

    const sentences = text.split(/(?<=[.!?])\s+/); // split by sentence endings
    sentences.forEach((sentence, i) => {
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      speechSynthesis.speak(utterance);
    });
  };

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [question, answer, loading]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 overflow-hidden flex flex-col">
      {/* Floating Blobs */}
      <div className="absolute -top-40 -left-32 w-[300px] h-[300px] bg-green-300/40 dark:bg-green-800/40 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] bg-purple-300/40 dark:bg-purple-800/40 rounded-full blur-2xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-300/20 dark:bg-blue-800/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-20 right-20 w-[200px] h-[200px] bg-yellow-300/30 dark:bg-yellow-800/30 rounded-full blur-2xl animate-pulse" />

      {/* Header Section */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="font-['Pacifico'] text-2xl text-gray-800 dark:text-white">Smart AI Counselling</h1>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                Career
              </span>
            </div>
            <div className="flex items-center gap-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Height */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex-1 flex flex-col max-w-5xl mx-auto px-6 py-6 w-full"
      >
        {/* Chat Section - Full Height */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200/30 dark:border-gray-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Career Counsellor</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Online • Ready to help</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={chatMessagesRef} className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              {/* AI Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start"
              >
                <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-md px-3 py-2 max-w-xs lg:max-w-md">
                  <p className="text-gray-800 dark:text-gray-200 text-sm">
                    👋 Hi! I'm your AI career counsellor. I'm here to help you explore career options, understand your strengths, and plan your professional future. What would you like to discuss today?
                  </p>
                </div>
              </motion.div>

              {/* User Message */}
              {question && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start justify-end"
                >
                  <div className="bg-blue-500 text-white rounded-2xl rounded-tr-md px-3 py-2 max-w-xs lg:max-w-md mr-2">
                    <p className="text-sm">{question}</p>
                  </div>
                  <div className="w-7 h-7 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 dark:text-gray-300 text-xs font-bold">You</span>
                  </div>
                </motion.div>
              )}

              {/* Loading Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start"
                >
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-md px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* AI Response */}
              {answer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start"
                >
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-md px-3 py-2 max-w-xs lg:max-w-md">
                    <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-line">{answer}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Input Section */}
          <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30">
            <form onSubmit={handleAsk} className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Type your career question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>
              <motion.button
                type="button"
                onClick={handleVoiceInput}
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  listening
                    ? 'bg-green-500 text-white animate-pulse'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                }`}
                title="Voice input - Click to speak your question"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </motion.button>
              <motion.button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                title="Send your question to the AI counsellor"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </form>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
