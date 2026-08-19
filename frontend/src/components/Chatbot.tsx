'use client';

import React, { useState, useRef, useEffect } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am your VendorCheck AI. I can help you analyze risk scores, explain compliance flags, or summarize news about any company. How can I help today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = "I'm analyzing that request...";
      const lower = userMsg.toLowerCase();
      
      if (lower.includes('score') || lower.includes('trust')) {
        aiResponse = "The Trust Score is calculated in real-time across 6 data points: MCA21, GST, eCourts, NCLT, RBI, and News. Any critical flag (like 'Struck Off' or 'Wilful Defaulter') immediately drops the score to Critical Risk.";
      } else if (lower.includes('struck off')) {
        aiResponse = "A 'Struck Off' status means the Registrar of Companies has removed the company's name from the register, effectively making it defunct. You should NOT proceed with onboarding this vendor.";
      } else if (lower.includes('news') || lower.includes('media')) {
        aiResponse = "Our News scraper pulls the latest articles from Google News and uses sentiment analysis to flag 'Positive Growth' vs 'Adverse Risk' (fraud, scams, defaults).";
      } else {
        aiResponse = "I'm an AI assistant built to help with vendor due diligence. Based on the data on your screen, you can ask me to summarize the risk or explain any legal flags!";
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    }, 1000);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 9999,
      fontFamily: 'Outfit, Inter, sans-serif'
    }}>
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '350px',
          height: '500px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '1rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '1rem',
          overflow: 'hidden',
          animation: 'fadeUp 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            padding: '1rem',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }} />
              <span style={{ fontWeight: 800 }}>VendorCheck AI</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ×
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-app)' }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: m.role === 'user' ? '#6366f1' : 'var(--bg-surface)',
                color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                border: m.role === 'user' ? 'none' : '1px solid var(--border-color)',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                borderBottomRightRadius: m.role === 'user' ? '0.2rem' : '1rem',
                borderBottomLeftRadius: m.role === 'assistant' ? '0.2rem' : '1rem',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                {m.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this vendor..." 
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: input.trim() ? '#6366f1' : 'var(--bg-app)',
                color: '#fff',
                cursor: input.trim() ? 'pointer' : 'default',
                fontWeight: 800
              }}
            >
              →
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          float: 'right',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
      
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
