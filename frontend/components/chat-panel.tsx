'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, Sparkles } from 'lucide-react';
import { sendChatMessage } from '@/lib/api';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

export function ChatPanel({ context }: { context: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your NeuroSentinel assistant. How are you feeling today?", sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    
    setIsTyping(true);
    try {
      const reply = await sendChatMessage(userMsg, context);
      setMessages(prev => [...prev, { text: reply, sender: 'ai' }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the brain center right now.", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="mb-4 w-[380px] h-[500px] flex flex-col rounded-2xl border border-border overflow-hidden shadow-2xl"
            style={{ 
              background: 'rgba(15, 20, 25, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(59,130,246,0.1)'
            }}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-none">AI Assistant</h3>
                  <span className="text-[10px] text-primary font-medium uppercase tracking-wider">Online & Empathetic</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      msg.sender === 'user' ? 'bg-primary/20' : 'bg-secondary/20'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-muted/50 text-foreground border border-border rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3 rounded-2xl bg-muted/50 border border-border flex gap-1">
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me about sleep, stress, or your mood..."
                  className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 pr-12 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1.5 p-1.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg shadow-primary/25 relative"
      >
        <MessageCircle className="w-7 h-7 text-primary-foreground" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-pulse" />
      </motion.button>
    </div>
  );
}
